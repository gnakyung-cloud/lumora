import { Hono } from "hono";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "../database";
import { order, creditTx } from "../database/schema";
import { PRODUCTS, findProduct, createCheckout } from "../lib/autumn";
import { applyCreditDelta, getBalance } from "../lib/credits";
import { requireAuth, getUser, type AuthedUser } from "../middleware/requireAuth";

const CheckoutBody = z.object({ productId: z.string() });
const ConfirmFakeBody = z.object({ orderId: z.string() });

const billing = new Hono<{ Variables: { user: AuthedUser } }>();

/** 상품 카탈로그 — 공개 */
billing.get("/products", (c) => c.json({ products: PRODUCTS }));

billing.use("*", requireAuth);

/** 현재 크레딧 잔액 + 최근 거래 */
billing.get("/credits", async (c) => {
  const user = getUser(c);
  const balance = await getBalance(user.id);
  const txs = await db
    .select()
    .from(creditTx)
    .where(eq(creditTx.userId, user.id))
    .orderBy(desc(creditTx.createdAt))
    .limit(20);
  return c.json({ balance, transactions: txs });
});

/** Checkout 세션 생성 */
billing.post("/checkout", async (c) => {
  const parsed = CheckoutBody.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "invalid" }, 400);
  const product = findProduct(parsed.data.productId);
  if (!product) return c.json({ error: "unknown_product" }, 400);
  const user = getUser(c);

  const orderId = randomUUID();
  const base = process.env.WEBSITE_URL ?? "http://localhost:3000";
  const checkout = await createCheckout({
    userId: user.id,
    email: user.email,
    productId: product.id,
    successUrl: `${base}/billing/success?order=${orderId}`,
    cancelUrl: `${base}/billing/cancel?order=${orderId}`,
  });

  await db.insert(order).values({
    id: orderId,
    userId: user.id,
    productId: product.id,
    amountKrw: product.priceKrw,
    creditsGranted: product.credits,
    status: "pending",
    autumnCheckoutId: checkout.checkoutId,
  });

  return c.json({ orderId, checkoutUrl: checkout.checkoutUrl });
});

/** 로컬/페이크 모드 — Autumn 키 없을 때 수동으로 결제 완료 처리 */
billing.post("/confirm-fake", async (c) => {
  if (process.env.AUTUMN_SECRET_KEY) return c.json({ error: "only_in_fake_mode" }, 400);
  const parsed = ConfirmFakeBody.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "invalid" }, 400);
  const user = getUser(c);

  const [row] = await db
    .select()
    .from(order)
    .where(eq(order.id, parsed.data.orderId))
    .limit(1);
  if (!row || row.userId !== user.id) return c.json({ error: "not_found" }, 404);
  if (row.status === "paid") return c.json({ ok: true, alreadyPaid: true });

  await db
    .update(order)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(order.id, row.id));
  await applyCreditDelta({
    userId: user.id,
    delta: row.creditsGranted,
    reason: "purchase",
    refId: row.id,
  });
  return c.json({ ok: true });
});

/** 내 주문 이력 */
billing.get("/orders", async (c) => {
  const user = getUser(c);
  const rows = await db
    .select()
    .from(order)
    .where(eq(order.userId, user.id))
    .orderBy(desc(order.createdAt))
    .limit(50);
  return c.json({ items: rows });
});

export default billing;

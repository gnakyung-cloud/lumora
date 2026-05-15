import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { order } from "../database/schema";
import { applyCreditDelta } from "../lib/credits";

/**
 * Autumn webhook — checkout 완료 / 실패 시 호출.
 * 보안: AUTUMN_WEBHOOK_SECRET 헤더 검증 (Autumn 측 시그니처 스펙 확정 후 교체).
 */
const hook = new Hono();

hook.post("/", async (c) => {
  const secret = process.env.AUTUMN_WEBHOOK_SECRET;
  if (secret) {
    const provided = c.req.header("x-autumn-signature");
    if (provided !== secret) return c.json({ error: "invalid_signature" }, 401);
  }

  type Payload = {
    type: string;
    data: { checkout_id?: string; customer_id?: string; metadata?: { credits?: number } };
  };
  const body = (await c.req.json()) as Payload;

  if (body.type === "checkout.succeeded" && body.data.checkout_id) {
    const [row] = await db
      .select()
      .from(order)
      .where(eq(order.autumnCheckoutId, body.data.checkout_id))
      .limit(1);
    if (!row) return c.json({ ok: true, ignored: "order_not_found" });
    if (row.status === "paid") return c.json({ ok: true, alreadyPaid: true });

    await db
      .update(order)
      .set({
        status: "paid",
        paidAt: new Date(),
        autumnEventJson: body as never,
      })
      .where(eq(order.id, row.id));
    await applyCreditDelta({
      userId: row.userId,
      delta: row.creditsGranted,
      reason: "purchase",
      refId: row.id,
    });
  }

  if (body.type === "checkout.failed" && body.data.checkout_id) {
    await db
      .update(order)
      .set({ status: "failed", autumnEventJson: body as never })
      .where(eq(order.autumnCheckoutId, body.data.checkout_id));
  }

  return c.json({ ok: true });
});

export default hook;

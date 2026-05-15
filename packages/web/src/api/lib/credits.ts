import { db } from "../database";
import { credits, creditTx } from "../database/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export const CREDIT_COST = {
  generate_image_4: 4,
  generate_image_8: 8,
  generate_video_3s: 6,
  generate_video_5s: 10,
} as const;

export async function getBalance(userId: string): Promise<number> {
  const [row] = await db.select().from(credits).where(eq(credits.userId, userId)).limit(1);
  if (!row) return 0;
  return row.balance;
}

export async function ensureCreditsRow(userId: string): Promise<void> {
  await db
    .insert(credits)
    .values({ userId, balance: 0 })
    .onConflictDoNothing({ target: credits.userId });
}

type CreditReason = "purchase" | "generate_image" | "generate_video" | "refund" | "admin_grant" | "free_signup";

/** delta > 0 = 충전, delta < 0 = 사용. 실패하면 throw. */
export async function applyCreditDelta(opts: {
  userId: string;
  delta: number;
  reason: CreditReason;
  refId?: string;
}): Promise<{ balanceAfter: number }> {
  const { userId, delta, reason, refId } = opts;
  await ensureCreditsRow(userId);

  return await db.transaction(async (tx) => {
    const [row] = await tx.select().from(credits).where(eq(credits.userId, userId)).limit(1);
    const current = row?.balance ?? 0;
    const next = current + delta;
    if (next < 0) throw new Error(`Insufficient credits: have ${current}, need ${-delta}`);

    await tx
      .update(credits)
      .set({
        balance: next,
        lifetimeEarned: delta > 0 ? sql`${credits.lifetimeEarned} + ${delta}` : credits.lifetimeEarned,
        lifetimeSpent: delta < 0 ? sql`${credits.lifetimeSpent} + ${-delta}` : credits.lifetimeSpent,
        updatedAt: new Date(),
      })
      .where(eq(credits.userId, userId));

    await tx.insert(creditTx).values({
      id: randomUUID(),
      userId,
      delta,
      reason,
      refId,
      balanceAfter: next,
    });

    return { balanceAfter: next };
  });
}

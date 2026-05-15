import { Hono } from "hono";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../database";
import { video, generation } from "../database/schema";
import { createVideo, queryVideo, klingEnabled } from "../lib/kling";
import { applyCreditDelta, getBalance, CREDIT_COST } from "../lib/credits";
import { requireAuth, getUser, type AuthedUser } from "../middleware/requireAuth";

const Body = z.object({
  generationId: z.string(),
  selectedIndex: z.number().int().min(0),
  durationSec: z.union([z.literal(3), z.literal(5)]).default(5),
  motionPrompt: z.string().optional(),
});

const videoRoute = new Hono<{ Variables: { user: AuthedUser } }>().use("*", requireAuth);

/** 생성된 이미지 1장을 영상으로 업셀 */
videoRoute.post("/", async (c) => {
  if (!klingEnabled()) return c.json({ error: "kling_not_configured" }, 503);
  const parsed = Body.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "invalid", issues: parsed.error.issues }, 400);
  const input = parsed.data;
  const user = getUser(c);

  const [gen] = await db
    .select()
    .from(generation)
    .where(and(eq(generation.id, input.generationId), eq(generation.userId, user.id)))
    .limit(1);
  if (!gen) return c.json({ error: "generation_not_found" }, 404);
  if (gen.status !== "succeeded" || !gen.resultUrls) return c.json({ error: "generation_not_ready" }, 400);
  const sourceUrl = gen.resultUrls[input.selectedIndex];
  if (!sourceUrl) return c.json({ error: "index_out_of_range" }, 400);

  const cost = input.durationSec === 3 ? CREDIT_COST.generate_video_3s : CREDIT_COST.generate_video_5s;
  const balance = await getBalance(user.id);
  if (balance < cost) return c.json({ error: "insufficient_credits", need: cost, have: balance }, 402);

  const videoId = randomUUID();
  await db.insert(video).values({
    id: videoId,
    userId: user.id,
    generationId: gen.id,
    selectedIndex: input.selectedIndex,
    sourceImageUrl: sourceUrl,
    durationSec: input.durationSec,
    motionPrompt: input.motionPrompt,
    status: "processing",
    creditsCost: cost,
  });

  try {
    const result = await createVideo({
      imageUrl: sourceUrl,
      prompt: input.motionPrompt,
      durationSec: input.durationSec,
    });
    await applyCreditDelta({ userId: user.id, delta: -cost, reason: "generate_video", refId: videoId });
    await db.update(video).set({ providerJobId: result.taskId }).where(eq(video.id, videoId));
    return c.json({ id: videoId, status: "processing", taskId: result.taskId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(video)
      .set({ status: "failed", errorMessage: message, completedAt: new Date() })
      .where(eq(video.id, videoId));
    return c.json({ id: videoId, status: "failed", error: message }, 500);
  }
});

/** Kling 작업 상태 폴링 */
videoRoute.get("/:id", async (c) => {
  const user = getUser(c);
  const [row] = await db
    .select()
    .from(video)
    .where(and(eq(video.id, c.req.param("id")), eq(video.userId, user.id)))
    .limit(1);
  if (!row) return c.json({ error: "not_found" }, 404);

  if (row.status === "processing" && row.providerJobId) {
    try {
      const q = await queryVideo(row.providerJobId);
      if (q.status === "succeed" && q.videoUrl) {
        await db
          .update(video)
          .set({ status: "succeeded", resultUrl: q.videoUrl, completedAt: new Date() })
          .where(eq(video.id, row.id));
        return c.json({ ...row, status: "succeeded", resultUrl: q.videoUrl });
      }
      if (q.status === "failed") {
        await db
          .update(video)
          .set({ status: "failed", errorMessage: "Kling reported failure", completedAt: new Date() })
          .where(eq(video.id, row.id));
        return c.json({ ...row, status: "failed" });
      }
    } catch (err) {
      return c.json({ ...row, pollError: String(err) });
    }
  }
  return c.json(row);
});

videoRoute.get("/", async (c) => {
  const user = getUser(c);
  const rows = await db
    .select()
    .from(video)
    .where(eq(video.userId, user.id))
    .orderBy(desc(video.createdAt))
    .limit(50);
  return c.json({ items: rows });
});

export default videoRoute;

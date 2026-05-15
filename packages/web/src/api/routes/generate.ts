import { Hono } from "hono";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../database";
import { generation, photo } from "../database/schema";
import { PRESETS, findPreset, type Category } from "../lib/prompts";
import { generateImages } from "../lib/ai";
import { applyCreditDelta, getBalance, CREDIT_COST } from "../lib/credits";
import { requireAuth, getUser, type AuthedUser } from "../middleware/requireAuth";

const Body = z.object({
  category: z.enum(["Profile", "Editorial", "Body", "Hanbok"]),
  preset: z.string(),
  facePhotoId: z.string(),
  refOutfitId: z.string().optional(),
  refPoseId: z.string().optional(),
  refMoodId: z.string().optional(),
  count: z.union([z.literal(4), z.literal(8)]).default(4),
});

const generate = new Hono<{ Variables: { user: AuthedUser } }>();

/** 카테고리 + 프리셋 카탈로그 */
generate.get("/presets", (c) => c.json({ presets: PRESETS }));

generate.use("*", requireAuth);

/** 이미지 생성 작업 시작 (동기 — 결과까지 한 번에 반환) */
generate.post("/", async (c) => {
  const parsed = Body.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "invalid", issues: parsed.error.issues }, 400);
  const input = parsed.data;
  const user = getUser(c);

  const preset = findPreset(input.category as Category, input.preset);
  if (!preset) return c.json({ error: "unknown_preset" }, 400);

  const balance = await getBalance(user.id);
  const cost = input.count === 8 ? CREDIT_COST.generate_image_8 : CREDIT_COST.generate_image_4;
  if (balance < cost) return c.json({ error: "insufficient_credits", need: cost, have: balance }, 402);

  const photos = await db.select().from(photo).where(eq(photo.userId, user.id));
  const findOwned = (id: string | undefined) => (id ? photos.find((p) => p.id === id) : undefined);
  const face = findOwned(input.facePhotoId);
  if (!face || face.kind !== "face") return c.json({ error: "face_photo_required" }, 400);
  const refOutfit = findOwned(input.refOutfitId);
  const refPose = findOwned(input.refPoseId);
  const refMood = findOwned(input.refMoodId);

  const genId = randomUUID();
  await db.insert(generation).values({
    id: genId,
    userId: user.id,
    category: input.category,
    preset: input.preset,
    facePhotoId: face.id,
    refOutfitId: refOutfit?.id,
    refPoseId: refPose?.id,
    refMoodId: refMood?.id,
    count: input.count,
    status: "processing",
    creditsCost: cost,
  });

  try {
    const result = await generateImages({
      category: input.category as Category,
      preset: input.preset,
      faceImageUrl: face.url,
      refOutfitUrl: refOutfit?.url,
      refPoseUrl: refPose?.url,
      refMoodUrl: refMood?.url,
      count: input.count,
    });

    await applyCreditDelta({ userId: user.id, delta: -cost, reason: "generate_image", refId: genId });

    await db
      .update(generation)
      .set({
        status: "succeeded",
        resultUrls: result.urls,
        providerJob: result.raw as never,
        completedAt: new Date(),
      })
      .where(eq(generation.id, genId));

    return c.json({ id: genId, status: "succeeded", urls: result.urls });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(generation)
      .set({ status: "failed", errorMessage: message, completedAt: new Date() })
      .where(eq(generation.id, genId));
    return c.json({ id: genId, status: "failed", error: message }, 500);
  }
});

/** 내 생성 이력 */
generate.get("/", async (c) => {
  const user = getUser(c);
  const rows = await db
    .select()
    .from(generation)
    .where(eq(generation.userId, user.id))
    .orderBy(desc(generation.createdAt))
    .limit(50);
  return c.json({ items: rows });
});

generate.get("/:id", async (c) => {
  const user = getUser(c);
  const [row] = await db
    .select()
    .from(generation)
    .where(and(eq(generation.id, c.req.param("id")), eq(generation.userId, user.id)))
    .limit(1);
  if (!row) return c.json({ error: "not_found" }, 404);
  return c.json(row);
});

export default generate;

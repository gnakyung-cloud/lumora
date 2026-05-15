import { Hono } from "hono";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "../database";
import { photo } from "../database/schema";
import { presignUpload, publicObjectUrl, r2Enabled } from "../lib/r2";
import { requireAuth, getUser, type AuthedUser } from "../middleware/requireAuth";

const PhotoKind = z.enum(["face", "ref_outfit", "ref_pose", "ref_mood"]);

const SignBody = z.object({
  kind: PhotoKind,
  mimeType: z.string().regex(/^image\//),
  bytes: z.number().int().positive().max(20 * 1024 * 1024),
});

const ConfirmBody = z.object({
  kind: PhotoKind,
  r2Key: z.string().min(1),
  mimeType: z.string().regex(/^image\//),
  bytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const upload = new Hono<{ Variables: { user: AuthedUser } }>().use("*", requireAuth);

/** 1) 클라이언트가 presigned URL 요청 */
upload.post("/sign", async (c) => {
  if (!r2Enabled()) return c.json({ error: "r2_not_configured" }, 503);
  const parsed = SignBody.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "invalid", issues: parsed.error.issues }, 400);

  const user = getUser(c);
  const ext = parsed.data.mimeType.split("/")[1] ?? "jpg";
  const r2Key = `users/${user.id}/${parsed.data.kind}/${Date.now()}-${randomUUID()}.${ext}`;
  const uploadUrl = await presignUpload(r2Key, parsed.data.mimeType);

  return c.json({ uploadUrl, r2Key, publicUrl: publicObjectUrl(r2Key) });
});

/** 2) 클라이언트가 R2에 PUT 완료 후 DB에 등록 */
upload.post("/confirm", async (c) => {
  const parsed = ConfirmBody.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "invalid", issues: parsed.error.issues }, 400);

  const user = getUser(c);
  const id = randomUUID();
  await db.insert(photo).values({
    id,
    userId: user.id,
    kind: parsed.data.kind,
    r2Key: parsed.data.r2Key,
    url: publicObjectUrl(parsed.data.r2Key),
    width: parsed.data.width,
    height: parsed.data.height,
    bytes: parsed.data.bytes,
    mimeType: parsed.data.mimeType,
  });

  return c.json({ id, url: publicObjectUrl(parsed.data.r2Key) });
});

export default upload;

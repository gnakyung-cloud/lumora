import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/* ─── Better Auth ────────────────────────────────────────────────────────── */
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

/* ─── Lumora 도메인 ──────────────────────────────────────────────────────── */

export const photo = sqliteTable("photo", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["face", "ref_outfit", "ref_pose", "ref_mood"] }).notNull(),
  r2Key: text("r2_key").notNull(),
  url: text("url").notNull(),
  width: integer("width"),
  height: integer("height"),
  bytes: integer("bytes"),
  mimeType: text("mime_type"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const generation = sqliteTable("generation", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  category: text("category", { enum: ["Profile", "Editorial", "Body", "Hanbok"] }).notNull(),
  preset: text("preset").notNull(),
  facePhotoId: text("face_photo_id").notNull().references(() => photo.id),
  refOutfitId: text("ref_outfit_id").references(() => photo.id),
  refPoseId: text("ref_pose_id").references(() => photo.id),
  refMoodId: text("ref_mood_id").references(() => photo.id),
  count: integer("count").notNull().default(4),
  status: text("status", { enum: ["pending", "processing", "succeeded", "failed"] }).notNull().default("pending"),
  providerJob: text("provider_job", { mode: "json" }),
  errorMessage: text("error_message"),
  resultUrls: text("result_urls", { mode: "json" }).$type<string[]>(),
  creditsCost: integer("credits_cost").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const video = sqliteTable("video", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  generationId: text("generation_id").notNull().references(() => generation.id, { onDelete: "cascade" }),
  selectedIndex: integer("selected_index").notNull(),
  sourceImageUrl: text("source_image_url").notNull(),
  model: text("model").notNull().default("kling-1.6-std"),
  durationSec: integer("duration_sec").notNull().default(5),
  motionPrompt: text("motion_prompt"),
  status: text("status", { enum: ["pending", "processing", "succeeded", "failed"] }).notNull().default("pending"),
  providerJobId: text("provider_job_id"),
  resultUrl: text("result_url"),
  errorMessage: text("error_message"),
  creditsCost: integer("credits_cost").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const credits = sqliteTable("credits", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  lifetimeEarned: integer("lifetime_earned").notNull().default(0),
  lifetimeSpent: integer("lifetime_spent").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const creditTx = sqliteTable("credit_tx", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason", { enum: ["purchase", "generate_image", "generate_video", "refund", "admin_grant", "free_signup"] }).notNull(),
  refId: text("ref_id"),
  balanceAfter: integer("balance_after").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const order = sqliteTable("order", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  amountKrw: integer("amount_krw").notNull(),
  creditsGranted: integer("credits_granted").notNull().default(0),
  status: text("status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  autumnCheckoutId: text("autumn_checkout_id"),
  autumnEventJson: text("autumn_event_json", { mode: "json" }),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type User = typeof user.$inferSelect;
export type Photo = typeof photo.$inferSelect;
export type Generation = typeof generation.$inferSelect;
export type Video = typeof video.$inferSelect;
export type Credits = typeof credits.$inferSelect;
export type CreditTx = typeof creditTx.$inferSelect;
export type Order = typeof order.$inferSelect;

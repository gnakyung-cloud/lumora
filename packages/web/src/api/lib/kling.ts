/**
 * Kling AI 영상 생성 (image-to-video).
 * https://docs.qingque.cn/d/home/eZQApbK35ZRwIYL1aTyHV7DiH
 * JWT 인증 — access key + secret key로 HS256 토큰 발급.
 */

import { createHmac } from "node:crypto";

const accessKey = process.env.KLING_ACCESS_KEY;
const secretKey = process.env.KLING_SECRET_KEY;
const baseURL = "https://api.klingai.com";

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function jwt(): string {
  if (!accessKey || !secretKey) throw new Error("Kling not configured");
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 }));
  const sig = base64url(createHmac("sha256", secretKey).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${sig}`;
}

export function klingEnabled(): boolean {
  return Boolean(accessKey && secretKey);
}

export interface CreateVideoInput {
  imageUrl: string;
  prompt?: string;
  durationSec: 3 | 5;
  model?: "kling-v1" | "kling-v1-6" | "kling-v2";
}

export interface CreateVideoResult {
  taskId: string;
  raw: unknown;
}

export async function createVideo(input: CreateVideoInput): Promise<CreateVideoResult> {
  const res = await fetch(`${baseURL}/v1/videos/image2video`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt()}` },
    body: JSON.stringify({
      model_name: input.model ?? "kling-v1-6",
      image: input.imageUrl,
      prompt: input.prompt ?? "subtle natural motion, soft breathing, gentle hair sway, cinematic",
      duration: String(input.durationSec),
      mode: "std",
    }),
  });
  if (!res.ok) throw new Error(`Kling create error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: { task_id: string } };
  return { taskId: json.data.task_id, raw: json };
}

export interface QueryVideoResult {
  status: "submitted" | "processing" | "succeed" | "failed";
  videoUrl?: string;
  raw: unknown;
}

export async function queryVideo(taskId: string): Promise<QueryVideoResult> {
  const res = await fetch(`${baseURL}/v1/videos/image2video/${taskId}`, {
    headers: { Authorization: `Bearer ${jwt()}` },
  });
  if (!res.ok) throw new Error(`Kling query error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    data: { task_status: string; task_result?: { videos?: Array<{ url: string }> } };
  };
  const statusMap: Record<string, QueryVideoResult["status"]> = {
    submitted: "submitted",
    processing: "processing",
    succeed: "succeed",
    failed: "failed",
  };
  return {
    status: statusMap[json.data.task_status] ?? "processing",
    videoUrl: json.data.task_result?.videos?.[0]?.url,
    raw: json,
  };
}

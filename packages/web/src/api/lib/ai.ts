/**
 * AI 이미지 생성 추상화.
 * 우선순위: Runable AI Gateway → OpenAI (DALL-E 3 / GPT Image 1) 직접.
 * 페이스 보존이 핵심이라 reference image 기반 모델(Flux Kontext, Higgsfield Soul)이 이상적이지만
 * 여기서는 표준 text-to-image 인터페이스 정의. 추후 Runable이 어떤 모델 라우팅하는지 확인 후 교체.
 */

import { findPreset, type Category } from "./prompts";

const gwBase = process.env.AI_GATEWAY_BASE_URL;
const gwKey = process.env.AI_GATEWAY_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

export interface GenerateImageInput {
  category: Category;
  preset: string;
  faceImageUrl: string;
  refOutfitUrl?: string;
  refPoseUrl?: string;
  refMoodUrl?: string;
  count: number;
}

export interface GenerateImageResult {
  urls: string[];
  raw: unknown;
}

export async function generateImages(input: GenerateImageInput): Promise<GenerateImageResult> {
  const def = findPreset(input.category, input.preset);
  if (!def) throw new Error(`Unknown preset: ${input.category}/${input.preset}`);

  const refs = [input.faceImageUrl, input.refOutfitUrl, input.refPoseUrl, input.refMoodUrl].filter(
    (x): x is string => typeof x === "string" && x.length > 0
  );

  if (gwBase && gwKey) return await callGateway(def.prompt, def.aspectRatio, input.count, refs);
  if (openaiKey) return await callOpenAI(def.prompt, input.count);
  throw new Error("No image provider configured (AI_GATEWAY_* or OPENAI_API_KEY required)");
}

async function callGateway(
  prompt: string,
  aspectRatio: string,
  count: number,
  references: string[]
): Promise<GenerateImageResult> {
  const res = await fetch(`${gwBase!.replace(/\/$/, "")}/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${gwKey}` },
    body: JSON.stringify({
      model: "flux-1.1-pro",
      prompt,
      n: count,
      size: aspectRatioToSize(aspectRatio),
      reference_images: references,
    }),
  });
  if (!res.ok) throw new Error(`AI Gateway error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: Array<{ url: string }> };
  return { urls: json.data.map((d) => d.url), raw: json };
}

async function callOpenAI(prompt: string, count: number): Promise<GenerateImageResult> {
  const urls: string[] = [];
  const raws: unknown[] = [];
  for (let i = 0; i < count; i++) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1792", quality: "hd" }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { data: Array<{ url: string }> };
    urls.push(json.data[0].url);
    raws.push(json);
  }
  return { urls, raw: raws };
}

function aspectRatioToSize(ratio: string): string {
  switch (ratio) {
    case "1:1": return "1024x1024";
    case "3:4": return "1024x1344";
    case "4:3": return "1344x1024";
    case "9:16": return "768x1344";
    case "16:9": return "1344x768";
    default: return "1024x1024";
  }
}

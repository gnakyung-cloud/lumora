/**
 * Lumora 카테고리별 시스템 프롬프트.
 * 옵시디언 시크릿 프롬프트 뱅크에서 도출 — 사용자에게 노출 X.
 * 핵심: 얼굴 보존 + natural Korean facial features + no AI beautification.
 */

const FACE_PRESERVATION = [
  "preserve the exact facial features, bone structure, eye shape, and skin tone of the reference person",
  "natural Korean facial features, no AI beautification, no plastic surgery look",
  "skin texture must be realistic — visible pores, subtle imperfections, natural lighting on skin",
  "no over-smoothing, no airbrushing, no eye enlargement",
].join(", ");

const QUALITY_TAIL = "hyperrealistic, 8k, sharp focus on face, professional photography, natural depth of field";

export type Category = "Profile" | "Editorial" | "Body" | "Hanbok";

export interface PresetDef {
  preset: string;
  label: string;
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export const PRESETS: Record<Category, PresetDef[]> = {
  Profile: [
    {
      preset: "passport",
      label: "증명·여권",
      prompt: `passport-style headshot, plain pure white background #FFFFFF, neutral expression, head facing straight forward, eyes open and looking at camera, ears visible, shoulders square, even soft lighting from front, no shadow on background, business attire neutral color, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
    {
      preset: "suit",
      label: "정장 프로필",
      prompt: `corporate executive portrait, charcoal or navy tailored suit, crisp white shirt, subtle confident expression, soft studio lighting with key light at 45 degrees, premium grey-to-black gradient backdrop, sharp tailoring, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
    {
      preset: "linkedin",
      label: "LinkedIn 헤드샷",
      prompt: `modern LinkedIn professional headshot, smart casual blazer or knit top, approachable warm smile, natural daylight, clean blurred office or neutral background, eye contact with camera, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "1:1",
    },
    {
      preset: "resume",
      label: "이력서",
      prompt: `polite resume photograph, gentle closed-mouth smile, business attire, soft natural studio lighting, clean light-grey background, slight three-quarter angle, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
  ],
  Editorial: [
    {
      preset: "fashion_magazine",
      label: "패션 매거진",
      prompt: `editorial fashion magazine cover, dramatic side lighting, luxury designer clothing, confident high-fashion pose, magazine-style art direction, Vogue Korea aesthetic, film grain, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
    {
      preset: "beauty_campaign",
      label: "뷰티 캠페인",
      prompt: `luxury beauty campaign close-up, glossy lips, glowing dewy skin, soft beauty dish lighting, minimal pastel background, subtle gold accents, premium cosmetics ad aesthetic, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "1:1",
    },
    {
      preset: "street_style",
      label: "스트리트 스타일",
      prompt: `seoul street style fashion editorial, candid walking shot, sunlit afternoon, motion blur in background, trendy contemporary outfit, urban architecture, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
  ],
  Body: [
    {
      preset: "fitness",
      label: "피트니스 바디",
      prompt: `fitness body profile, athletic toned physique, sportswear or tank top, dramatic gym lighting from above, dark moody background, professional fitness photography, defined muscle tone but natural, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
    {
      preset: "swimwear",
      label: "수영복·바디",
      prompt: `editorial swimwear portrait, beach or infinity pool setting, golden hour lighting, confident pose, modest tasteful framing focused on face and torso, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
    {
      preset: "underwater",
      label: "수중 화보",
      prompt: `underwater editorial portrait, flowing fabric, light rays piercing through water surface, ethereal blue-green tones, hair drifting, calm expression, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
  ],
  Hanbok: [
    {
      preset: "traditional",
      label: "전통 한복",
      prompt: `traditional Korean hanbok portrait, vibrant jeogori and chima with hand-embroidered floral details, gyeongbokgung palace or hanok courtyard backdrop, soft late afternoon sunlight, dignified composed posture, traditional norigae accessory, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
    {
      preset: "modern_hanbok",
      label: "모던 한복",
      prompt: `modern reinterpreted hanbok fashion, minimalist silhouette in muted earth tones, contemporary K-style, neutral studio backdrop, editorial fashion lighting, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
    {
      preset: "wedding_hanbok",
      label: "혼례 한복",
      prompt: `Korean wedding hanbok portrait, ornate hwarot ceremonial robe with gold thread embroidery, jokduri headpiece, traditional makeup with red yeonji on cheeks, palace interior with paper lanterns, warm candle lighting, ${FACE_PRESERVATION}, ${QUALITY_TAIL}`,
      aspectRatio: "3:4",
    },
  ],
};

export function findPreset(category: Category, preset: string): PresetDef | undefined {
  return PRESETS[category]?.find((p) => p.preset === preset);
}

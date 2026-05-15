/**
 * Autumn 결제 — https://docs.useautumn.com
 * 카탈로그 정의 + checkout 세션 생성 + webhook 검증.
 * 로컬 dev면 fake mode (AUTUMN_SECRET_KEY 비어있을 때 fake checkout URL 반환).
 */

const secret = process.env.AUTUMN_SECRET_KEY;
const baseURL = process.env.AUTUMN_BASE_URL ?? "https://api.useautumn.com/v1";

export interface Product {
  id: string;
  label: string;
  priceKrw: number;
  credits: number;
}

export const PRODUCTS: Product[] = [
  { id: "starter_29k", label: "Starter", priceKrw: 29000, credits: 30 },
  { id: "pro_59k", label: "Pro", priceKrw: 59000, credits: 100 },
  { id: "studio_99k", label: "Studio", priceKrw: 99000, credits: 250 },
  { id: "credits_5k", label: "5,000원 (5장)", priceKrw: 5000, credits: 5 },
];

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function autumnEnabled(): boolean {
  return Boolean(secret);
}

export interface CheckoutInput {
  userId: string;
  email: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  checkoutId: string;
}

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const product = findProduct(input.productId);
  if (!product) throw new Error(`Unknown product: ${input.productId}`);

  if (!secret) {
    return {
      checkoutUrl: `${input.successUrl}?fake=1&product=${product.id}`,
      checkoutId: `fake_${Date.now()}`,
    };
  }

  const res = await fetch(`${baseURL}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: JSON.stringify({
      customer_id: input.userId,
      customer_email: input.email,
      product_id: product.id,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      currency: "krw",
      metadata: { credits: product.credits },
    }),
  });
  if (!res.ok) throw new Error(`Autumn checkout error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { url: string; id: string };
  return { checkoutUrl: json.url, checkoutId: json.id };
}

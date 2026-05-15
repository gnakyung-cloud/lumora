import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import upload from "./routes/upload";
import generate from "./routes/generate";
import video from "./routes/video";
import billing from "./routes/billing";
import autumnWebhook from "./routes/autumnWebhook";
import { applyCreditDelta, ensureCreditsRow, getBalance } from "./lib/credits";

const app = new Hono()
  .basePath("api")
  .use(
    cors({
      origin: (origin) => origin ?? "*",
      credentials: true,
      exposeHeaders: ["set-auth-token"],
    })
  )
  .get("/ping", (c) => c.json({ message: `Pong! ${Date.now()}` }))
  .get("/health", (c) => c.json({ status: "ok" }))
  .on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
  .get("/me", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) return c.json({ user: null }, 200);
    await ensureCreditsRow(session.user.id);
    const balance = await getBalance(session.user.id);
    if (balance === 0) {
      try {
        await applyCreditDelta({
          userId: session.user.id,
          delta: 5,
          reason: "free_signup",
          refId: "welcome",
        });
      } catch {
        /* 동시성 충돌은 무시 */
      }
    }
    return c.json({
      user: { id: session.user.id, email: session.user.email, name: session.user.name },
      credits: await getBalance(session.user.id),
    });
  })
  .route("/upload", upload)
  .route("/generate", generate)
  .route("/video", video)
  .route("/billing", billing)
  .route("/webhooks/autumn", autumnWebhook);

export type AppType = typeof app;
export default app;

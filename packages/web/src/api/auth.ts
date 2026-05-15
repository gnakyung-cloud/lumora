import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database";
import * as schema from "./database/schema";

const baseURL = process.env.WEBSITE_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: process.env.GOOGLE_CLIENT_ID
      ? {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
      : undefined,
    kakao: process.env.KAKAO_CLIENT_ID
      ? {
          clientId: process.env.KAKAO_CLIENT_ID,
          clientSecret: process.env.KAKAO_CLIENT_SECRET!,
        }
      : undefined,
  } as never,
  trustedOrigins: [baseURL],
  advanced: {
    cookiePrefix: "lumora",
  },
});

export type Auth = typeof auth;

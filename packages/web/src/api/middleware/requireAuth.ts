import type { Context, MiddlewareHandler } from "hono";
import { auth } from "../auth";

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
}

export const requireAuth: MiddlewareHandler<{
  Variables: { user: AuthedUser };
}> = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: "unauthorized" }, 401);
  c.set("user", { id: session.user.id, email: session.user.email, name: session.user.name ?? "" });
  await next();
};

export function getUser(c: Context): AuthedUser {
  return c.get("user") as AuthedUser;
}

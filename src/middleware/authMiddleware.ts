import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { validateSessionToken } from "../utils/sessions";

export const sessionAuth = createMiddleware<{
  Variables: {
    user: {
      id: string;
      email: string;
      username: string;
    } | null;
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
    } | null;
  };
}>(async (c, next) => {
  const sessionToken = getCookie(c, "session");
  //   console.log(sessionToken, 22);
  console.log(sessionToken, 22);
  if (sessionToken !== undefined) {
    const result = await validateSessionToken(sessionToken as string);

    if (result === null) {
      c.set("user", null);
      c.set("session", null);
      return c.json({ message: "You are not authorized" }, 403);

    } else {
      const { session, user } = result as any;
      c.set("user", user);
      c.set("session", session);
      await next();
    }
  } else {
    c.set("user", null);
    c.set("session", null);
    return c.json({ message: "You are not authorized" }, 403);
  }

  
});

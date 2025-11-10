"server-only";
import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import { HTTPException } from "hono/http-exception";
import { TSession } from "@/types";

type Env = {
  Variables: {
    user: TSession["user"];
  };
};

export const getAuthUser = createMiddleware<Env>(async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) {
      throw new HTTPException(401, { message: "unauthorized" });
    }
    c.set("user", session.user);
    await next();
  } catch (error) {
    console.log(error);
    throw new HTTPException(401, { message: "unauthorized" });
  }
});

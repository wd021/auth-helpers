import { createCookieSessionStorage } from "remix";

const MAX_AGE = 60 * 60 * 8;

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "sb:token",
      maxAge: MAX_AGE,
      expires: new Date(Date.now() + MAX_AGE * 1000), // 8 hours
      domain: "",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: true,
      secrets: ["supabase is the dopest"],
    },
  });

const getAccessTokenFromRequest = async (request) => {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("accessToken");
};

export { getSession, commitSession, destroySession, getAccessTokenFromRequest };

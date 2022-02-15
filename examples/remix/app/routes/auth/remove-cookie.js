import { redirect } from "remix";
import { getSession, destroySession } from "~/utils/cookie";

export const action = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const cookie = await destroySession(session);

  return redirect("/login", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};

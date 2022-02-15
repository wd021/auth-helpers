import { redirect } from "remix";
import { getSession, commitSession } from "~/utils/cookie";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const accessToken = formData.get("accessToken");
  const session = await getSession();
  session.set("accessToken", accessToken);
  const cookie = await commitSession(session);

  return redirect("/channels", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};

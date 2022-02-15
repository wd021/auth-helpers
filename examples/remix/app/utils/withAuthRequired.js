import { getAccessTokenFromRequest } from "~/utils/cookie";
import supabase from "~/utils/supabase";
import { redirect } from "remix";

export default (fn) => async (context) => {
  const accessToken = await getAccessTokenFromRequest(context.request);
  const { user } = await supabase.auth.api.getUser(accessToken);

  if (!user) {
    return redirect("/login");
  }

  return await fn({ ...context, user, accessToken });
};

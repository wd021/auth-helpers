import { useLoaderData } from "remix";
import supabase from "~/utils/supabase";
import withAuthRequired from "~/utils/withAuthRequired";

export const loader = withAuthRequired(async ({ accessToken, user }) => {
  supabase.auth.setAuth(accessToken);
  // get profile for user

  return { user };
});

export default () => {
  const { user } = useLoaderData();
  return <p>Dashboard</p>;
};

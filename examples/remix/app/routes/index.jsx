import { useLoaderData, Link } from "remix";
import { getAccessTokenFromRequest } from "~/utils/cookie";
import supabase from "~/utils/supabase";

export const loader = async ({ request }) => {
  const accessToken = await getAccessTokenFromRequest(request);
  const { user } = await supabase.auth.api.getUser(accessToken);

  return { user };
};

export default () => {
  const { user } = useLoaderData();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-800 text-white text-center">
      {user ? (
        <>
          <h1 className="text-2xl">Welcome!</h1>
          <Link to="/channels">Go to channels 👉</Link>
        </>
      ) : (
        <>
          <h1 className="text-2xl">You need to sign in!</h1>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  );
};

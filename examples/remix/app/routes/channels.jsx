import supabase from "~/utils/supabase";
import { Link, Outlet, useLoaderData, useLocation } from "remix";
import withAuthRequired from "~/utils/withAuthRequired";
import Container from "~/components/container";
import Left from "~/components/left";

export const loader = withAuthRequired(async ({ accessToken }) => {
  supabase.auth.setAuth(accessToken);

  const { data: channels } = await supabase.from("channels").select("*");

  return {
    channels,
  };
});

export default () => {
  const { channels } = useLoaderData();
  const location = useLocation();

  return (
    <Container>
      <Left>
        <Link to="/channels" className="text-2xl border-b py-4">
          Channels
        </Link>
        <div className="flex-1">
          {channels.map((channel) => (
            <p key={channel.id} className="p-2 border-b">
              <Link to={`/channels/${channel.id}`}># {channel.title}</Link>
            </p>
          ))}
        </div>
        <Link to="/logout" className="self-center">
          Logout
        </Link>
      </Left>
      {location.pathname === "/channels" ? (
        <div className="flex-1 flex items-center justify-center text-center">
          👈 Choose a channel
        </div>
      ) : null}
      <Outlet />
    </Container>
  );
};

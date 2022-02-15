import supabase from "~/utils/supabase";
import { useLoaderData, Form, useFetcher, useTransition } from "remix";
import withAuthRequired from "~/utils/withAuthRequired";
import { useEffect, useState, useRef } from "react";
import Right from "~/components/right";
import Likes from "../../components/likes";

export const loader = withAuthRequired(
  async ({ user, accessToken, params: { id } }) => {
    supabase.auth.setAuth(accessToken);

    const { data: channel, error } = await supabase
      .from("channels")
      .select("*, messages(*, profiles(*))")
      .match({ id })
      .order("created_at", { foreignTable: "messages" })
      .single();

    console.log({ error });

    return {
      channel,
      user,
    };
  }
);

export const action = withAuthRequired(
  async ({ request, user, accessToken, params: { id } }) => {
    const formData = await request.formData();
    const message = formData.get("message");

    supabase.auth.setAuth(accessToken);

    await supabase
      .from("messages")
      .insert([{ content: message, channel_id: id, user_id: user.id }]);

    return null;
  }
);

export default () => {
  const { channel, user } = useLoaderData();
  const fetcher = useFetcher();
  const [messages, setMessages] = useState([...channel.messages]);
  const formRef = useRef();
  const messagesRef = useRef();
  const transition = useTransition();

  useEffect(() => {
    if (transition.state !== "submitting") {
      formRef.current?.reset();
    }
  }, [transition.state]);

  useEffect(() => {
    supabase
      .from(`messages:channel_id=eq.${channel.id}`)
      .on("*", () => {
        fetcher.load(`/channels/${channel.id}`);
      })
      .subscribe();
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setMessages([...fetcher.data.channel.messages]);
    }
  }, [fetcher.data]);

  useEffect(() => {
    setMessages([...channel.messages]);
  }, [channel]);

  useEffect(() => {
    messagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  return (
    <Right>
      <h1 className="text-2xl py-4 uppercase">{channel.title}</h1>
      <p className="pb-8 border-b border-gray-300">{channel.description}</p>
      <div className="flex-1 flex flex-col overflow-auto p-2">
        <div ref={messagesRef} className="mt-auto">
          {messages.map((message) => (
            <p
              key={message.id}
              className={`p-2 ${
                message.user_id === user.id ? "text-right" : ""
              }`}
            >
              {message.content}
              <span className="block text-xs text-gray-400">
                {message.profiles.email}
              </span>
              <Likes messageId={message.id} likes={message.likes} />
            </p>
          ))}
        </div>
      </div>
      <Form ref={formRef} method="post" className="flex w-full">
        <input name="message" className="border border-gray-200 flex-1 px-2" />
        <button className="ml-4 bg-blue-200 py-2 px-4">Send</button>
      </Form>
    </Right>
  );
};

import supabase from "~/utils/supabase";

export default ({ messageId, likes }) => {
  const handleIncrement = async () => {
    await supabase.rpc("increment_likes", {
      message_id: messageId,
    });
  };

  return (
    <span className="block text-xs text-gray-500">
      {likes} likes <button onClick={handleIncrement}>👍</button>
    </span>
  );
};

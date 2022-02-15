import supabase from "~/utils/supabase";
import { useEffect } from "react";

export default () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-800 text-white text-center">
      <p>Logging out</p>;
    </div>
  );
};

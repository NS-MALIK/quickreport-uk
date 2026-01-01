"use client";
import { supabase } from "@/lib/supabase";

export default function AuthButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <button 
      onClick={handleLogin}
      className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all"
    >
      Sign in with Google
    </button>
  );
}
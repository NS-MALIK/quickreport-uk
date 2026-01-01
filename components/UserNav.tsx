"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-100 rounded-full transition-all border"
      >
        <img 
          src={user.user_metadata.avatar_url} 
          alt="Profile" 
          className="w-8 h-8 rounded-full border border-blue-200"
        />
        <span className="text-sm font-medium text-slate-700 hidden md:block">
          {user.user_metadata.full_name.split(' ')[0]}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in duration-150">
          <div className="px-4 py-2 border-b mb-2">
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}
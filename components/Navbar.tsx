"use client";
import React from "react";
import Link from "next/link";
import { HardHat } from "lucide-react";
import UserNav from "@/components/UserNav";
import AuthButton from "@/components/AuthButton";

// We make user optional with '?' to prevent TypeScript errors during initial load
interface NavbarProps {
  user?: any; 
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="p-6 border-b bg-white flex justify-between items-center sticky top-0 z-50">
      {/* Logo / Brand */}
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700 hover:opacity-90 transition-opacity">
        <HardHat size={28} /> 
        QuickReport UK
      </Link>

      {/* Navigation Links - Same styles as your page.tsx */}
      <div className="hidden md:flex items-center gap-8 px-6">
        <Link 
          href="/features" 
          className="text-sm font-black text-slate-600 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          Features
        </Link>
        <Link 
          href="/compliance" 
          className="text-sm font-black text-slate-600 uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          Compliance
        </Link>
        <Link 
          href="/pricing" 
          className="text-sm font-black text-slate-900 underline decoration-blue-500 underline-offset-4 uppercase tracking-widest hover:decoration-blue-700 transition-all"
        >
          Pricing
        </Link>
      </div>

      {/* Authentication and Profile Section */}
      <div className="flex items-center gap-4">
        {/* UserNav handles the profile dropdown when a user is logged in */}
        <UserNav /> 
        
        {/* AuthButton (Sign In) only shows if there is no user */}
        {!user && <AuthButton />} 
      </div>
    </nav>
  );
}
"use client";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import UserNav from "@/components/UserNav";
import Navbar from "@/components/Navbar";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";




const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "QuickReport UK | AI Site Reporting Tool for HSE Managers",
//   description: "Automate UK construction site reports with AI. Convert voice to PDF instantly. HSE compliant, GDPR secure, and built for UK engineers.",
//   keywords: ["AI site reports", "HSE reporting tool UK", "construction site notes to PDF", "voice to report AI"],
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 2. Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body>
        {/* Now we pass the user state to the Navbar inside the layout */}
        <Navbar user={user} /> 
        
        {children}
        
        <Footer />
      </body>
    </html>
  );
}
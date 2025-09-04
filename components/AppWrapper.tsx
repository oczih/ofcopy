"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Creator, User } from "@/app/types";
import { Session } from "next-auth";
import Link from "next/link";
import { Home, Bell, MessageCircle, UserCircle } from "lucide-react";
import Image from "next/image";

export default function AppWrapper({
  children,
  creators,
  users,
  session,
}: {
  children: React.ReactNode;
  creators: Creator[];
  users: User[];
  session: Session | null;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const avatarUrl = session?.user?.avatarKey || null; // Replace with your avatar fetching logic

  return (
    <div className="min-h-screen w-full bg-[#3b0364] relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onCollapseChange={setSidebarCollapsed}
        creators={creators}
        users={users}
        session={session}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        {children}
      </div>

      {/* Mobile Bottom Hotbar */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 border-t border-white/10 
        flex justify-around items-center py-2 md:hidden z-50">
        
        <Link href="/home">
          <Home className="w-6 h-6 text-white" />
        </Link>
        
        <Link href="/notifications">
          <Bell className="w-6 h-6 text-white" />
        </Link>
        
        <Link href="/upload">
          <button className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 
            rounded-full flex items-center justify-center text-white shadow-lg -mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </Link>
        
        <Link href="/messages">
          <MessageCircle className="w-6 h-6 text-white" />
        </Link>
        
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full border border-pink-500/40 shadow-md"
            />
          ) : (
            <UserCircle className="w-7 h-7 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

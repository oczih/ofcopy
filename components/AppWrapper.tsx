"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Creator, User } from "@/app/types";
import { Session } from "next-auth";

export default function AppWrapper({
  children,
  creators,
  users,
  session
}: {
  children: React.ReactNode;
  creators: Creator[]; // ideally type these
  users: User[];
  session: Session | null
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="min-h-screen w-full bg-[#3b0364] relative overflow-hidden">
      {/* Enhanced animated background elements that respond to sidebar */}
      <div className={`fixed inset-0 -z-10 opacity-30 pointer-events-none transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Primary animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 rounded-full blur-3xl animate-pulse delay-1500"></div>
        {/* Additional floating elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl animate-bounce duration-3000"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-r from-violet-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        {/* Moving gradient mesh */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-full h-1 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent animate-pulse delay-300"></div>
          <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-pulse delay-700"></div>
          <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse delay-1100"></div>
        </div>
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>
      {/* Sidebar */}
      <Sidebar
        onCollapseChange={setSidebarCollapsed}
        creators={creators}
        users={users}
        session={session}
      />
      {/* Main content that responds to sidebar state */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {children}
      </div>
    </div>
  );
} 
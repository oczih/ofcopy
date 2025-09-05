"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AppWrapper from "@/components/AppWrapper";
import { Creator, User } from "@/app/types";
import { Session } from "next-auth";

interface ClientAppWrapperProps {
  children: React.ReactNode;
  creators: Creator[];
  users: User[];
  session: Session | null;
}

export default function ClientAppWrapper({ children, creators, users, session }: ClientAppWrapperProps) {
  const [currentChatIdentifier, setCurrentChatIdentifier] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // On mount, get stored chat
    const stored = localStorage.getItem("currentChatIdentifier");
    if (stored) setCurrentChatIdentifier(stored);
  }, []);

  useEffect(() => {
    // If user leaves /messages pages, clear the identifier
    if (!pathname?.startsWith("/messages")) {
      setCurrentChatIdentifier(null);
      localStorage.removeItem("currentChatIdentifier");
    }
  }, [pathname]);

  return (
    <AppWrapper
      creators={creators}
      users={users}
      session={session}
      hideHotbar={!!currentChatIdentifier}
    >
      {children}
    </AppWrapper>
  );
}

'use client'

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

interface SessionProviderWrapperProps {
  children: React.ReactNode;
  session: Session | null; // <-- accept null here
}

export default function SessionProviderWrapper({ children, session }: SessionProviderWrapperProps) {
  // Use session or treat null accordingly inside
  // For example:
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}

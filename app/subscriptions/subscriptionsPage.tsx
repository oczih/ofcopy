'use client';

import { Session } from "next-auth";
import { Creator, User } from "../types";

interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}

export default function App({creators, users, session}: AppProps) {
  if(!creators || !users || !session) return;
  return (
    <div>

    </div>
  );
}

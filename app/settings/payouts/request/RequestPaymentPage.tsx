'use client'

import { Creator, User } from "@/app/types";
import { Session } from "next-auth";


interface AppProps {
    creators: Creator[];
    session: Session | null;
    users: User[];
  }

export default function App({}: AppProps) {
    return (
        <div className="min-h-screen w-full flex justify-center px-4 py-10">
        <main className="max-w-3xl w-full space-y-8">
          
          {/* Header */}
          <header>
            <h2 className="text-3xl font-bold text-white mb-2">Request Payout</h2>
            <p className="text-gray-400 text-sm">Request A Payout here</p>
          </header>
          </main>
          </div>
    )
}
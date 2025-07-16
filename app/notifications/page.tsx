'use client'

import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Notification, User } from "../types";

const notificationMessages: Record<Notification["type"], (n: Notification) => string> = {
  newsub: () => "You have a new subscriber!",
  resub: () => "A user has resubscribed to you!",
  tip: () => "You received a new tip!",
  subcancel: () => "A user has cancelled their subscription.",
  comment: () => "You received a new comment!",
  like: () => "Someone liked your post!",
  newfollower: () => "You have a new follower!",
};

export default function MessagesPage() {
    return (
      <SessionProvider>
        <Notifications />
      </SessionProvider>
    );
  }
function Notifications() {
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const notifications: Notification[] = user?.notifications || [];
  // Sort notifications from latest to earliest
  const sortedNotifications: Notification[] = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <div className="flex max-w-7xl mx-auto px-4 py-8 gap-8 relative z-10">
        <Sidebar />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
          <div className="space-y-4">
            {sortedNotifications.length === 0 && (
              <div className="text-gray-400">No notifications yet.</div>
            )}
            {sortedNotifications.map((noti: Notification, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  noti.seen ? "bg-white/5 border-white/10" : "bg-white border-white/20 shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-900 dark:text-white font-medium">
                    {notificationMessages[noti.type](noti)}
                  </span>
                  <span className="text-xs text-gray-400 ml-4">
                    {new Date(noti.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
'use client'

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

function Notifications() {
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const notifications: Notification[] = user?.notifications || [];
  const sortedNotifications: Notification[] = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
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
    </>
  );
}

export default function NotificationsPage() {
  return (
    <SessionProvider>
      <Notifications />
    </SessionProvider>
  );
}
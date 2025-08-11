'use client';

import { Notification, User } from "../types";
import { Session } from "next-auth";
import { useState } from "react";

const notificationMessages: Record<Notification["type"], (n: Notification) => string> = {
  newsub: () => "You have a new subscriber!",
  resub: () => "A user has resubscribed to you!",
  tip: () => "You received a new tip!",
  subcancel: () => "A user has cancelled their subscription.",
  comment: () => "You received a new comment!",
  like: () => "Someone liked your post!",
  newfollower: () => "You have a new follower!",
  promotion: () => "You have a new promotion!", // Added for completeness
};

interface AppProps {
  session: Session | null;
  notifications: Notification[];
}

export default function NotificationsPage({ session, notifications }: AppProps) {
  const user = session?.user as User | undefined;

  // Check if user is a creator
  const isCreator = (user?.creator);

  // Define categories based on role
  const categories = isCreator
    ? [
        { key: 'all', label: 'All' },
        { key: 'newfollower', label: 'New Followers' },
        { key: 'tip', label: 'Tips' },
        { key: 'purchase', label: 'Purchases' },
        { key: 'comment', label: 'Comments' },
        { key: 'like', label: 'Likes' },
        { key: 'promotion', label: 'Promotions' },
      ]
    : [
        { key: 'all', label: 'All' },
        { key: 'promotion', label: 'Promotions' },
      ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter notifications by selected category
  const filteredNotifications = selectedCategory === 'all'
    ? notifications
    : notifications.filter(n => n.type === selectedCategory);

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-8">
        
        {/* Header */}
        <header>
          <h2 className="text-3xl font-bold text-white mb-2">Notifications</h2>
          <p className="text-gray-400 text-sm">Manage your account and preferences</p>
        </header>

        {/* Categories row */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-5 py-2 rounded-full border transition-colors duration-200 cursor-pointer
                ${
                  selectedCategory === cat.key
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-white border-white/20 hover:border-white/40'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notifications container */}
        <section className="w-full min-h-100 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
                {sortedNotifications.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                    <p className="text-gray-400 text-2xl text-bold text-center select-none">
                        Your notifications will appear here!
                    </p>
                    </div>
                ) : (
            <ul className="space-y-4">
              {sortedNotifications.map((noti, idx) => (
                <li
                  key={idx}
                  className={`p-4 rounded-lg border transition-all duration-200
                    ${
                      noti.seen
                        ? "bg-white/5 border-white/20 hover:border-white/30"
                        : "bg-white/10 border-white/40 shadow-md hover:shadow-lg"
                    }
                  `}
                  role="listitem"
                  tabIndex={0}
                  aria-label={notificationMessages[noti.type](noti)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-base text-gray-100 font-medium">
                      {notificationMessages[noti.type](noti)}
                    </span>
                    <time
                      className="text-xs text-gray-400 whitespace-nowrap"
                      dateTime={new Date(noti.date).toISOString()}
                    >
                      {new Date(noti.date).toLocaleString()}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

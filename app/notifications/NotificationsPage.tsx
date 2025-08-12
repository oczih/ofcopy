/* eslint-disable @next/next/no-img-element */
'use client';

import { Creator, Notification, User } from "../types";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

// Utility to format relative time
function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const intervals: [number, string][] = [
    [3600, 'hour'],
    [60, 'minute'],
    [86400, 'day'],
    [2592000, 'month'],
    [31536000, 'year'],
  ];
  for (let i = intervals.length - 1; i >= 0; i--) {
    const [secondsInUnit, unit] = intervals[i];
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

const notificationMessages: Record<Notification["type"], (n: Notification) => string> = {
  newsub: () => "You have a new subscriber!",
  resub: () => "A user has resubscribed to you!",
  tip: () => "You received a new tip!",
  subcancel: () => "A user has cancelled their subscription.",
  comment: () => "You received a new comment!",
  like: () => "Someone liked your post!",
  newfollower: () => "You have a new follower!",
  promotion: () => "You have a new promotion!",
};

interface AppProps {
  session: Session | null;
  notifications: Notification[] | null;
  creators: Creator[];
  users: User[];
}

export default function App({ session, notifications, users, creators }: AppProps) {
  const user = session?.user as User | undefined;
  const isCreator = user?.creator;
  const [avatarSignedUrls, setAvatarSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  Object.entries(avatarSignedUrls).forEach(([id, url]) => {
    console.log(`ID: ${id} -> URL: ${url}`);
  });
  useEffect(() => {
    setLoading(false);
  }, [notifications]);

  
  useEffect(() => {
    async function fetchSignedUrls() {
      if (!creators || creators.length === 0) return;
  
      // For each user, find if they are a creator, and get avatarKey from creator or user
      const avatarsWithKeys = users
        .map((u) => {
          const creator = creators.find(c => c.user === u.id);
          return {
            id: u.id,
            avatarKey: creator?.avatarKey || u.avatarKey,
          };
        })
        .filter(({ avatarKey }) => avatarKey); // filter out those without any avatarKey
  
      const signedUrlsMap: Record<string, string> = {};
  
      await Promise.all(
        avatarsWithKeys.map(async ({ id, avatarKey }) => {
          try {
            const res = await fetch("/api/media/download-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ s3Key: avatarKey }),
            });
  
            if (res.ok) {
              const data = await res.json();
              signedUrlsMap[id] = data.downloadUrl;
            }
          } catch (error) {
            console.error("Failed to fetch signed URL for id:", id, error);
          }
        })
      );
  
      setAvatarSignedUrls((prev) => ({ ...prev, ...signedUrlsMap }));
    }
  
    fetchSignedUrls();
  }, [users, creators]);
  
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

  const filteredNotifications =
    selectedCategory === 'all'
      ? notifications || []
      : (notifications || []).filter((n) => n.type === selectedCategory);

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Find user (who did the action "by") for a notification
  function findUserById(id: string) {
    return users.find(u => u.id === id);
  }

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-8">
        <header>
          <h2 className="text-3xl font-bold text-white mb-2">Notifications</h2>
          <p className="text-gray-400 text-sm">Manage your account and preferences</p>
        </header>

        {/* Categories */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-5 py-2 rounded-full border transition-colors duration-200 cursor-pointer
                ${selectedCategory === cat.key ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/20 hover:border-white/40'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <section className="w-full min-h-100 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-gray-400 text-xl">Loading notifications...</p>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-gray-400 text-2xl font-bold text-center select-none">
                Your notifications will appear here!
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {sortedNotifications.map((noti, idx) => {
  // Normalize `byUser`:
  let byUser: User | Creator | undefined;

  if (typeof noti.by === 'string') {
    // by is a user ID string
    byUser = users.find(u => u.id === noti.by) || creators.find(c => c._id === noti.by);
  } else if (Array.isArray(noti.by)) {
    // by is an array - pick first and check type
    const first = noti.by[0];
    if (typeof first === 'string') {
      byUser = users.find(u => u.id === first) || creators.find(c => c._id === first);
    } else {
      byUser = first;
    }
  } else {
    // by is an object (User or Creator)
    byUser = noti.by;
  }

  return (
    <li
      key={idx}
      className={`p-4 rounded-lg border transition-all duration-200
        ${noti.seen ? "bg-white/5 border-white/20 hover:border-white/30" : "bg-white/10 border-white/40 shadow-md hover:shadow-lg"}
      `}
      aria-label={notificationMessages[noti.type](noti)}
    >
      <div className="flex items-center gap-4">
        {/* User avatar */}
        <img
          src={avatarSignedUrls[byUser?.id ?? (byUser as Creator)?._id ?? ''] || '/default-avatar.png'}
          alt={`${byUser?.username || 'User'} avatar`}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex flex-col flex-grow">
          {/* User name + relative time */}
          <div className="flex justify-between items-center">
            <span className="text-white font-bold">{byUser?.username || 'Unknown User'}</span>
            <time className="text-xs text-gray-400 whitespace-nowrap" dateTime={new Date(noti.date).toISOString()}>
              {timeAgo(new Date(noti.date))}
            </time>
          </div>

          {/* Notification message */}
          <span className="text-gray-300 text-sm">{notificationMessages[noti.type](noti)}</span>
        </div>
      </div>
    </li>
  );
})}

            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

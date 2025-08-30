/* eslint-disable @next/next/no-img-element */
'use client';

import { Creator, Notification, User } from "../types";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Utility to format relative time
function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;

  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];

  for (const [secondsInUnit, unit] of intervals) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
}

const notificationMessages: Record<Notification["type"], (n: Notification) => string> = {
  newsub: () => "subscribed to you!",
  resub: () => "resubscribed to you!",
  tip: () => "sent you a new tip!",
  subcancel: () => "cancelled their subscription.",
  comment: () => "commented on your post!",
  like: () => "liked your post!",
  newfollower: () => "followed you!",
  promotion: () => "launched a promotion!",
  purchase: () => "purchase your content!"
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
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, [notifications]);

  
  useEffect(() => {
    async function fetchSignedUrls() {
      if ((!users || users.length === 0) && (!creators || creators.length === 0)) return;
  
      const avatarsWithKeys: { id: string; avatarKey: string }[] = [];
  
      // Add user avatars
      Object.values(users).forEach(u => {
        if (u.avatarKey) avatarsWithKeys.push({ id: u._id, avatarKey: u.avatarKey });
      });
      
      Object.values(creators).forEach(c => {
        if (c.avatarKey) avatarsWithKeys.push({ id: c._id, avatarKey: c.avatarKey });
      });

      const signedUrlsMap: Record<string, string> = {};
  
      await Promise.all(
        avatarsWithKeys.map(async ({ id, avatarKey }) => {
          if (!id) return; // guard
      
          try {
            if (avatarKey.startsWith("http")) {
              signedUrlsMap[id.toString()] = avatarKey;
            } else {
              const res = await fetch("/api/media/download-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ s3Key: avatarKey }),
              });
              if (res.ok) {
                const data = await res.json();
                signedUrlsMap[id.toString()] = data.downloadUrl;
              }
            }
          } catch (error) {
            console.error("Failed to fetch signed URL for id:", id, error);
          }
        })
      );
  
      setAvatarSignedUrls(prev => ({ ...prev, ...signedUrlsMap }));
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

  const currentCreator = creators.find(c => c.user === user?._id);

  interface ForRef {
    model: string;
    id: string;
  }
  
  const userNotifications = (notifications || []).filter(n => {
    const forIds: string[] = Array.isArray(n.for)
      ? n.for
          .map(f => {
            if (typeof f === 'string') return f; // string IDs
            // Narrow to ForRef
            if (typeof f === 'object' && f !== null && 'id' in f && 'model' in f) {
              const ref = f as ForRef; // tell TS it's ForRef
              return ref.id.toString();
            }
            return undefined;
          })
          .filter(Boolean) as string[]
      : typeof n.for === 'string'
      ? [n.for]
      : typeof n.for === 'object' && n.for !== null && 'id' in n.for && 'model' in n.for
        ? [(n.for as ForRef).id.toString()]
        : [];
  
    return (
      forIds.includes(currentCreator?._id?.toString() || '') ||
      forIds.includes(user?._id?.toString() || '')
    );
  });
const filteredNotifications =
  selectedCategory === 'all'
    ? userNotifications
    : userNotifications.filter(n => n.type === selectedCategory);

const sortedNotifications = [...filteredNotifications].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

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

function resolveByUser(by: string | User | Creator | Array<string | User | Creator>) {
  const userArray = Object.values(users); // this is already an array of user objects
  const creatorArray = Object.values(creators);
  return creatorArray.find((c: Creator) => c._id === by) || userArray.find((u: User) => u._id === by || u._id === by);
}
const byUser = resolveByUser(noti.by);

  function getNotificationLink(noti: Notification) {
    switch (noti.type) {
      case "newfollower":
        if(creators.find(c => c.user === noti.by)){
          const creator = creators.find(c => c.user === noti.by);
          return `/${creator?.username}`;
        }
         else {
          const user = users.find(u => u._id === noti.by);
          console.log(user)
          return `/${user?.username}`;
        }// Goes to creator's followers page
      case "comment":
      case "like":

        return `/post/${noti.postId}`; // Go to the post page
      case "newsub":
        if(creators.find(c => c.user === noti.by)){
          const creator = creators.find(c => c.user === noti.by);
          return `/${creator?.username}`;
        }
         else {
          const user = users.find(u => u._id === noti.by);
          return `/${user?.username}`;
        }
      case "resub":
        if(creators.find(c => c.user === noti.by)){
          const creator = creators.find(c => c.user === noti.by);
          return `/${creator?.username}`;
        }
         else {
          const user = users.find(u => u._id === noti.by);
          return `/${user?.username}`;
        } // Subscribers page
      case "purchase":
        return `/post/${noti.postId}`; // If purchases are tied to a post
      case "promotion":
        return `/promotions/${noti.by}`; // Example route
      default:
        return "/";
    }
  }
  return (
    <li
  key={idx}
  onClick={() => router.push(getNotificationLink(noti))}
  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-white/40
    ${noti.seen ? "bg-white/5 border-white/20 hover:border-white/30" : "bg-white/10 border-white/40 shadow-md hover:shadow-lg"}
  `}
  aria-label={notificationMessages[noti.type](noti)}
>
  <div className="flex items-center gap-4">
    <div className="relative w-12 h-12">
      {byUser && avatarSignedUrls[byUser?._id] ? (
        <img
          src={avatarSignedUrls[byUser?._id]}
          alt={`${byUser?.username || "User"} avatar`}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-white text-3xl rounded-full">
          {byUser?.username?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
    </div>
    <div className="flex flex-col flex-grow">
      <div className="flex justify-between items-center">
        <span className="text-white font-bold">{byUser?.username || 'Unknown User'}</span>
        <time className="text-xs text-gray-400 whitespace-nowrap" dateTime={new Date(noti.date).toISOString()}>
          {timeAgo(new Date(noti.date))}
        </time>
      </div>
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

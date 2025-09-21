'use client';

import { Session } from "next-auth";
import { Creator } from "@/app/types";
import PaymentForm from "@/components/PaymentForm";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

interface AppProps {
  session: Session | null;
  creators: Creator[];
}

export default function FollowingList({ session, creators }: AppProps) {
  const [paymentForm, setPaymentForm] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [creatorAvatars, setCreatorAvatars] = useState<Record<string, string>>({});
  const [urlCache, setUrlCache] = useState<Record<string, { url: string; timestamp: number }>>({});
  const CACHE_TTL = 15 * 60 * 1000; // 15 min

  const following = session?.user?.following ?? [];

  /** Fetch or return cached signed URL */
  const resolveAvatarUrl = useCallback(
    async (avatarKey: string | undefined): Promise<string> => {
      if (!avatarKey) return "/default-avatar.png";
      if (avatarKey.startsWith("http")) return avatarKey;

      const cached = urlCache[avatarKey];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.url;

      try {
        const res = await fetch("/api/media/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: avatarKey.replace(/^\/+/, "") }),
        });
        const data = await res.json();
        if (res.ok && data.downloadUrl?.startsWith("https://")) {
          setUrlCache(prev => ({
            ...prev,
            [avatarKey]: { url: data.downloadUrl, timestamp: Date.now() },
          }));
          return data.downloadUrl;
        }
      } catch (err) {
        console.error("Signed URL error:", err);
      }
      return "/default-avatar.png";
    },
    [urlCache]
  );

  /** Resolve all creator avatars once */
  useEffect(() => {
    (async () => {
      const avatarMap: Record<string, string> = {};

      for (const f of following) {
        const creator = creators.find(c =>
          c._id.toString() === (typeof f === "string" ? f : f.creatorId)
        );
        if (!creator || !creator.avatarKey) continue;

        const url = await resolveAvatarUrl(creator.avatarKey);
        avatarMap[creator._id] = url;
      }

      setCreatorAvatars(prev => ({ ...prev, ...avatarMap }));
    })();
  }, [following, creators, resolveAvatarUrl]);

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-6">
        <h2 className="text-3xl font-bold text-white">Following</h2>
        {following.length > 0 ? (
          <div className="space-y-4">
            {following.map(f => {
              const creator = creators.find(c =>
                c._id.toString() === (typeof f === "string" ? f : f.creatorId)
              );
              if (!creator) return null;

              const avatarUrl = creatorAvatars[creator._id] || "/default-avatar.png";

              return (
                <div
                  key={creator._id}
                  className="flex flex-col bg-zinc-900/50 p-8 rounded-xl"
                >
                  {/* Avatar + Name/Username row */}
                  <Link
                    href={`/${creator.username}`}
                    className="flex items-center gap-3 mb-5 hover:opacity-90"
                  >
                    <img
                      src={avatarUrl}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <p className="text-white font-semibold">{creator.name}</p>
                      <p className="text-gray-400 text-sm">@{creator.username}</p>
                    </div>
                  </Link>
                    {/* creator.promotion && (
                        <div className="rounded-xl w-full px-3 py-1.5">
                            {creator.promotion.text}
                        </div>
                    ) */ }
                  {/* Subscribe button */}
                  <button
                    onClick={() => {
                      setSelectedCreator(creator);
                      setPaymentForm(true);
                    }}
                    className="bg-gradient-to-r text-2xl w-full px-3 py-1.5 sm:px-5 sm:py-2 from-pink-500 to-purple-600
                               text-white font-semibold rounded-full shadow cursor-pointer"
                  >
                    ${creator.price}/month
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">You don&apos;t follow anyone!</p>
        )}

        {paymentForm &&
          createPortal(
            <PaymentForm
            avatarUrl={creatorAvatars[selectedCreator?._id ?? ""] ?? ""}
              type="subscription"
              open={paymentForm}
              onClose={() => setPaymentForm(false)}
              creator={selectedCreator}
              price={selectedCreator?.price ?? 0}
              session={session}
            />,
            document.body
          )}
      </main>
    </div>
  );
}

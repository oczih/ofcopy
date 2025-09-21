'use client';

import { Session } from "next-auth";
import { Creator } from "../types";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PaymentForm from "@/components/PaymentForm";
import { createPortal } from "react-dom";

interface AppProps {
  session: Session | null;
  creators: Creator[];
}

export default function App({ session, creators }: AppProps) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [paymentForm, setShowPaymentForm] = useState(false);
  const [creatorAvatars, setCreatorAvatars] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false); // ✅ for portal safety
  const CACHE_TTL = 15 * 60 * 1000; // 15 min

  useEffect(() => setMounted(true), []); // ✅ ensure DOM is ready

  // All creators with an active promotion
  const promotionCreators = creators.filter(
    (c) => Array.isArray(c.promotions) && c.promotions.some((p) => p.active)
  );
  const urlCacheRef = useRef<Record<string, { url: string; timestamp: number }>>({});

  const resolveAvatarUrl = useCallback(async (avatarKey?: string): Promise<string> => {
    if (!avatarKey) return "/default-avatar.png";
    if (avatarKey.startsWith("http")) return avatarKey;
  
    const cached = urlCacheRef.current[avatarKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.url;
  
    try {
      const res = await fetch("/api/media/download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key: avatarKey.replace(/^\/+/, "") }),
      });
      const data = await res.json();
      if (res.ok && data.downloadUrl?.startsWith("https://")) {
        urlCacheRef.current[avatarKey] = { url: data.downloadUrl, timestamp: Date.now() };
        setCreatorAvatars(prev => ({ ...prev, [avatarKey]: data.downloadUrl }));
        return data.downloadUrl;
      }
    } catch (err) {
      console.error("Signed URL error:", err);
    }
    return "/default-avatar.png";
  }, []);
  

  // Preload all avatar URLs
  useEffect(() => {
    (async () => {
      const avatarMap: Record<string, string> = {};
      for (const c of promotionCreators) {
        const url = await resolveAvatarUrl(c.avatarKey);
        avatarMap[c._id] = url;
      }
      setCreatorAvatars(prev => ({ ...prev, ...avatarMap }));
    })();
  }, [promotionCreators]); // now stable
  

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-6">
        <h2 className="text-3xl font-bold text-white">Promotions</h2>

        {promotionCreators.length === 0 && (
          <div className="text-gray-400">No creators found</div>
        )}

        {promotionCreators.map((c) => {
          const avatarUrl = creatorAvatars[c._id] || "/default-avatar.png";
          return (
            <div key={c._id} className="flex flex-col bg-zinc-900/50 p-8 rounded-xl">
              {/* Avatar + Name/Username */}
              <Link
                href={`/${c.username}`}
                className="flex items-center gap-3 mb-5 hover:opacity-90"
              >
                <img
                  src={avatarUrl}
                  alt={c.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <p className="text-white font-semibold">{c.name}</p>
                  <p className="text-gray-400 text-sm">@{c.username}</p>
                </div>
              </Link>

              {/* Promotion details */}
              {c.promotions
                ?.filter((p) => p.active)
                .map((p) => (
                  <div
                    key={p._id}
                    className="rounded-xl w-full px-3 py-1.5 bg-purple-700/20 text-purple-300 mb-3"
                  >
                    {p.title} – {p.discountPercent}% OFF
                  </div>
                ))}

              {/* Subscribe button */}
              <button
                onClick={() => {
                  setSelectedCreator(c);
                  setShowPaymentForm(true);
                }}
                className="bg-gradient-to-r text-2xl w-full px-3 py-1.5 sm:px-5 sm:py-2 from-pink-500 to-purple-600
                           text-white font-semibold rounded-full shadow cursor-pointer"
              >
                ${c.price}/month
              </button>
            </div>
          );
        })}

        {/* Payment modal portal */}
        {mounted && paymentForm &&
          createPortal(
            <PaymentForm
              avatarUrl={
                selectedCreator ? creatorAvatars[selectedCreator._id] ?? "" : ""
              }
              type="subscription"
              open={paymentForm}
              onClose={() => setShowPaymentForm(false)}
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

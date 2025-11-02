'use client';

import { Session } from "next-auth";
import { Creator } from "../types";
import { useEffect, useState } from "react";
import Link from "next/link";
import PaymentForm from "@/components/PaymentForm";
import { createPortal } from "react-dom";
import { notFound, useRouter } from "next/navigation";

interface AppProps {
  session: Session | null;
  creators: Creator[];
}

export default function App({ session, creators }: AppProps) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [paymentForm, setShowPaymentForm] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ for portal safety

  const router = useRouter();
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);
  useEffect(() => setMounted(true), []); // ✅ ensure DOM is ready
  useEffect(() => {
    if (!session?.user?.creator) {
      notFound();
    }
  }, [session, router]);
  // All creators with an active promotion
  const promotionCreators = creators.filter(
    (c) => Array.isArray(c.promotions) && c.promotions.some((p) => p.active)
  );

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-6">
        <h2 className="text-3xl font-bold text-white">Promotions</h2>

        {promotionCreators.length === 0 && (
          <div className="text-gray-400">No creators found</div>
        )}

        {promotionCreators.map((c) => {
          const avatarUrl = c.avatarKey || "/default-avatar.png";
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
                    {p.message} – {p.discountPercent}% OFF
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

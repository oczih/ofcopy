"use client";

import { useEffect,  useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Creator } from "../types";
import { Session } from "next-auth";

export default function RedirectPage({creators, session}: {creators: Creator[], session: Session | null}) {
  const params = useSearchParams();
  const status = params.get("status");
  const type = params.get("type");
  const sessionId = params.get("session_id"); // extract once

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<Creator | null>(null)
  const isSuccess = status === "success";
  const isCancel = status === "cancel";

  if (!status || !type) notFound();
  const isCreator = creators.find((c: Creator) => c.user === session?.user._id)
  useEffect(() => {
    if (!isSuccess || !sessionId || !session?.user) return;

    // ✅ prevent multiple API calls (dev-safe)
    const key = `payment_processed_${sessionId}`;
    if (sessionStorage.getItem(key)) {
      setLoading(false);
      return;
    }

    sessionStorage.setItem(key, "true");

    const handlePostPayment = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stripe/session?session_id=${sessionId}`);
        const sessionData = await res.json();

        const { userId, email, creatorId, amount } = sessionData.metadata || {};
        const stripeSubscriptionId = sessionData.subscription;
        if (type === "topup") {
          const topupRes = await fetch("/api/topup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, userId, amount }),
          });
          const data = await topupRes.json();
          if (data.success) {
            toast.success(`Wallet topped up: $${amount}`);
          } else {
            toast.error(data.error || "Top-up failed");
          }
        }

        if (type === "subscription") {
          const subRes = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              creatorId,
              price: sessionData.amount_total / 100,
              paymentMethod: "stripe",
              subscriptionId: stripeSubscriptionId
            }),
          });

          const subData = await subRes.json();
          if (subData.success) {
            toast.success("Subscription activated!");
            const creator = creators.find((c) => c._id === creatorId);
            setCreator(creator ?? null);

            if (session.user._id && creatorId) {
              await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "newsub",
                  by: isCreator ? isCreator : session.user._id,
                  forUsers: [{ model: "Creator", id: creatorId }],
                  creatorId,
                }),
              }).catch(console.error);
            }
          } else {
            toast.error(subData.error || "Subscription failed");
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };

    handlePostPayment();
  }, [isSuccess, sessionId, type, session, creators]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-950 to-black text-white p-6">
      {loading ? (
        <>
          <Loader2 className="w-14 h-14 text-purple-400 mb-4 animate-spin" />
          <p className="text-gray-300 text-lg">Finalizing your payment...</p>
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle className="w-20 h-20 text-green-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Successful 🎉</h1>
          <p className="text-gray-300 mb-6">
            {type === "subscription"
              ? "Your subscription is now active!"
              : "Your payment has been processed successfully."}
          </p>
        </>
      ) : isCancel ? (
        <>
          <XCircle className="w-20 h-20 text-red-400 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Canceled</h1>
          <p className="text-gray-300 mb-6">
            You canceled the {type || "payment"}. No charges were made.
          </p>
        </>
      ) : (
        <p className="text-gray-400">Waiting for payment status...</p>
      )}

      {!loading && (type === "topup") && (
        <Link
          href="/wallet"
          className="mt-8 px-6 py-3 bg-purple-700 hover:bg-purple-800 rounded-full font-semibold transition"
        >
          Return to Wallet
        </Link>
      )}

{!loading && (type === "subscription") && creator && (
        <Link
          href={`/${creator?.username}`}
          className="mt-8 px-6 py-3 bg-purple-700 hover:bg-purple-800 rounded-full font-semibold transition"
        >
          Return to {creator?.username}&apos;s page
        </Link>
      )}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import { useState} from "react";
import toast from "react-hot-toast";
import { Creator, MessageType, Post } from "@/app/types";
import { Session } from "next-auth";
import { Coins, CreditCard, X } from "lucide-react";
import { Divider } from "@mui/material";
import Link from "next/link";
import { createPortal } from "react-dom";

interface PaymentFormProps {
  type: "post" | "subscription" | "tip" | "message";
  open: boolean;
  onClose: () => void;
  creator: Creator | null;
  avatarUrl?: string | null;
  price: number | null;
  session: Session | null;
  post?: Post | null;
  message?: MessageType | null;
}

export default function PaymentForm({
  type,
  open,
  onClose,
  creator,
  avatarUrl,
  price,
  session
}: PaymentFormProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false)

  if (!open) return null;
  const handleStripeCheckout = async (
    mode: "payment" | "subscription",
    amount?: string
  ) => {
    setLoading(true);
    try {
      // Pick correct price ID
      let priceId = "";
      if (mode === "subscription") {
        priceId = process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_TEST!;
      } else {
        const map: Record<string, string> = {
          "10": process.env.NEXT_PUBLIC_STRIPE_TOPUP10_TEST!,
          "25": process.env.NEXT_PUBLIC_STRIPE_TOPUP25!,
          "50": process.env.NEXT_PUBLIC_STRIPE_TOPUP50!,
          "100": process.env.NEXT_PUBLIC_STRIPE_TOPUP100!,
          "200": process.env.NEXT_PUBLIC_STRIPE_TOPUP200!,
          "500": process.env.NEXT_PUBLIC_STRIPE_TOPUP500!,
        };
        priceId = map[amount ?? "10"]; // default fallback
      }
  
      // Ensure userId & email exist
      if (!session?.user?._id || !session?.user?.email) {
        toast.error("Please sign in first");
        setLoading(false);
        return;
      }

      // 🧠 Include userId and amount so they reach backend
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          email: session.user.email,
          amount: Number(amount) || price,
          mode,
          userId: session.user._id,
          creatorId: creator?._id,
          productName:
            mode === "subscription" ? "Subscription Plan" : `${amount || price} USD Top-Up`,
          ...(mode === "subscription" && { creatorId: creator?._id }), // 🟢 Add creatorId for subscription
        }),
      });
  
      const data = await res.json();
  
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment error, please try again");
    } finally {
      setLoading(false);
    }
  };
  const handleCreditPayment = async () => {
    if (!session?.user?._id || !creator?._id) {
      toast.error("Missing user or creator info");
      return;
    }
    if ((session?.user?.wallet?.balance ?? 0) <= 0){
      toast.error("Not enough credits!")
      return;
    }
    if (!price || price <= 0) {
      toast.error("Invalid price");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms first");
      return;
    }
  
    try {
      setLoading(true);
  
      const res = await fetch("/api/wallet/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user._id,
          creatorId: creator._id,
          amount: price,
          type,
        }),
      });
  
      const data = await res.json();
  
      if (res.ok && data.success) {
        toast.success("Payment successful!");
        onClose();
        // Optionally refresh wallet balance (if using SWR or React Query, trigger revalidation)
        window.location.reload();
      } else {
        toast.error(data.error || "Payment failed");
      }
    } catch (err) {
      console.error("Credit payment error:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#3c0d6c] to-[#1a0133] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 text-white backdrop-blur-xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl || ""}
            alt={creator?.name || "Creator"}
            className="w-12 h-12 rounded-full border border-white/20 object-cover"
          />
          <div>
            <p className="font-semibold text-lg">{creator?.name}</p>
            <p className="text-xs text-gray-300 capitalize">{type}</p>
          </div>
        </div>

        {/* Payment Option (Card Only) */}
        {type === "subscription" ? (<div className="space-y-4 pt-2">
          <p className="text-sm font-medium">💳 Pay securely with your card</p>

          <button
            onClick={() => handleStripeCheckout("subscription")}
            disabled={!termsAccepted || loading}
            className={`flex items-center gap-2 w-full justify-center rounded-full font-bold cursor-pointer px-4 py-3 text-white border border-transparent transition-all duration-300
              ${termsAccepted && !loading
                ? "bg-white/10 hover:bg-[#4d138a] hover:border-white"
                : "bg-[#1a0133] cursor-not-allowed opacity-60"
              }`}
          >
            <CreditCard className="w-5 h-5" />
            {loading ? "Processing..." : "Pay with Card"}
          </button>
          <Divider sx={{ borderColor: "#912afa" }} className="pt-2 pb-2" />
          <div>
              <div className="flex flex-row justify-between p-2"><p className="text-md font-medium">Use your current balance</p>
              <p className="text-md font-medium">${session?.user.wallet?.balance}</p>
              </div>
              <button
                onClick={() => setCreditModalOpen(true)}
                disabled={!termsAccepted || loading || session?.user?.wallet?.balance === 0 }
                className={`flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[#1a0133] w-full justify-center rounded-full font-bold cursor-pointer px-4 py-3 text-white border border-transparent transition-all duration-300
                  ${termsAccepted && !loading 
                    ? "bg-white/10 hover:bg-[#4d138a] hover:border-white"
                    : "bg-[#1a0133] cursor-not-allowed opacity-60"
                  }`}
              >
                <Coins className="w-5 h-5" />
                {loading ? "Processing..." : "Pay with Credits"}
              </button>
          </div>
        </div>) : (
          <div>
          <div className="flex flex-row justify-between p-2">
            <p className="text-md font-medium">Use your current credits</p>
            <p className="text-md font-medium">${session?.user.wallet?.balance}</p>
          </div>
        
          <button
            onClick={() => handleCreditPayment()}
            disabled={!termsAccepted || loading || (session?.user?.wallet?.balance ?? 0) < (price || 0)}
            className={`flex items-center gap-2 w-full justify-center rounded-full font-bold cursor-pointer px-4 py-3 text-white border border-transparent transition-all duration-300
              ${termsAccepted && !loading 
                ? "bg-white/10 hover:bg-[#4d138a] hover:border-white"
                : "bg-[#1a0133] cursor-not-allowed opacity-60"
              }`}
          >
            <Coins className="w-5 h-5" />
            {loading ? "Processing..." : "Pay with Credits"}
          </button>
        
          {/* 🟣 Show link to wallet if balance is too low */}
          {(session?.user?.wallet?.balance ?? 0) < (price || 0) && (
            <p className="text-sm text-gray-400 text-center pt-3">
              Not enough credits?{" "}
              <Link
                href="/wallet"
                className="text-pink-400 underline hover:text-pink-300 transition-colors"
              >
                Go to Wallet
              </Link>{" "}
              to top up.
            </p>
          )}
        </div>
        )}

        {/* Terms */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="cursor-pointer w-5 h-5 accent-pink-500"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span className="text-sm text-gray-300">
            I agree to the{" "}
            <a href="/tos" target="_blank" className="underline hover:text-pink-300">
              Terms and Conditions
            </a>
          </span>
        </div>

        {/* Total / Branding */}
        <div className="text-center space-y-1 pt-2 border-t border-white/10">
          <p className="text-2xl font-bold text-white">
            Total: ${price?.toFixed(2)}
          </p>
          <h2 className="text-md font-semibold pt-1">Your statement will show this charge as Monara Club</h2>
        </div>

        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 rounded-2xl">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {creditModalOpen &&
  createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-gradient-to-br from-[#3c0d6c] to-[#1a0133] rounded-2xl p-6 w-full max-w-sm text-white border border-white/10 shadow-2xl relative">
        <button
          onClick={() => setCreditModalOpen(false)}
          className="absolute top-4 cursor-pointer right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="space-y-4 text-center">
          <h2 className="text-xl font-semibold">Confirm Credit Subscription</h2>
          <p className="text-sm text-gray-300">
            You’re about to subscribe to{" "}
            <span className="font-medium text-white">{creator?.name}</span> for{" "}
            <span className="text-pink-400">${price?.toFixed(2)}</span> using your credits.
          </p>
          <p className="text-sm text-gray-400">
            This subscription lasts <strong>1 month</strong> and{" "}
            <strong>will not auto-renew</strong>.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={async () => {
                setCreditModalOpen(false);
                await handleCreditPayment();
              }}
              disabled={loading}
              className="flex items-center justify-center cursor-pointer gap-2 bg-white/10 hover:bg-[#4d138a] border border-white rounded-full py-3 font-semibold transition-all duration-300"
            >
              <Coins className="w-5 h-5" />
              {loading ? "Processing..." : "Confirm Subscription"}
            </button>

            <button
              onClick={() => setCreditModalOpen(false)}
              className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )}

      </div>
    </div>
  );
}

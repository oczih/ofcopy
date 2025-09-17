'use client'

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { Copy, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { Session } from "next-auth";
import { Creator, Post } from "@/app/types";

interface CryptoModalProps {
  amountUsd: number;
  onClose: () => void;
  type: "subscription" | "post" | "tip" | "message" | "topup";
  session: Session | null
  creator?: Creator |  null
  post?: Post |  null
}
type PaymentType = "subscription" | "post" | "tip" | "message" | "topup";

interface BasePayload {
  userId: string;
  creatorId: string;
  amount: number;
  type: PaymentType;
}

interface PostPayload extends BasePayload {
  type: "post";
  mediaId: string;
}

type PaymentPayload = BasePayload | PostPayload;
export function CryptoPaymentModal({ amountUsd, onClose, type, creator, session, post }: CryptoModalProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showTutorial, setShowTutorial] = useState(false);
  const notifiedCreators = useRef<Set<string>>(new Set());
  const walletAddress: string = process.env.NEXT_PUBLIC_LTCWALLETADDRESS!;
  const paymentToNotificationMap: Record<PaymentType, string> = {
    subscription: "newsub",
    post: "post",
    tip: "tip",
    message: "message",
    topup: "promotion", 
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handlePaidClick = async () => {
    setChecking(true);
    setTimer(60);
  
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    // Build payload with optional mediaId
    const base: BasePayload = {
      userId: session?.user._id ?? "",
      creatorId: creator?._id ?? "",
      amount: amountUsd,
      type,
    };
    
    const payload: PaymentPayload =
      type === "post" && post?._id
        ? { ...base, type: "post", mediaId: post._id }
        : base;
  
    try {
      const res = await fetch("/api/check-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      if (data.confirmed) setConfirmed(true);
      if (creator?._id && !notifiedCreators.current.has(creator._id) && ["subscription","post","tip","message"].includes(type)) {
        notifiedCreators.current.add(creator._id);
      
        const notificationType = paymentToNotificationMap[type];
      
        if (notificationType) {
          try {
            const response = await fetch("/api/notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: notificationType,  // mapped to valid type
                by: session?.user._id,
                forUsers: [creator._id],
                creatorId: creator._id
              }),
            });
      
            if (!response.ok) {
              const errorData = await response.json();
              console.error("Failed to create notification:", errorData);
            }
          } catch (err) {
            console.error("Notification request failed:", err);
          }
        }
      }
    } catch (err) {
      console.error("Payment check failed:", err);
    } finally {
      setChecking(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-[9999]">
      <div className="w-full max-w-md bg-gradient-to-br from-[#43136f] to-[#2a0247] backdrop-blur-xl rounded-2xl p-6 space-y-6 shadow-2xl text-center relative overflow-y-auto max-h-[90vh] border border-white/10">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-300 hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        {/* Title */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
          <h2 className="text-2xl font-extrabold">Pay with Bank Card / Crypto</h2>
        </div>

        {/* Stepper */}
        <div className="flex justify-center items-center gap-2 text-sm">
          {["1. Copy", "2. Pay", "3. Confirm"].map((step, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-white/10 text-gray-200 font-medium"
            >
              {step}
            </span>
          ))}
        </div>

        {/* Wallet address */}
        <div className="p-3 bg-white/10 rounded-xl cursor-pointer flex justify-between items-center text-white text-sm border border-white/10">
          <span className="truncate">{walletAddress}</span>
          <button
            onClick={handleCopy}
            className="ml-3 text-pink-400 hover:text-pink-300 transition-colors"
          >
            {copied ? (
              <span className="text-green-400 font-semibold">✓ Copied</span>
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>

        {/* Payment link */}
        <a
          href="https://exchange.mercuryo.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:from-pink-600 hover:to-purple-600 transition-colors duration-200"
        >
          💳 Open Mercuryo to Pay
        </a>

        {/* Collapsible tutorial */}
        <button
          onClick={() => setShowTutorial(!showTutorial)}
          className="w-full flex cursor-pointer justify-center items-center gap-1 text-sm text-gray-300 hover:text-gray-100 transition-colors"
        >
          {showTutorial ? "Hide tutorial" : "Show tutorial"}
          {showTutorial ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showTutorial && (
  <div className="space-y-2 text-left bg-white/5 p-3 rounded-lg border border-white/10">
    <a
      href="https://exchange.mercuryo.io/"
      target="_blank"
      className="cursor-pointer block relative"
    >
      {/* Image */}
      <img
        src="/prepare-form.png"
        alt="Mercuryo tutorial"
        className="w-full rounded-md border border-white/20"
      />
    </a>

    <ul className="text-gray-200 text-sm list-disc list-inside space-y-1 mt-2">
      <li>
        1. Enter <span className="font-semibold">USD</span> in the first field
      </li>
      <li>
        2. Select <span className="font-semibold">LTC</span> as crypto
      </li>
      <li>
        3. Amount: <span className="font-semibold">${amountUsd.toFixed(2)}</span>
      </li>
    </ul>
  </div>
)}

        {/* Amount */}
        <div className="text-white">
          <p className="text-sm text-gray-300">Total</p>
          <p className="text-3xl font-bold mt-1">${amountUsd.toFixed(2)}</p>
          <p className="text-xs text-gray-400">Including VAT ${(amountUsd * 0.255).toFixed(2)}</p>
        </div>

        {/* Paid button */}
        <button
          onClick={handlePaidClick}
          disabled={checking || confirmed}
          className="w-full bg-gradient-to-r cursor-pointer transition-colors disabled:cursor-none from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg duration-200 disabled:opacity-50"
        >
          {checking
            ? `⏳ Checking... ${timer}s`
            : confirmed
            ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={20} /> Confirmed
              </span>
            )
            : "✅ I’ve Paid"}
        </button>

        {/* Tracker */}
        {checking && !confirmed && (
          <p className="text-xs text-gray-300 mt-1">
            Track:{" "}
            <a
              href={`https://www.oklink.com/litecoin/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-pink-400 hover:text-pink-300"
            >
              Wallet Explorer
            </a>
          </p>
        )}

        {/* Back button */}
        <button
          onClick={onClose}
          className="w-full cursor-pointer text-xs text-gray-400 hover:text-gray-200 underline mt-2 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

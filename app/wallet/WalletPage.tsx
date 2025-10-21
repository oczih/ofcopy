"use client";

import React, { useEffect, useState } from "react";
import { Creator, User } from "../types";
import { Session } from "next-auth";
import {  X, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

interface PayPanelProps {
  onCancel: () => void;
  topUpAmount: number | null;
  showAlternativeMethods?: boolean; // NEse
  session: Session | null
  handleStripeCheckout: (type?: "payment" | "subscription", amount?: string) => void | Promise<void>;
  loading: boolean;
  creator: Creator | null;
}

const amounts = [10, 25, 50, 100, 200, 500];

function TopUpPanel({
  onContinue,
  onCancel,
}: {
  onContinue: (amount: number) => void;
  onCancel: () => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  
  return (
    <div className="space-y-6 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <p className="text-white font-bold text-lg">Add Wallet Credits</p>
      </div>
      <button
        className="absolute top-4 right-4 cursor-pointer text-white hover:text-pink-400 transition-colors"
        onClick={onCancel}
      >
        <X size={24} />
      </button>
      <div className="flex flex-wrap gap-4 justify-center">
        {amounts.map((amount, index) => (
          <button
            key={amount}
            className={`px-6 py-3 rounded-xl font-bold cursor-pointer transition-all duration-300 shadow-lg ${
              selectedAmount === amount
                ? "bg-gradient-to-r from-pink-500 to-pink-600 outline-2 outline-white text-white"
                : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
            }`}
            onClick={() => setSelectedAmount(amount)}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            ${amount}
          </button>
        ))}
      </div>

      <button
        className="w-full bg-gradient-to-r from-blue-500 cursor-pointer to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!selectedAmount}
        onClick={() => selectedAmount && onContinue(selectedAmount)}
      >
        Continue
      </button>
    </div>
  );
}

function PayPanel({ topUpAmount, showAlternativeMethods = true, onCancel, handleStripeCheckout, loading}: PayPanelProps) {
  
  return (
    <div className="space-y-6 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="text-center mb-6">
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-xs bg-white/10 px-2 py-1 rounded-lg border border-white/20">🔒 SSL</span>
          <span className="text-xs bg-white/10 px-2 py-1 rounded-lg border border-white/20">💳 Encrypted</span>
        </div>
      </div>

      <div className="text-center font-bold text-2xl text-white">${topUpAmount}</div>

      {/* Alternative Payment Options */}
      {showAlternativeMethods && (
        <div className="space-y-3">
          <div className="flex justify-end">
          <button
        className="absolute top-4 right-4 cursor-pointer text-white hover:text-pink-400 transition-colors"
        onClick={onCancel}
      >
        <X size={24} />
      </button>
          </div>
          <button 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 cursor-pointer text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-colors duration-200"
          onClick={() => handleStripeCheckout("payment", topUpAmount?.toString())}
          disabled={loading}
          >
            
            <CreditCard size={20} /> {loading ? "Loading..." : "Card"}
          </button>

        </div>
      )}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-white/10">
        By subscribing, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
} 
interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}

export default function App({session, creators}: AppProps) {  

  const [showPayPanel, setShowPayPanel] = useState(false);
  const [showTopUpPanel, setShowTopUpPanel] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);
  const [creator, setCreator] = useState<Creator | null>(null);
  useEffect(() => {
    if (session) {
      const rightCreator = creators?.find(c => c.user === session?.user._id);
      setCreator(rightCreator || null);
    } else {
      setCreator(null);
    }
  }, [session, creators]);
  const handleStripeCheckout = async (
    type?: "payment" | "subscription",
    amount?: string
  ) => {
    setLoading(true);
    if (!type) return;
    try {
      // Pick correct price ID
      let priceId = "";
      if (type === "subscription") {
        priceId = process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION!;
      } else {
        const map: Record<string, string> = {
          "10": process.env.NEXT_PUBLIC_STRIPE_TOPUP10!,
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
          amount: Number(amount), // fallback to price prop
          type,
          userId: session.user._id,
          productName:
            type === "subscription"
              ? "Subscription Plan"
              : `${amount} USD Top-Up`,
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
    console.log(showPayPanel)
  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <main className="max-w-3xl w-full space-y-8">
        <Toaster
        position="top-center"
        reverseOrder={false}
      />
        {/* Header */}
        <header>
          <h2 className="text-2xl font-bold text-white mb-2">Your Wallet & Payment Methods</h2>
          <p className="text-gray-400 text-sm">Manage your wallet credits and payment methods</p>
        </header>

        {/* Wallet Credit */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <p className="text-gray-300 text-sm mb-2">Wallet Credit</p>
          <p className="text-white text-3xl font-bold">${Number(session?.user?.wallet?.balance) || 0}</p>
        </div>
        
        {/* Top Up Button */}
        <div>
          <button
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 cursor-pointer text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-colors duration-300"
            onClick={() => setShowTopUpPanel(true)}
          >
            Top Up
          </button>
        </div>

        {/* Payment Methods */}
        {/* <div className="space-y-4">
          <p className="text-white text-lg font-semibold">My Payment Methods</p>
          {session?.user?.paymentmethods?.length ? (
            <div className="space-y-3">
              {session.user.paymentmethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 px-6 py-4 text-white flex justify-between items-center hover:bg-white/10 transition-colors duration-300 shadow-2xl"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <span className="font-medium">{method.brand}</span>
                  <button className="text-sm text-pink-400 hover:text-pink-300 hover:underline transition-colors">
                    Use
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <button
                className="w-full bg-gradient-to-r cursor-pointer from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  setShowPayPanel(true);
                  setTopUpAmount(null); // since we’re just adding a card
                }}
              >
                💳 Add Card
              </button>
            </div>
          )}
        </div> */}

        {/* PayPanel modal */}
        {showPayPanel && topUpAmount && (
  <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
    <div className="w-full max-w-md">
      <PayPanel
        topUpAmount={topUpAmount}
        session={session}
        showAlternativeMethods={!!topUpAmount} // only show when topping up
        handleStripeCheckout={handleStripeCheckout}
        loading={loading}
        creator={creator}
        onCancel={() => {
          setShowPayPanel(false);
          setTopUpAmount(null);
        }}
      />
    </div>
  </div>
)}

        {/* TopUpPanel modal */}
        {showTopUpPanel && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50">
            <div className="w-full max-w-md">
            <TopUpPanel
                onCancel={() => {
                  setShowTopUpPanel(false);
                  setTopUpAmount(null);
                }}
                onContinue={(amount) => {
                  setTopUpAmount(Number(amount));
                  setShowTopUpPanel(false);
                  setShowPayPanel(true); // still shows alternatives
                }}
                />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
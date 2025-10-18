'use client';
import { Creator, Post } from "@/app/types";
import { Session } from "next-auth";
import { useState } from "react";

interface PlisioModalProps {
  amount: number;
  onClose: () => void;
  type: "subscription" | "post" | "tip" | "message" | "topup";
  session: Session | null
  creator?: Creator |  null
  post?: Post |  null
}

interface Crypto {
  symbol: string;
  name: string;
}

const CRYPTOS: Crypto[] = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "USDT_TRX", name: "Tether TRC-20" },
  { symbol: "USDT", name: "Tether ERC-20" },
  { symbol: "TRX", name: "Tron" },
];

export default function PlisioModal({ onClose, amount, type, session, post}: PlisioModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plisio/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          selectedCrypto,
          type,
          postId: post?._id ?? null,
          userId: session?.user?._id
        }),
      });
      const data = await res.json();

      if (data.url) window.open(data.url, "_blank");
      else alert("Failed to create Plisio invoice");
    } catch (err) {
      console.error(err);
      alert("Payment error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
       <div className="relative w-full max-w-md bg-gradient-to-br from-[#3c0d6c] to-[#1a0133] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 text-white backdrop-blur-xl space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Pay with Crypto (Plisio)
        </h2>
        <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
          Amount: ${Number(amount).toFixed(2)}
        </p>

        {/* Crypto selection grid */}
        <div className="flex flex-col md:grid-cols-3 gap-6 mb-8">
          {CRYPTOS.map((crypto) => (
            <div
              key={crypto.symbol}
              onClick={() => setSelectedCrypto(crypto.symbol)}
              className={`
                flex items-center gap-2 w-full justify-center
                rounded-full font-bold cursor-pointer px-4 py-2
                text-white border border-white
                transition-colors transition-border duration-200
                ${selectedCrypto === crypto.symbol
                  ? "bg-[#3c0d6c] hover:bg-[#4d138a] hover:border-white"
                  : "bg-[#1a0133] cursor-not-allowed opacity-60"
                }
              `}
            >
              <span className="text-xl font-bold text-white">
                {crypto.symbol}
              </span>
              <span className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                {crypto.name}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-300 duration-200 cursor-pointer hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={loading}
            className="px-6 py-2 rounded-xl cursor-pointer disabled:cursor-not-allowed duration-200 bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing..." : `Pay with ${selectedCrypto}`}
          </button>
        </div>
      </div>
    </div>
  );
}

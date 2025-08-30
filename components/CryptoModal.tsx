/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Copy, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";

interface CryptoModalProps {
  amountUsd: number;
  onClose: () => void;
}

export function CryptoPaymentModal({ amountUsd, onClose }: CryptoModalProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showTutorial, setShowTutorial] = useState(false);

  const walletAddress: string = process.env.NEXT_PUBLIC_LTCWALLETADDRESS!;

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

    const res = await fetch("/api/check-payment", { method: "POST" });
    const data = await res.json();

    if (data.confirmed) setConfirmed(true);
    setChecking(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex justify-center items-center p-4 z-50">
      <div className="w-full max-w-md bg-[#3b0364] backdrop-blur-xl rounded-2xl p-5 space-y-5 shadow-2xl text-center relative overflow-y-auto max-h-[90vh]">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-300 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold text-white">Pay with Bank Card / Crypto</h2>

        {/* Stepper */}
        <div className="flex justify-center items-center gap-2 text-sm text-gray-300">
          <span className="px-2 py-1 rounded bg-white/10">1. Copy</span>
          <span className="px-2 py-1 rounded bg-white/10">2. Pay</span>
          <span className="px-2 py-1 rounded bg-white/10">3. Confirm</span>
        </div>

        {/* Wallet address */}
        <div className="p-3 bg-white/10 rounded-lg flex justify-between items-center text-white text-sm">
          <span className="truncate">{walletAddress}</span>
          <button onClick={handleCopy} className="text-pink-400 cursor-pointer hover:text-pink-300">
            {copied ? "✓" : <Copy size={16} />}
          </button>
        </div>

        {/* Payment link */}
        <a
          href="https://exchange.mercuryo.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-2 rounded-lg shadow hover:from-pink-600 hover:to-purple-600 transition"
        >
          Open Mercuryo to Pay
        </a>

        {/* Collapsible tutorial */}
        <button
          onClick={() => setShowTutorial(!showTutorial)}
          className="w-full flex justify-center items-center cursor-pointer gap-1 text-sm text-gray-300 hover:text-gray-200"
        >
          {showTutorial ? "Hide tutorial" : "Show tutorial"}
          {showTutorial ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </button>

        {showTutorial && (
          <img
            src={"/prepare-form.jpg"}
            alt="Mercuryo tutorial"
            className="w-full rounded-lg border border-white/20"
          />
        )}

        {/* Amount */}
        <div className="text-white">
          <p className="text-sm text-gray-300">Total</p>
          <p className="text-xl font-bold">${amountUsd.toFixed(2)}</p>
          <p className="text-xs text-gray-400">Including VAT €2.90</p>
        </div>

        {/* Paid button */}
        <button
          onClick={handlePaidClick}
          disabled={checking || confirmed}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 cursor-pointer hover:from-green-600 hover:to-emerald-600 text-white py-2 rounded-lg font-bold shadow disabled:opacity-50"
        >
          {checking
            ? `⏳ Checking... ${timer}s`
            : confirmed
            ? <span className="flex items-center justify-center gap-2"><CheckCircle size={18}/> Confirmed</span>
            : "I’ve Paid"}
        </button>

        {/* Optional transaction tracker */}
        {checking && !confirmed && (
          <p className="text-xs text-gray-300 mt-1">
            Track:{" "}
            <a
              href={`https://www.oklink.com/litecoin/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-pink-400"
            >
              Wallet Explorer
            </a>
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full text-xs cursor-pointer text-gray-400 hover:text-gray-200 underline"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

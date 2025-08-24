import { useState } from "react";
import { Copy, CheckCircle, X } from "lucide-react";

interface CryptoModalProps {
  amountUsd: number;
  onClose: () => void;
}

export function CryptoPaymentModal({ amountUsd, onClose }: CryptoModalProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const walletAddress = "ltc1qt6w5y0v85azw9sgq4gqu2pk4xlqmqcm7uassll";
  const ltcRateUsd = 65; // Example LTC/USD rate, ideally fetched live
  const amountLtc = (amountUsd / ltcRateUsd).toFixed(6);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaidClick = async () => {
    setChecking(true);
    // Backend API call to check blockchain payment
    const res = await fetch("/api/check-payment", { method: "POST" });
    const data = await res.json();

    if (data.confirmed) setConfirmed(true);
    setChecking(false);
  };

  return (
    <div className="fixed inset-0 bg-black/10 flex justify-center items-center p-4 z-50">
      <div className="w-full max-w-md bg-[#3b0364] backdrop-blur-xl rounded-3xl p-6 space-y-6 shadow-2xl text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-300 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white">Pay by Bank Card / Crypto</h2>

        {/* Payment Amount Section */}
        <div className="space-y-2">
          <p className="text-gray-300">Total</p>
          <p className="text-2xl font-bold text-white">${amountUsd.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">Including VAT €2.90</p>
        </div>

        {/* Mercuryo Image */}
        <a
          href="https://exchange.mercuryo.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={"/prepare-form.jpg"}
            alt="Mercuryo payment example"
            className="w-full rounded-xl border border-white/20"
          />
        </a>

        {/* Wallet Address */}
        <div className="p-4 bg-white/10 rounded-xl space-y-3">
          <p className="text-gray-300 text-sm font-medium">Copy our wallet address:</p>
          <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg text-white">
            <span className="truncate">{walletAddress}</span>
            <button onClick={handleCopy} className="text-pink-400 hover:text-pink-300">
              {copied ? "Copied!" : <Copy size={16} />}
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm mt-2">
          Open the payment form and populate the wallet address field. Follow the instructions of the payment processor. You can pay by bank card, Google Pay, Apple Pay, or Revolut in ~5 minutes.
        </p>

        <button
          onClick={handlePaidClick}
          disabled={checking || confirmed}
          className="w-full bg-gradient-to-r from-green-500 cursor-pointer to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
        >
          {checking
            ? "⏳ Checking..."
            : confirmed
            ? <span className="flex items-center justify-center gap-2"><CheckCircle size={18}/> Confirmed</span>
            : "I’ve Paid"}
        </button>

        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 cursor-pointer hover:text-gray-200 underline mt-2"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

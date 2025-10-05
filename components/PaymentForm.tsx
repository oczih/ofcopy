/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Creator, MessageType, Post } from "@/app/types";
import { Session } from "next-auth";
import { Bitcoin, X } from "lucide-react";
import Image from "next/image";
import { CryptoPaymentModal } from "./CryptoModal";
import { createPortal } from "react-dom";

interface PaymentFormProps {
  type: "post" | "subscription" | "tip" | "message";
  open: boolean;
  onClose: () => void;
  creator: Creator | null;
  avatarUrl?: string | null;
  price: number | null;
  session: Session | null;
  post?: Post | null
  message?: MessageType | null
}

const PLATFORM_FEE_RATE = 0.05;

export default function PaymentForm({
  type,
  open,
  onClose,
  creator,
  avatarUrl,
  price,
  session,
  post,
  message
}: PaymentFormProps) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const total = useMemo(() => {
    const basePrice = price ?? 0;
    const fee = basePrice * PLATFORM_FEE_RATE;
    return basePrice + fee;
  }, [price]);
  
  if (!open) return null;

  // LuxFin handlers (wallets)
  const handleWalletPayment = async (
    method: "paypal" | "venmo" | "applepay"
  ) => {
    if (!session?.user?.email)
      return toast.error("User email required for payment");

    const res = await fetch("/api/luxfin/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        amount: total,
        currency: selectedCurrency,
        customer: session.user.email,
        product: `${creator?.name} - ${type}`,
        redirect_url: `${window.location.origin}/payment/success`,
      }),
    });

    const data = await res.json();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      toast.error("Could not start wallet payment");
    }
  };
  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/plisio/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(total),
          type,
          creatorId: creator?._id,
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

  // EU/Western + US countries
  const countries = [
    { code: "AT", name: "Austria", currency: "USD" },
    { code: "BE", name: "Belgium", currency: "USD" },
    { code: "BG", name: "Bulgaria", currency: "USD" },
    { code: "HR", name: "Croatia", currency: "USD" },
    { code: "CY", name: "Cyprus", currency: "USD" },
    { code: "CZ", name: "Czechia", currency: "USD" },
    { code: "DK", name: "Denmark", currency: "USD" },
    { code: "EE", name: "Estonia", currency: "USD" },
    { code: "FI", name: "Finland", currency: "USD" },
    { code: "FR", name: "France", currency: "USD" },
    { code: "DE", name: "Germany", currency: "USD" },
    { code: "GR", name: "Greece", currency: "USD" },
    { code: "HU", name: "Hungary", currency: "USD" },
    { code: "IE", name: "Ireland", currency: "USD" },
    { code: "IT", name: "Italy", currency: "USD" },
    { code: "LV", name: "Latvia", currency: "USD" },
    { code: "LT", name: "Lithuania", currency: "USD" },
    { code: "LU", name: "Luxembourg", currency: "USD" },
    { code: "MT", name: "Malta", currency: "USD" },
    { code: "NL", name: "Netherlands", currency: "USD" },
    { code: "PL", name: "Poland", currency: "USD" },
    { code: "PT", name: "Portugal", currency: "USD" },
    { code: "RO", name: "Romania", currency: "USD" },
    { code: "SK", name: "Slovakia", currency: "USD" },
    { code: "SI", name: "Slovenia", currency: "USD" },
    { code: "ES", name: "Spain", currency: "USD" },
    { code: "SE", name: "Sweden", currency: "USD" },
    { code: "US", name: "United States", currency: "USD" },
  ];
  const paymentOptions = [
    { label: "Pay with Credit Card", icon: "/visa.svg" }, // Replace with mastercard.svg for Mastercard
    { label: "Pay with Apple Pay", icon: "/Apple_logo_black.svg" }, // if you have svg
    { label: "Pay with Google Pay", icon: "/gpay.png" },
    { label: "Pay with Revolut", icon: "/revolut.png" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="relative w-full max-w-md bg-gradient-to-br from-[#3c0d6c] to-[#1a0133] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 text-white backdrop-blur-xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 cursor-pointer right-4 text-gray-300 hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl || ""}
            alt={creator?.name}
            className="w-12 h-12 rounded-full border border-white/20 object-cover"
          />
          <div>
            <p className="font-semibold text-lg">{creator?.name}</p>
            <p className="text-xs text-gray-300 capitalize">{type}</p>
          </div>
        </div>

        {/* Country & Currency */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            🌍 Select Your Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              const code = e.target.value;
              setSelectedCountry(code);
              const c = countries.find((c) => c.code === code);
              setSelectedCurrency(c?.currency.toString() || "");
            }}
            className="w-full border border-white/20 bg-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">-- Select --</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code} className="text-black">
                {c.name}
              </option>
            ))}
          </select>

          {selectedCurrency && (
            <p className="text-sm text-gray-300 mt-1">
              Currency: <span className="font-semibold">{selectedCurrency}</span>
            </p>
          )}
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
        {selectedCountry === "US" ? (
  <div className="space-y-3">
    <p className="text-sm font-medium">💳 Choose a wallet:</p>
    <div className="space-y-3">
      <button
        onClick={() => handleWalletPayment("paypal")}
        disabled={!termsAccepted}
        className={`
          flex items-center gap-2 w-full justify-center
          rounded-full font-bold cursor-pointer px-4 py-2
          text-white border border-transparent
          transition-colors transition-border duration-300
          ${termsAccepted
            ? "bg-white/10 hover:bg-[#4d138a] hover:border-white"
            : "bg-[#1a0133] cursor-not-allowed opacity-60"
          }
        `}
      >
        <Image src="/PayPal_Logo_Icon_2014.svg.png" alt="PayPal" width={20} height={20} />
        PayPal
      </button>

      <button
        onClick={() => handleWalletPayment("venmo")}
        disabled={!termsAccepted}
        className={`
          flex items-center gap-2 w-full justify-center
          rounded-full font-bold cursor-pointer px-4 py-2
          text-white border border-transparent
          transition-colors transition-border duration-300
          ${termsAccepted
            ? "bg-white/10 hover:bg-[#4d138a] hover:border-white"
            : "bg-[#1a0133] cursor-not-allowed opacity-60"
          }
        `}
      >
        <Image src="/Venmo_logo.png" alt="Venmo" width={20} height={20} />
        Venmo
      </button>

      <button
        onClick={() => handleWalletPayment("applepay")}
        disabled={!termsAccepted}
        className={`
          flex items-center gap-2 w-full justify-center
          rounded-full font-bold cursor-pointer px-4 py-2
          text-white border border-transparent
          transition-colors transition-border duration-300
          ${termsAccepted
            ? "bg-white/10 hover:bg-[#4d138a] hover:border-white"
            : "bg-[#1a0133] cursor-not-allowed opacity-60"
          }
        `}
      >
        <Image src="/Apple_logo_black.svg" alt="Apple Pay" width={20} height={20} />
        Apple Pay
      </button>
      <button
     onClick={handlePay}
     className={`
      flex items-center gap-4 mt-2 w-full justify-center
      rounded-full font-bold cursor-pointer px-4 py-2
      text-white border border-transparent
      transition-colors transition-border duration-300
      ${termsAccepted
        ? "bg-white/10  hover:bg-[#4d138a] hover:border-white"
        : "bg-[#1a0133] cursor-not-allowed opacity-60"
      }
    `}
    >
      <Bitcoin/>
        Pay with Crypto

    </button>
    </div>

    <p className="text-xs text-gray-400">
      PayPal™ and Venmo™ are trademarks of PayPal, Inc. Apple Pay® is a trademark of Apple Inc.
    </p>
  </div>
) : selectedCountry ? (

<div>
  {paymentOptions.map(({ label, icon }) => (
    <div key={label} className="pt-2 pb-2">
      <button
        onClick={() => setShowCryptoModal(true)}
        disabled={!termsAccepted}
        className={`
          flex items-center gap-2 w-full justify-center
          rounded-full font-bold cursor-pointer px-4 py-2
          text-white border border-transparent
          transition-colors transition-border duration-300
          ${termsAccepted
            ? "bg-white/10 hover:bg-[#4d138a] hover:border-white"
            : "bg-[#1a0133] cursor-not-allowed opacity-60"
          }
        `}
      >
        <Image src={icon} alt={label} width={20} height={20} />
        {label}
      </button>
    </div>
  ))}
  <div>

    <button
     onClick={handlePay}
     className={`
      flex items-center gap-4 mt-2 w-full justify-center
      rounded-full font-bold cursor-pointer px-4 py-2
      text-white border border-transparent
      transition-colors transition-border duration-300
      ${termsAccepted
        ? "bg-white/10  hover:bg-[#4d138a] hover:border-white"
        : "bg-[#1a0133] cursor-not-allowed opacity-60"
      }
    `}
    >
      <Bitcoin/>
        Pay with Crypto

    </button>
    </div>
</div>
          ) : (
            <p className="text-gray-300 text-sm">
              Please select your country to continue.
            </p>
          )}
        </div>

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
            <Link href="/tos" target="_blank" className="underline hover:text-pink-300">
              Terms and Conditions
            </Link>
          </span>
        </div>

        {/* Total / Branding */}
        <div className="text-center space-y-1 pt-2 border-t border-white/10">
          <p className="text-2xl font-bold text-white">
            Total: ${total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            Including platform fee (5%)
          </p>
          <h2 className="text-md font-semibold pt-1">Monara Club</h2>
          <p className="text-xs text-gray-400">
            Country of Registration: Finland
          </p>
        </div>

        {showCryptoModal &&
  createPortal(
    <CryptoPaymentModal
      amountUsd={Number(total) || 0}
      onClose={() => setShowCryptoModal(false)}
      session={session}
      creator={creator}
      type={type}
      post={post ?? null}
      message={message ?? null}
    />,
    document.body
  )
}
{loading && (
    <div className="absolute inset-0 z-50 flex items-center justify-center
                    bg-black/70 rounded-2xl">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )}
      </div>
    </div>
  );
}

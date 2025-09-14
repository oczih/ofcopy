/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Creator } from "@/app/types";
import { Session } from "next-auth";
import { CreditCard, X } from "lucide-react";
import { Chip } from "@mui/material";
import Image from "next/image";

// -------------------
// Schema (for non-US cards)
// -------------------


interface PaymentFormProps {
  type: "post" | "subscription" | "tip" | "message";
  open: boolean;
  onClose: () => void;
  creator: Creator | null;
  avatarUrl?: string | null; 
  price: number | null;
  session: Session | null
}

const PLATFORM_FEE_RATE = 0.05;

export default function PaymentForm({
  type,
  open,
  onClose,
  creator,
  avatarUrl,
  price,
  session
}: PaymentFormProps) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);


  const total = useMemo(() => {
    const basePrice = price ?? 0;
    const fee = basePrice * PLATFORM_FEE_RATE;
    return basePrice + fee;
  }, [price]);

  if (!open) return null;

  // LuxFin handlers (wallets)
  const handleWalletPayment = async (method: "paypal" | "venmo" | "applepay" | "card") => {
    if (!session?.user?.email) return toast.error("User email required for payment");
    const res = await fetch("/api/luxfin/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        amount: total,
        currency: selectedCurrency,
        customer: session.user.email,        // unique customer identifier
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

  // EU/Western + US country list
  const countries = [
    // EU countries
    { code: "AT", name: "Austria", currency: "EUR" },
    { code: "BE", name: "Belgium", currency: "EUR" },
    { code: "BG", name: "Bulgaria", currency: "EUR" },
    { code: "HR", name: "Croatia", currency: "EUR" },
    { code: "CY", name: "Cyprus", currency: "EUR" },
    { code: "CZ", name: "Czechia", currency: "EUR" },
    { code: "DK", name: "Denmark", currency: "EUR" },
    { code: "EE", name: "Estonia", currency: "EUR" },
    { code: "FI", name: "Finland", currency: "EUR" },
    { code: "FR", name: "France", currency: "EUR" },
    { code: "DE", name: "Germany", currency: "EUR" },
    { code: "GR", name: "Greece", currency: "EUR" },
    { code: "HU", name: "Hungary", currency: "EUR" },
    { code: "IE", name: "Ireland", currency: "EUR" },
    { code: "IT", name: "Italy", currency: "EUR" },
    { code: "LV", name: "Latvia", currency: "EUR" },
    { code: "LT", name: "Lithuania", currency: "EUR" },
    { code: "LU", name: "Luxembourg", currency: "EUR" },
    { code: "MT", name: "Malta", currency: "EUR" },
    { code: "NL", name: "Netherlands", currency: "EUR" },
    { code: "PL", name: "Poland", currency: "EUR" },
    { code: "PT", name: "Portugal", currency: "EUR" },
    { code: "RO", name: "Romania", currency: "EUR" },
    { code: "SK", name: "Slovakia", currency: "EUR" },
    { code: "SI", name: "Slovenia", currency: "EUR" },
    { code: "ES", name: "Spain", currency: "EUR" },
    { code: "SE", name: "Sweden", currency: "EUR" },
  
    // US
    { code: "US", name: "United States", currency: "USD" },
  ];
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white/10 rounded-2xl shadow-lg overflow-y-auto max-h-[90vh] p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-white hover:text-white/50"
        >
          < X />
        </button>

        {/* Creator */}
        <div className="flex items-center gap-3 mb-4">
          <img src={avatarUrl || "" } alt={creator?.name} className="w-10 h-10 rounded-full" />
          <span className="font-medium">{creator?.name}</span>
        </div>

        {/* Country + Currency */}
        <div className="space-y-4 mb-6">
        <div>
  <label className="block text-sm text-white font-medium">Select Your Country</label>
  <select
    value={selectedCountry}
    onChange={(e) => {
      const code = e.target.value
      setSelectedCountry(code)
      const c = countries.find((c) => c.code === code)
      setSelectedCurrency(c?.currency.toString() || "")
      console.log(selectedCurrency)
    }}
    className="w-full border border-gray-700 bg-gray-800 text-white rounded px-3 py-2"
  >
    <option value="" className="bg-gray-800 text-white">-- Select --</option>
    {countries.map((c) => (
      <option key={c.code} className="bg-gray-800 text-white" value={c.code}>
        {c.name}
      </option>
    ))}
  </select>
</div>

          {selectedCurrency && (
            <p className="text-sm text-gray-300">
              Currency: <strong>{selectedCurrency}</strong>
            </p>
          )}
        </div>

        {/* Payment UI */}
        {selectedCountry === "US" ? (
  // --- USA Wallet Payments ---
  <div className="space-y-4 flex-1 flex-row items-center">
    <div className="flex flex-wrap gap-3">
    <Chip
    icon={
      <Image
        src="/PayPal_Logo_Icon_2014.svg.png"
        alt="PayPal"
        width={18}
        height={18}
      />
    }
    label="PayPal"
    clickable
    color="primary"
    onClick={() => handleWalletPayment("paypal")}
  />
      <Chip
        icon={
          <Image 
          src="/Venmo_logo.png"
          alt="Venmo"
          width={18}
          height={18}
          />
        }
        label="Venmo"
        clickable
        color="secondary"
        onClick={() => handleWalletPayment("venmo")}
      />
      <Chip
        icon={
          <Image
            src="/Apple_logo_black.svg"
            alt="Apple"
            width={18}
            height={18}
          />
        }
        label="Apple Pay"
        clickable
        sx={{ backgroundColor: "#000", color: "#fff" }}
        onClick={() => handleWalletPayment("applepay")}
      />
    </div>
    <p className="text-xs text-gray-400">
      PayPal™ and Venmo™ are trademarks of PayPal, Inc. Apple Pay® is a
      trademark of Apple Inc.
    </p>
  </div>
) : selectedCountry ? (
  // --- Non-US Card Payments ---
  <Chip
    icon={<CreditCard size={18} />}
    label="Pay via Card"
    clickable
    color="success"
    disabled={!termsAccepted}
    onClick={() => handleWalletPayment("card")}
  />
) : (
  <p className="text-gray-400 text-sm">Please select your country to continue.</p>
)}

        {/* Terms */}
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            className="cursor-pointer w-5 h-5"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span className="text-md text-gray-400">
            By continuing you agree to our{" "}
            <Link href="/tos" target="_blank" className="underline">
              Terms and Conditions
            </Link>
            .
          </span>
        </div>

        {/* Branding (moved below form/buttons) */}
        <div className="mt-6 text-center">
          <h2 className="text-lg font-bold">Monara Club</h2>
          <p className="text-sm">Country of Registration: Finland</p>
          <p className="font-semibold mt-1">
            Total: {selectedCurrency.toString() === "EUR" ? "€" : "$" }{total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import toast from "react-hot-toast";
import Link from "next/link";
import { Creator } from "@/app/types";

// -------------------
// Schema (for non-US cards)
// -------------------
const FormSchema = z.object({
  cardholderName: z.string().min(2).max(50),
  cardNumber: z.string().refine(
    (val) => /^\d{13,19}$/.test(val.replace(/\s/g, "")),
    "Invalid card number format"
  ),
  expiryMonth: z.string().min(1).max(2),
  expiryYear: z.string().min(4).max(4),
  cvv: z.string().min(3).max(4),
  billingAddress: z.string().min(5),
  billingCity: z.string().min(2),
  billingZip: z.string().min(2),
  billingCountry: z.string().min(2),
});

type CreditCardFormData = z.infer<typeof FormSchema>;

interface PaymentFormProps {
  type: "post" | "subscription" | "tip" | "";
  open: boolean;
  onClose: () => void;
  creator: Creator;
  avatarUrl: string;
  price: number | null;
}

const PLATFORM_FEE_RATE = 0.05;

export default function PaymentForm({
  type,
  open,
  onClose,
  creator,
  avatarUrl,
  price,
}: PaymentFormProps) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      billingAddress: "",
      billingCity: "",
      billingZip: "",
      billingCountry: "",
    },
  });

  const total = useMemo(() => {
    const basePrice = price ?? 0;
    const fee = basePrice * PLATFORM_FEE_RATE;
    return basePrice + fee;
  }, [price]);

  if (!open) return null;

  // LuxFin handlers (wallets)
  const handleWalletPayment = async (method: "paypal" | "venmo" | "applepay") => {
    if (!user?.email) return toast.error("User email required for payment");
  
    const res = await fetch("/api/luxfin/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        amount: total,
        customer: user.email,        // unique customer identifier
        product: `${creator.name} - ${type}`,
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

  // Non-US card submit
  const onSubmit = (data: CreditCardFormData) => {
    toast.success(
      <div className="space-y-2">
        <p className="font-semibold">Payment Submitted</p>
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 text-xs">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    );
  };

  // EU/Western + US country list
  const countries = [
    { code: "US", name: "United States", currency: "USD" },
    { code: "FI", name: "Finland", currency: "EUR" },
    { code: "DE", name: "Germany", currency: "EUR" },
    { code: "FR", name: "France", currency: "EUR" },
    { code: "GB", name: "United Kingdom", currency: "GBP" },
    { code: "CA", name: "Canada", currency: "CAD" },
    { code: "AU", name: "Australia", currency: "AUD" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white/10 rounded-2xl shadow-lg overflow-y-auto max-h-[90vh] p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-white/50"
        >
          ×
        </button>

        {/* Creator */}
        <div className="flex items-center gap-3 mb-4">
          <img src={avatarUrl} alt={creator.name} className="w-10 h-10 rounded-full" />
          <span className="font-medium">{creator.name}</span>
        </div>

        {/* Country + Currency */}
        <div className="space-y-4 mb-6">
        <div>
  <label className="block text-sm font-medium">Select Country</label>
  <select
    value={selectedCountry}
    onChange={(e) => {
      const code = e.target.value
      setSelectedCountry(code)
      const c = countries.find((c) => c.code === code)
      setSelectedCurrency(c?.currency || "")
    }}
    className="w-full border rounded px-3 py-2"
  >
    <option value="">-- Select --</option>
    {countries.map((c) => (
      <option key={c.code} value={c.code}>
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
          <div className="space-y-4">
            <div className="badges">
              <span>For USA</span>
            </div>
            <div className="space-y-4">
    <Button onClick={() => handleWalletPayment("paypal")}>Pay via PayPal</Button>
    <Button onClick={() => handleWalletPayment("venmo")}>Pay via Venmo</Button>
    <Button onClick={() => handleWalletPayment("applepay")}>Pay via Apple Pay</Button>
  </div>
            <p className="text-xs text-gray-400">
              PayPal™ and Venmo™ are trademarks of PayPal, Inc. Apple Pay® is a
              trademark of Apple Inc.
            </p>
          </div>
        ) : selectedCountry ? (
          // --- Non-US Card Payments ---
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <input {...field} className="border rounded px-3 py-2 w-full" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <input {...field} className="border rounded px-3 py-2 w-full" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Expiry Month</FormLabel>
                      <input {...field} className="border rounded px-3 py-2 w-full" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Expiry Year</FormLabel>
                      <input {...field} className="border rounded px-3 py-2 w-full" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <input {...field} className="border rounded px-3 py-2 w-full" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Address</FormLabel>
                    <input {...field} className="border rounded px-3 py-2 w-full" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <input {...field} className="border rounded px-3 py-2 w-full" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingZip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP / Postal Code</FormLabel>
                    <input {...field} className="border rounded px-3 py-2 w-full" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <input
                      {...field}
                      value={selectedCountry}
                      readOnly
                      className="border rounded px-3 py-2 w-full"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={!form.formState.isValid || !termsAccepted}
              >
                {form.formState.isSubmitting ? "Processing..." : "Pay"}
              </Button>
            </form>
          </Form>
        ) : (
          <p className="text-gray-400 text-sm">Please select your country to continue.</p>
        )}

        {/* Terms */}
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span className="text-xs text-gray-400">
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
            Total: {selectedCurrency} {total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

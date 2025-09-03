/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import toast from "react-hot-toast";
import Link from "next/link";
import { Creator } from "@/app/types";

// -------------------
// Validation Schema
// -------------------
const FormSchema = z.object({
  cardholderName: z.string().min(2).max(50),
  cardNumber: z.string().refine((val) => /^\d{13,19}$/.test(val.replace(/\s/g, "")), "Invalid card number format"),
  expiryMonth: z.string().refine((val) => parseInt(val) >= 1 && parseInt(val) <= 12, "Invalid month"),
  expiryYear: z.string().refine((val) => {
    const year = parseInt(val);
    const now = new Date().getFullYear();
    return year >= now && year <= now + 20;
  }, "Invalid year"),
  cvv: z.string().min(3).max(4).refine((val) => /^\d+$/.test(val), "CVV must be digits"),

  // 🏠 Billing fields
  billingAddress: z.string().min(5, "Address is required"),
  billingCity: z.string().min(2, "City is required"),
  billingZip: z.string().min(2, "ZIP/Postal code is required"),
  billingCountry: z.string().min(2, "Country is required"),
}).refine(
    (data) => {
      if (!data.expiryMonth || !data.expiryYear) return true;
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expiryYear = parseInt(data.expiryYear);
      const expiryMonth = parseInt(data.expiryMonth);

      return (
        expiryYear > currentYear ||
        (expiryYear === currentYear && expiryMonth >= currentMonth)
      );
    },
    {
      message: "Card has expired",
      path: ["expiryYear"],
    }
  );

type CreditCardFormData = z.infer<typeof FormSchema>;

// -------------------
// Types
// -------------------
interface PaymentFormProps {
  type: "post" | "subscription" | "tip" | "";
  open: boolean;
  onClose: () => void;
  creator: Creator;
  avatarUrl: string;
  price: number | null; // base price
}

const PLATFORM_FEE_RATE = 0.05; // 5% platform fee

export default function PaymentForm({
  type,
  open,
  onClose,
  creator,
  avatarUrl,
  price,
}: PaymentFormProps) {
  const [detectedCountry, setDetectedCountry] = useState("FI");
  const [termsAccepted, setTermsAccepted] = useState(false)
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
      billingCountry: detectedCountry, // auto-filled
    },
  });

  const [isCardValid, setIsCardValid] = useState(false);
  const [vatRate, setVatRate] = useState(0);

  useEffect(() => {
    fetch("/api/get-country")
      .then((res) => res.json())
      .then((data) => {
        if (data.country) setDetectedCountry(data.country);
      });
  }, []);
  useEffect(() => {
    async function fetchVat() {
      try {
        const country = detectedCountry.toLowerCase();
        const res = await fetch(`/api/vat/${country}`);
        const data = await res.json();
        setVatRate(data.vatRate ?? 0);
      } catch {
        setVatRate(0);
      }
    }
    fetchVat();
  }, [detectedCountry]);
  
  const total = useMemo(() => {
    const basePrice = price ?? 0; // fallback to 0 if price is null
    const fee = basePrice * PLATFORM_FEE_RATE;
    const vat = (basePrice + fee) * (vatRate / 100); // API returns percentages like 21
    return basePrice + fee + vat;
  }, [price, vatRate]);

  if (!open) return null;

  const onSubmit = (data: CreditCardFormData) => {
    toast.success(
      <div className="space-y-2">
        <p className="font-semibold">Payment Information Submitted</p>
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 text-xs">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    );
  };

  const handleValidationChange = (isValid: boolean) => {
    setIsCardValid(isValid);
  };

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
<div className="relative w-full max-w-md bg-white/10 rounded-2xl shadow-lg overflow-y-auto max-h-[90vh] p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 cursor-pointer right-4 text-white hover:text-white/50"
          aria-label="Close"
        >
          ×
        </button>

        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-4">
          <img src={avatarUrl} alt={creator.name} className="w-10 h-10 rounded-full" />
          <span className="font-medium">{creator.name}</span>
        </div>

        <div>
          <h2 className="text-center text-2xl font-bold">Monara Club</h2>
          <h2 className="text-center text-2xl font-bold">Country of Registration: Finland</h2>
          </div>
        <div className="max-w-md mx-auto p-6 space-y-6">
          <div className="text-center">
          <h2 className="text-2xl font-bold">Payment Information</h2>
          <p className="text-muted-foreground">
            Enter your credit card details
          </p>
          <p className="mt-2 font-semibold">{type.toUpperCase()}</p>
          <p className="mt-1 font-semibold">Total: €{total.toFixed(2)}</p>
        </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormDescription>Full name on card</FormDescription>
                    <input
                      {...field}
                      className="border rounded px-3 py-2 w-full"
                      placeholder="John Doe"
                    />
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
                    <input
                      {...field}
                      className="border rounded px-3 py-2 w-full"
                      placeholder="1234 5678 9012 3456"
                    />
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
                      <input {...field} className="border rounded px-3 py-2 w-full" placeholder="MM" />
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
                      <input {...field} className="border rounded px-3 py-2 w-full" placeholder="YYYY" />
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
                    <input {...field} className="border rounded px-3 py-2 w-full" placeholder="123" />
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
                      <input {...field} className="border rounded px-3 py-2 w-full" placeholder="123 Main St" />
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
                      <input {...field} className="border rounded px-3 py-2 w-full" placeholder="Helsinki" />
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
                      <input {...field} className="border rounded px-3 py-2 w-full" placeholder="00100" />
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
                      <input {...field} className="border rounded px-3 py-2 w-full" placeholder="FI" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="space-y-4">
              <Button
                  type="submit"
                  className="w-full"
                  onClick={() => handleValidationChange(form.formState.isValid)}
                  disabled={!form.formState.isValid || !isCardValid || !termsAccepted}
                >
                  {form.formState.isSubmitting ? "Processing..." : "Process Payment"}
                </Button>
              </div>
              
            </form>
          </Form>
        </div>

        <div className="flex flex-col gap-4 mt-4">
  {/* Terms and Conditions Checkbox */}
  <label className="relative flex items-center space-x-2 text-sm text-gray-500 cursor-pointer">
  <input
    type="checkbox"
    className="peer absolute opacity-0 w-4 h-4"
    checked={termsAccepted}
    onChange={(e) => setTermsAccepted(e.target.checked)}
  />
  <span className="w-4 h-4 border border-gray-300 rounded peer-checked:bg-blue-600 flex-shrink-0 flex items-center justify-center">
    <svg
      className="w-3 h-3 text-white hidden peer-checked:block"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  </span>
  <span>
    By continuing you agree to our{" "}
    <Link href="/tos" target="_blank" className="underline">
      Terms and Conditions
    </Link>
    .
  </span>
</label>

  {/* Card Logos */}
  <div className="flex flex-row items-center space-x-4 mt-2">
    <img
      src="/visa.svg"
      alt="Visa"
      className="h-6 object-contain"
    />
    <img
      src="/mastercard.svg"
      alt="Mastercard"
      className="h-6 object-contain"
    />
  </div>
</div>
      </div>
    </div>
  );
}

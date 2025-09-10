"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">⚠️ Payment Cancelled</h1>
      <p className="mb-6 text-gray-300 text-center">
        Your payment was not completed. You can try again anytime.
      </p>
      <Link
        href="/home"
        className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
      >
        Return to Home
      </Link>
    </div>
  );
}

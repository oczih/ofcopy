"use client";

import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🎉 Payment Successful!</h1>
      <p className="mb-6 text-gray-300 text-center">
        Thank you for your purchase. Your payment has been processed
        successfully.
      </p>
      <Link
        href="/home"
        className="px-4 py-2 bg-pink-500 rounded-lg hover:bg-pink-600 transition"
      >
        Go back to Home
      </Link>
    </div>
  );
}

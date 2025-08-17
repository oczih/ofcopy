'use client'

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GuidelinesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 py-12 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push("/login")}
        className="absolute top-8 left-8 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Card */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-white mt-16 sm:mt-0">
        <h1 className="text-3xl font-extrabold mb-6 text-pink-400 text-center">
          Fanslio Community Guidelines
        </h1>

        <div className="space-y-4 text-left text-gray-300">
          <p>
            Fanslio is committed to building a safe, respectful, and creative space for all users.
            These guidelines apply to creators, fans, and partners alike.
          </p>

          <h2 className="text-2xl font-semibold mt-4 mb-2">1. Respect & Safety</h2>
          <p>
            Harassment, hate speech, threats, or targeted abuse are not tolerated.
            Treat others with dignity and respect.
          </p>

          <h2 className="text-2xl font-semibold mt-4 mb-2">2. Content Standards</h2>
          <p>
            Content must comply with local laws and Fanslio&apos;s policies.
            Exploitative, harmful, or illegal material is strictly prohibited.
          </p>

          <h2 className="text-2xl font-semibold mt-4 mb-2">3. Integrity & Transparency</h2>
          <p>
            Be honest about your identity and role. Impersonation, scams, and fraudulent behavior
            are grounds for account suspension or removal.
          </p>

          <p>
            Violations may lead to content removal, suspension, or account termination.
            Report concerns to{" "}
            <span className="underline">support@fanslio.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

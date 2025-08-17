'use client'

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function DmcaPage() {
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
          DMCA Policy
        </h1>

        <div className="space-y-4 text-left text-gray-300">
          <p>
            Fanslio respects intellectual property rights and complies with the U.S. Digital Millennium
            Copyright Act (DMCA). We also operate under Finland and EU regulations.
          </p>

          <h2 className="text-2xl font-semibold mt-4 mb-2">Submitting a DMCA Notice</h2>
          <p>
            If you believe your copyrighted work has been used without authorization,
            please provide:
          </p>

          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Identification of the copyrighted work.</li>
            <li>Link(s) to infringing material.</li>
            <li>Your contact details (name, address, email).</li>
            <li>A statement of good faith belief that the use is not authorized.</li>
            <li>Your signature (physical or electronic).</li>
          </ul>

          <p>
            Send notices to <span className="underline">support@fanslio.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 py-12 relative">
      <button
        onClick={() => window.history.back()}
        className="absolute top-8 cursor-pointer left-8 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-white mt-16 sm:mt-0">
        <h1 className="text-3xl font-extrabold mb-6 text-pink-400 text-center">Privacy Policy</h1>
        <div className="space-y-4 text-left">
          <div>
            <span className="block font-bold text-lg mb-1">Effective Date:</span>
            <span className="text-gray-400">17.8.2025</span>
          </div>
          <p>
            This Privacy Policy explains how Fanslio collects, uses, and protects your personal data in compliance with the EU General Data Protection Regulation (GDPR).
          </p>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">1. Information We Collect</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li><span className="font-semibold">Account Data:</span> Name, email address, payment details.</li>
              <li><span className="font-semibold">Usage Data:</span> IP address, device info, browser type.</li>
              <li><span className="font-semibold">Content Data:</span> Files you upload.</li>
              <li><span className="font-semibold">Payment Data:</span> Processed securely by x.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">2. How We Use Your Information</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>To provide and maintain the platform.</li>
              <li>For user authentication and account security.</li>
              <li>For payment processing via x.</li>
              <li>To improve our services.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">3. Cookies and Tracking</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>We use cookies for session management, analytics, and improving user experience.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">4. Data Sharing</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>With Stripe for payment processing.</li>
              <li>With AWS for data storage (S3 buckets).</li>
              <li>With analytics providers.</li>
              <li>We do not sell personal data.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">5. Data Retention</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>We retain data as long as necessary to provide services, comply with legal obligations, and resolve disputes.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">6. Your Rights</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Under GDPR, you have the right to:</li>
              <ul className="list-disc list-inside ml-8 text-gray-300">
                <li>Access your data.</li>
                <li>Request correction or deletion.</li>
                <li>Object to processing.</li>
                <li>Request data portability.</li>
              </ul>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">7. International Data Transfers</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Data may be transferred outside the EU but will be protected under appropriate safeguards.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">8. Security</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>We implement industry-standard security measures to protect your data.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">9. Contact</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>For privacy concerns or data requests, contact: <span className="underline">support@fanslio.com</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
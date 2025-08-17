'use client'

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Head from "next/head";

export default function CookiePolicyPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Cookie Policy | Fanslio</title>
        <meta name="description" content="Fanslio Cookie Policy explaining how we use cookies for authentication, analytics, and site functionality, compliant with GDPR and Finnish regulations." />
        <meta name="keywords" content="Fanslio, Cookies, GDPR, Finland, Authentication, Google OAuth, Twitter OAuth, Session Cookies, Privacy" />
      </Head>

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
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-3xl text-white mt-16 sm:mt-0 overflow-x-auto">
          <h1 className="text-3xl font-extrabold mb-6 text-pink-400 text-center">
            Cookie Policy
          </h1>

          <div className="space-y-4 text-gray-300">
            <p>
              At Fanslio, we use cookies to enhance your experience, ensure secure authentication, and improve site functionality. This Cookie Policy explains what cookies we use, why, and your rights under GDPR and Finnish law.
            </p>

            <h2 className="text-2xl font-semibold mt-4 mb-2">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full mb-4 border-collapse border border-gray-600 text-gray-300">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="border px-4 py-2">Cookie Name</th>
                    <th className="border px-4 py-2">Purpose</th>
                    <th className="border px-4 py-2">Type</th>
                    <th className="border px-4 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2">__next_hmr_refresh_hash__</td>
                    <td className="border px-4 py-2">Development-only HMR refresh hash for Next.js</td>
                    <td className="border px-4 py-2">Session</td>
                    <td className="border px-4 py-2">Only used in development, not present in production.</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">next-auth.callback-url</td>
                    <td className="border px-4 py-2">Stores redirect URL after login (OAuth or credentials)</td>
                    <td className="border px-4 py-2">Session</td>
                    <td className="border px-4 py-2">Used to redirect user after successful login.</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">next-auth.csrf-token</td>
                    <td className="border px-4 py-2">CSRF protection for authentication forms</td>
                    <td className="border px-4 py-2">Session, HttpOnly</td>
                    <td className="border px-4 py-2">Prevents unauthorized form submissions. Secure and HttpOnly.</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">next-auth.session-token</td>
                    <td className="border px-4 py-2">Stores your active user session</td>
                    <td className="border px-4 py-2">Persistent/Session, HttpOnly, Secure</td>
                    <td className="border px-4 py-2">Allows users to remain logged in. Sent over HTTPS only.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold mt-4 mb-2">Authentication Methods</h2>
            <ul className="list-disc ml-6 mb-4">
              <li>Login via Google OAuth</li>
              <li>Login via Twitter OAuth</li>
              <li>Email/password credentials signup/login</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4 mb-2">Third-Party Cookies</h2>
            <p>
              We may also use third-party cookies for analytics, advertising, or integrations (e.g., social logins). These cookies are governed by the respective third-party policies.
            </p>

            <h2 className="text-2xl font-semibold mt-4 mb-2">Your Rights</h2>
            <ul className="list-disc ml-6 mb-4">
              <li>Access and review cookies stored by this site</li>
              <li>Withdraw consent for non-essential cookies</li>
              <li>Request deletion of personal data related to cookies</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4 mb-2">Managing Cookies</h2>
            <p>
              You can manage cookies via your browser settings. Essential cookies for authentication and site functionality cannot be disabled without affecting core features.
            </p>

            <h2 className="text-2xl font-semibold mt-4 mb-2">Support</h2>
            <p>
              If you have questions or concerns regarding cookies or privacy, contact us at <a href="mailto:support@fanslio.com" className="text-blue-500 underline">support@fanslio.com</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

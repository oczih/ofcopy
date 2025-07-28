"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setLoading(false);
      if (res.ok) {
        setSent(true);
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      toast.error("Internal server error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#13072c] px-4">
      <Toaster position="top-center" />

      <h1 className="text-4xl font-extrabold text-white mb-4 text-center">Reset Password</h1>

      <div className="w-full max-w-md bg-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {!sent ? (
          <>
            <p className="text-sm text-white font-bold mb-6 text-center">
              Enter your email and we’ll send instructions to reset your password.
            </p>

            <div className="space-y-4 w-full">
              <input
                type="email"
                placeholder="Email Address*"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`w-full pl-4 pr-4 py-3 bg-white/10 rounded-xl shadow-sm text-white placeholder-gray-400 transition-all duration-200 ${
                  errors.email ? "border border-red-500" : "border border-transparent"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending reset link..." : "Send reset link"}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-white font-bold text-center">
            If an account with that email exists, reset instructions have been sent.
          </p>
        )}
      </div>
    </div>
  );
}

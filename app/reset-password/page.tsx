"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.password || form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (form.confirm !== form.password) {
      errs.confirm = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = async () => {
    if (!validate() || !token) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Reset failed");
      } else {
        toast.success("Password reset successful! You can now log in.");
        router.push("/login");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#13072c]">
    <Toaster
  position="top-center"
  reverseOrder={false}
/>
      <h1 className="text-4xl font-extrabold text-white mb-4">Set New Password</h1>

      <div className="w-full max-w-md bg-white/10 rounded-2xl shadow-xl p-8">
        <p className="text-sm text-white font-bold mb-6 text-center">
          Enter your new password below.
        </p>

        <div className="space-y-4">
          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-4 pr-12 py-3 bg-white/10 rounded-xl shadow-sm text-white placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.password}
              </p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full pl-4 pr-4 py-3 bg-white/10 rounded-xl shadow-sm text-white placeholder-gray-400"
            />
            {errors.confirm && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.confirm}
              </p>
            )}
          </div>

          <button
            onClick={handleReset}
            disabled={loading || !token}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition cursor pointer disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

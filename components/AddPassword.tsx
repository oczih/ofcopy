'use client';

import { useState } from 'react';
import { useSearchParams} from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

export default function AddPassword() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.password || form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (form.confirmPassword !== form.password) {
      errs.confirm = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Setup failed");
      } else {
        toast.success("Verification email sent! Please check your email to confirm your password setup.");
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-white/5 rounded-2xl p-10 border border-white/10'>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white">Add A Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.password}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="mt-1 block w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
              </p>
            )}
          </div>
          
          <button
            onClick={() => handleSubmit}
            disabled={loading}
            className="w-full px-4 py-2 rounded-full hover:bg-green-500 bg-white/50 transition-all bg-duration-300 cursor-pointer"
          >
            {loading ? 'Setting up...' : 'Set Up Password'}
          </button>
        </div>
    </div>
  );
}
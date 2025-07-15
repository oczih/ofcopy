'use client';

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function ApplyCreatorForm() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ displayName: "", bio: "", socialLinks: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return <div>Loading...</div>;
  if (!session) {
    signIn();
    return <div>Redirecting to login...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/creators/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          bio: form.bio,
          socialLinks: form.socialLinks.split(",").map(s => s.trim()),
          email: session.user.email,
          username: session.user.name || session.user.email,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit application");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return <div className="max-w-lg mx-auto py-12">Application submitted! We'll review it soon.</div>;

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Apply to Become a Creator</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/10 p-6 rounded-xl">
        <div>
          <label className="block mb-1">Display Name</label>
          <input name="displayName" value={form.displayName} onChange={handleChange} required className="w-full p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} required className="w-full p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1">Social Links (comma separated)</label>
          <input name="socialLinks" value={form.socialLinks} onChange={handleChange} className="w-full p-2 rounded" />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button type="submit" disabled={loading} className="bg-pink-500 text-white px-4 py-2 rounded">
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
} 
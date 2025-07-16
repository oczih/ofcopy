"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function ApplyCreator() {
  return <ApplyCreatorPage />;
}

function ApplyCreatorPage() {
  const { data: session, status, update } = useSession();
  const [form, setForm] = useState({ displayName: "", bio: "", socialLinks: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (success && session?.user && !session.user.creator) {
      interval = setInterval(async () => {
        // Fetch user from backend
        const res = await fetch(`/api/users/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user?.creator) {
            await update();
            window.location.reload();
          }
        }
      }, 10000); // poll every 10 seconds
    }
    return () => clearInterval(interval);
  }, [success, session, update]);

  if (status === "loading") return null;
  if (!session?.user) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      <Header />
      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8 relative z-10">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl max-w-lg w-full text-center animate-fade-in">
            <h1 className="text-2xl font-bold mb-4 gradient-text">Application Submitted!</h1>
            <p className="text-gray-300 mb-6">We&apos;ll review your application soon. Thank you for your interest in becoming a creator!</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <Header />
      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8 relative z-10">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl max-w-lg w-full animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 gradient-text text-center">Apply to Become a Creator</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 text-white font-medium">Display Name</label>
                <Input name="displayName" value={form.displayName} onChange={handleChange} required className="w-full" />
              </div>
              <div>
                <label className="block mb-1 text-white font-medium">Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} required className="w-full p-2 rounded bg-white/5 text-white border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition-all duration-300" rows={4} />
              </div>
              <div>
                <label className="block mb-1 text-white font-medium">Social Links (comma separated)</label>
                <Input name="socialLinks" value={form.socialLinks} onChange={handleChange} className="w-full" />
              </div>
              {error && <div className="text-red-500 text-center">{error}</div>}
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
} 
"use client";
import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Button } from "./components/ui/button";
import { Sparkles, TrendingUp, Users, Star } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function Page() {
  return (
    <SessionProvider>
      <LandingPage />
    </SessionProvider>
  );
}

function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);
  if(loading){
    return (
      <div className="flex items-center justify-center h-full">
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }
  if (session?.user) {
    
    if (typeof window !== "undefined") router.replace("/home");
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </div>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative z-10">
        {/* Hero Section */}
        <section className="w-full max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg mb-2">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent mb-2">
              Monetize Your Passion. <br /> Grow Your Community.
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              CreatorHub is the all-in-one platform for creators to share exclusive content, build a loyal fanbase, and earn recurring income. <span className="text-pink-400 font-semibold">Launch your creator business</span> today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/signup")}
            >
              Become a Creator
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/signup")}
            >
              Sign up as a Fan
            </Button>
          </div>
        </section>
        {/* Features Section */}
        <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 animate-fade-in">
          <div className="bg-white/10 rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col items-center text-center">
            <Users className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Grow Your Audience</h3>
            <p className="text-gray-300">Reach new fans and connect with your most loyal supporters in one place.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col items-center text-center">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Earn Recurring Income</h3>
            <p className="text-gray-300">Monetize your content with flexible subscription options and exclusive perks.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col items-center text-center">
            <Star className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Deliver Premium Content</h3>
            <p className="text-gray-300">Share photos, videos, and updates with your fans—publicly or exclusively.</p>
          </div>
        </section>
        {/* Call to Action for Fans */}
        <section className="w-full max-w-2xl mx-auto text-center animate-fade-in">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 shadow-xl flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-2">Not a creator? Become a fan!</h2>
            <p className="text-gray-300 mb-4">Sign up to support your favorite creators, unlock exclusive content, and join a vibrant community.</p>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/signup")}
            >
              Sign up as a Fan
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
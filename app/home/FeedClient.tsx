'use client';

import { Button } from "../../components/ui/button";
import { CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Creator, Subscription, User } from "../types";
import { Badge } from "../../components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { CreatorPostCard } from "../../components/CreatorPostCard";
import { Session } from "next-auth";
import creatorservice from "../services/creatorservice";
interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}


type Stats = {
  payouts: number;
  earningsLast30: number;
  subscribers: number;
  followers: number;
};

export default function App({ creators, users, session}: AppProps) {
  const [showBanner, setShowBanner] = useState(true);
  const [postSignedUrls, setPostSignedUrls] = useState<Record<string, string>>({});
  const [page, setPage] = useState("Feed");
  const [creator, setCreator] = useState<Creator | undefined>(undefined)
  const [stats, setStats] = useState<Stats | null>(null);
  const HIDE_DURATION = 2 * 60 * 1000;
  const notifiedCreators = useRef<Set<string>>(new Set());
  // Manage loading and redirect on unauthenticated
  useEffect(() => {
    async function fetchStats() {
      if (!creator?._id) return;
      const res = await fetch(`/api/creators/${creator._id}/stats/`);
      const data = await res.json();
      setStats(data);
    }
    fetchStats();
  }, [creator?._id, setStats]);
  // Fetch signed URLs only client-side when creators are present
  const postKeysSignature = JSON.stringify(
    creators?.flatMap(c => (c.posts || []).map(p => p.s3Key)) || []
  );
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  useEffect(() => {
    function creatorSet() {
      if(session?.user.creator){
        const rightCreator = creators.find((c) => c.user.toString() === session.user._id)
        setCreator(rightCreator)
      }
    }
    creatorSet()
  }, [creators, session])
  useEffect(() => {
    const followedCreatorIds = new Set([
      ...(session?.user.following?.map((f) => f.creatorId.toString()) || []),
      ...(session?.user.subscriptions?.map((s) => s.creatorId.toString()) || []),
    ]);
    setFilteredCreators(creators.filter(
      c => followedCreatorIds.has(c._id) || session?.user._id === c.user.toString()
    ));
  }, [creators, session]);
  useEffect(() => {
    async function fetchSignedUrls() {
      if (!creators || creators.length === 0) return;
  
      const allPosts = creators.flatMap((creator) => creator.posts || []);
      const signedUrlsMap: Record<string, string> = {};
      const postsWithKeys = allPosts.filter(post => post.s3Key);
  
      await Promise.all(
        postsWithKeys.map(async (post) => {
          try {
            const res = await fetch("/api/media/download-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ s3Key: post.s3Key }),
            });
      
            if (res.ok) {
              const data = await res.json();
              signedUrlsMap[post._id] = data.downloadUrl;
            }
          } catch (error) {
            console.error("Failed to fetch signed URL for post:", post._id, error);
          }
        })
      );
  
      setPostSignedUrls((prev) => ({ ...prev, ...signedUrlsMap }));
    }
  
    fetchSignedUrls();
  }, [postKeysSignature, creators]);
  

  const handleResendVerification = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user.email, userId: session?.user._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email");
      }

      toast.success("Verification email sent!");
      setShowBanner(false);
      setTimeout(() => setShowBanner(true), HIDE_DURATION);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resend verification email";
      toast.error(message);
    }
  };
  if (!session) {
    // Show a fallback or redirect or login prompt if session not passed
    return <div>Please log in.</div>;
  }

  const handleFollow = async (creator: Creator) => {
    if (!creator) return;
  
    try {
      const alreadyFollowing = session?.user?.following?.some(f => f.creatorId === creator._id);
      if (alreadyFollowing) return;
  
      await creatorservice.followCreator(creator._id);
  
      if (!session?.user._id) {
        console.error("No user ID in session");
        return;
      }
  
      // Only notify if we haven't before
      if (!notifiedCreators.current.has(creator._id)) {
        notifiedCreators.current.add(creator._id);
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "newfollower",
            by: session.user._id,
            forUsers: [creator._id],
            creatorId: creator._id
          }),

        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to create notification:", errorData);
        }
      }
    } catch (err) {
      console.error("Error following creator:", err);
    }
  };
  return (
    <div className="min-h-screen w-full relative">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-transparent to-purple-950/50 pointer-events-none"></div>
      <div className="flex justify-center">
        <main className="relative z-10 space-y-8 max-w-3xl w-full px-4 py-8">
          {/* Toggle Buttons */}
          {session?.user?.creator && (
            <div className="flex gap-4 justify-center mb-15 mt-15">
              <Button
                className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all cursor-pointer duration-300 text-lg backdrop-blur-lg border border-white/10 ${
                  page === "Dashboard"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-105 shadow-green-500/25"
                    : "bg-white/10 text-green-300 hover:bg-green-500/20 hover:scale-105"
                }`}
                onClick={() => setPage("Dashboard")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      page === "Dashboard" ? "bg-white" : "bg-green-400"
                    } animate-pulse`}
                  ></div>
                  Dashboard
                </div>
              </Button>
              <Button
                className={`px-8 py-3 rounded-full font-semibold shadow-lg cursor-pointer  transition-all duration-300 text-lg backdrop-blur-lg border border-white/10 ${
                  page === "Feed"
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-105 shadow-pink-500/25"
                    : "bg-white/10 text-pink-300 hover:bg-pink-500/20 hover:scale-105"
                }`}
                onClick={() => setPage("Feed")}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      page === "Feed" ? "bg-white" : "bg-pink-400"
                    } animate-pulse`}
                  ></div>
                  Feed
                </div>
              </Button>
            </div>
          )}

          {/* Dashboard */}
          {!session?.user?.emailVerified && showBanner &&
        (session.user as User).oauthProvider === "credentials" &&  (
      <div className="flex justify-center z-30 px-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg relative overflow-hidden group text-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="mb-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <h1 className="text-base font-semibold text-white mb-1">Check Your Email</h1>
            <p className="text-gray-300">
             We&apos;ve sent a link to <strong className="text-pink-400">{session?.user.email}</strong>
            </p>
          </div>
          
          <div className="text-xs text-gray-400 space-y-1 text-center">
            <p>Click the link in your email to verify your account.</p>
            <p>Didn&apos;t get it? Check spam or resend below.</p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={handleResendVerification}
              className="bg-pink-600 hover:bg-pink-700 text-white text-xs py-1.5 px-4 rounded-md transition disabled:opacity-50 cursor-pointer"
            >
              Resend Email
            </button>
          </div>
        </div>
      </div>
  )}    
          {/* Feed */}
          {/* Feed */}
          {page === "Feed" && (
  <div className="space-y-10 mt-10">
    {filteredCreators && filteredCreators.length > 0 ? (
      filteredCreators.map((creator) => {
        const isCreator = creator.user === session.user._id;
        const isSubscribed = session.user.subscriptions?.some(
          (sub) => sub.creatorId === creator._id
        );
        const isFollower = session.user.following?.some(
          (f) => f.creatorId === creator._id
        );

        const status: 'subscriber' | 'follower' | 'none' = 
          isSubscribed
          ? 'subscriber'
          : isFollower
          ? 'follower'
          : 'none';

        // Filter posts based on viewableFor
        const visiblePosts = creator.posts?.filter((post) => {
          if (isCreator) return true;
          if (status === 'subscriber') return post.viewableFor === 'subscribers' || post.viewableFor === 'followers';
          if (status === 'follower') return post.viewableFor === 'followers';
          return false; // nobody else sees any posts
        });

        if (!visiblePosts || visiblePosts.length === 0) return null;

        const handleDeletePost = async (creatorId: string, postId: string) => {
          try {
            const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete post");

            setFilteredCreators((prev) =>
              prev.map((c) =>
                c._id === creatorId
                  ? { ...c, posts: c.posts?.filter(p => p._id !== postId) }
                  : c
              )
            );
          } catch (error) {
            console.error(error);
            alert('Failed to delete post');
          }
        };

        return (
          <div key={creator._id} className="space-y-8">
            {visiblePosts.map((post) => (
              <CreatorPostCard
                key={post._id}
                creator={creator}
                post={post}
                session={session}
                user={session.user as User}
                status={status}
                users={users}
                signedUrl={postSignedUrls[post._id]}
                handleFollow={handleFollow}
                handleDeletePost={() => handleDeletePost(creator._id, post._id)}
              />
            ))}
          </div>
        );
      })
    ) : (
      <div className="text-center mt-20 text-gray-400">
        No creators to show. Explore and follow your favorite creators!
      </div>
    )}
  </div>
)}


        {page === "Dashboard" && (
  <div className="space-y-10 mt-10">
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-lg">
      <h2 className="text-3xl font-bold text-white mb-6">Welcome, {creator?.name} 👋</h2>
      <p className="text-gray-400 text-lg">Here&apos;s what&apos;s happening in your business today:</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              
              {/* Payouts */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-6 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-sm">Payouts</p>
                <h3 className="text-2xl font-bold text-white">${stats?.payouts || 0}</h3>
                <p className="text-green-400 text-sm mt-1">Total Balance</p>
              </div>

              {/* Earnings */}
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-600/10 p-6 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-sm">Earnings</p>
                <h3 className="text-2xl font-bold text-white">${stats?.earningsLast30|| 0}</h3>
                <p className="text-pink-400 text-sm mt-1">Last 30 days</p>
              </div>

              {/* Subscribers */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 p-6 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-sm">Subscribers</p>
                <h3 className="text-2xl font-bold text-white">{creator?.subscribers.length|| 0}</h3>
                <p className="text-blue-400 text-sm mt-1">Total today</p>
              </div>

              {/* Followers */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 p-6 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-sm">Followers</p>
                <h3 className="text-2xl font-bold text-white">{creator?.followers.length || 0}</h3>
                <p className="text-yellow-400 text-sm mt-1">All time</p>
              </div>
          </div>
    </div>
  </div>
)}

        </main>
      </div>
    </div>
  );
}

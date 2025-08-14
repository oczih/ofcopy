'use client';

import { Button } from "../../components/ui/button";
import { CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Creator, Following, Subscription, User } from "../types";
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

export default function App({ creators, users, session}: AppProps) {
  const [showBanner, setShowBanner] = useState(true);
  const [postSignedUrls, setPostSignedUrls] = useState<Record<string, string>>({});
  const [page, setPage] = useState("Feed");
  const HIDE_DURATION = 2 * 60 * 1000;
  const notifiedCreators = useRef<Set<string>>(new Set());
  // Manage loading and redirect on unauthenticated

  // Fetch signed URLs only client-side when creators are present
  const postKeysSignature = JSON.stringify(
    creators?.flatMap(c => (c.posts || []).map(p => p.s3Key)) || []
  );
  
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

  const followedCreatorIds = new Set([
    ...(session?.user.following?.map((f: Following) => f.creatorId.toString()) || []),
    ...(session?.user.subscriptions?.map((s: Subscription) => s.creatorId.toString()) || []),
  ]);

  const filteredCreators = creators.filter((creator) => {
    const isFollowed = followedCreatorIds.has(creator._id);
    const isOwnCreator = session?.user?._id === creator.user.toString();
    return isFollowed || isOwnCreator;
  });
  
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
                className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 text-lg backdrop-blur-lg border border-white/10 ${
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
                className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 text-lg backdrop-blur-lg border border-white/10 ${
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
          {page === "Feed" && (
          <>
            {/* Creators and their posts with enhanced spacing */}
            <div className="space-y-10 mt-10">
            {filteredCreators && filteredCreators.length > 0 && users && session ? (
              filteredCreators.map((creator) => {
                // Determine status for this creator
                const isSubscribed = session.user.subscriptions?.some(
                  (sub) => sub.creatorId.toString() === creator._id.toString()
                );
                const isFollower = session.user.following?.some(
                  (f) => f.creatorId.toString() === creator._id.toString()
                );

                // Priority: subscriber > follower > none
                const status: 'subscriber' | 'follower' | 'none' = isSubscribed
                  ? 'subscriber'
                  : isFollower
                  ? 'follower'
                  : 'none';

                return (
                  <div key={creator._id} className="space-y-8">
                    {creator.posts && creator.posts.length > 0 &&
                      creator.posts.map((post) => (
                        <div key={post._id} className="transform transition-transform duration-300">
                          <CreatorPostCard
                            creator={creator}
                            post={post}
                            session={session}
                            user={session.user as User}
                            status={status}  // Pass status here
                            users={users}
                            handleFollow={handleFollow}
                            signedUrl={postSignedUrls[post._id]}
                            creators={creators}
                          />
                        </div>
                      ))}
                  </div>
                );
              })
            ) : (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center group hover:bg-white/10 transition-all duration-500">
                <div className="mb-4">
                  <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-pink-400 transition-colors duration-300" />
                  <h3 className="text-xl font-bold text-white mb-2">No Subscriptions or Follows Yet</h3>
                  <p className="text-gray-400 mb-6">Start exploring creators and subscribe to their content to see it here.</p>
                  <Link href="/discover">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                      Discover Creators
                    </Button>
                  </Link>
                </div>
              </div>
              )}
            </div>

            {/* Enhanced User Subscriptions Section */}
              <div className="space-y-6">
                {session?.user.subscriptions && session?.user.subscriptions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {session?.user.subscriptions.slice(0, 6).map((subscription: Subscription) => (
                      <div 
                        key={subscription.creatorId} 
                        className="group bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02] shadow-2xl hover:shadow-pink-500/10 duration-300"
                      >
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <Image 
                                src={subscription.avatarKey || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} 
                                alt={subscription.creatorName}
                                width={50}
                                height={50}
                                className="w-12 h-12 rounded-full border-2 border-pink-500/50 group-hover:border-pink-400 transition-colors duration-300"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-bold text-lg group-hover:text-pink-300 transition-colors duration-300">{subscription.creatorName}</h3>
                              <p className="text-gray-400 text-sm">{subscription.creatorUsername}</p>
                            </div>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-500/30 group-hover:bg-green-500/30 transition-colors duration-300">
                              ${subscription.price}/month
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="text-sm text-gray-400">
                              <p>Status: <span className="text-green-400 capitalize">{subscription.status}</span></p>
                              <p>Next billing: {new Date(subscription.nextBillingDate || subscription.subscriptionDate).toLocaleDateString()}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300 rounded-full px-4 py-2">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                }
              </div>
          </>
        )}
        </main>
      </div>
    </div>
  );
}

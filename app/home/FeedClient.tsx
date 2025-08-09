'use client';

import { Button } from "../../components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Creator, Following, Subscription, User } from "../types";
import { Badge } from "../../components/ui/badge";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { CreatorPostCard } from "../../components/CreatorPostCard";
import { useRouter } from "next/navigation";

interface AppProps {
  creators: Creator[];
  session: any;
  users: User[];
}

export default function App({ creators, users, session}: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [postSignedUrls, setPostSignedUrls] = useState<Record<string, string>>({});
  const [page, setPage] = useState("Feed");

  const HIDE_DURATION = 2 * 60 * 1000;

  // Manage loading and redirect on unauthenticated
  useEffect(() => {
    if (status !== "loading") {
      setLoading(false);
    }
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [router]);

  // Fetch signed URLs only client-side when creators are present
  useEffect(() => {
    async function fetchSignedUrls() {
      if (!creators || creators.length === 0) return;

      const allPosts = creators.flatMap((creator) => creator.posts || []);
      const signedUrlsMap: Record<string, string> = {};

      await Promise.all(
        allPosts.map(async (post) => {
          if (!post.s3Key) return;
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

      setPostSignedUrls(signedUrlsMap);
    }

    fetchSignedUrls();
  }, [creators]);

  const handleResendVerification = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user.email }),
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  const followedCreatorIds = new Set([
    ...(session?.user.following?.map((f: Following) => f.creatorId.toString()) || []),
    ...(session?.user.subscriptions?.map((s: Subscription) => s.creatorId.toString()) || []),
  ]);

  const filteredCreators = creators.filter((creator) => {
    const isFollowed = followedCreatorIds.has(creator.id);
    const isOwnCreator = session?.user?.id === creator.user.toString();
    return isFollowed || isOwnCreator;
  });

  const handleFollow = async (creator: Creator) => {
    if (!creator) return;
    // This function would still call the backend endpoint directly (if you keep this)
    try {
      // For example, a fetch to /api/follow or something
      await fetch(`/api/creators/${creator.id}/follow`, {
        method: "POST",
      });
      toast.success(`Followed ${creator.name}`);
      // Optionally update local state or refetch if needed
    } catch (error) {
      console.error("Error following creator:", error);
      toast.error("Failed to follow creator");
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
          {page === "Dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
              {[
                { value: stats.totalRevenue, label: "Total Earnings", color: "green", prefix: "$" },
                { value: stats.totalSubscriptions, label: "Subscribers", color: "pink" },
                { value: stats.totalCreators, label: "Total Creators", color: "purple" },
                { value: stats.activeCreators, label: "Active Creators", color: "yellow" },
                { value: stats.premiumCreators, label: "Premium Creators", color: "cyan" },
                { value: stats.totalUsers, label: "Total Users", color: "blue" },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${
                      stat.color === "green"
                        ? "from-green-400 to-green-600"
                        : stat.color === "pink"
                        ? "from-pink-400 to-pink-600"
                        : stat.color === "purple"
                        ? "from-purple-400 to-purple-600"
                        : stat.color === "yellow"
                        ? "from-yellow-400 to-yellow-600"
                        : stat.color === "cyan"
                        ? "from-cyan-400 to-cyan-600"
                        : stat.color === "blue"
                        ? "from-blue-400 to-blue-600"
                        : "from-gray-400 to-gray-600"
                    } opacity-30 rounded-3xl -z-10`}
                  ></div>
                  <p className="text-lg font-semibold mb-1 text-white/70">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-extrabold text-white">
                    {stat.prefix || ""}{stat.value ?? "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Feed */}
          {page === "Feed" && (
            <>
              {/* Email verification banner */}
              {showBanner && session?.user?.emailVerified === false && (
                <div className="flex items-center justify-between rounded-lg bg-yellow-100 p-4 mb-4 text-yellow-700 border border-yellow-300">
                  <div className="flex items-center gap-2">
                    <Sparkles />
                    <span>Please verify your email to unlock all features.</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                  >
                    Resend Email
                  </Button>
                </div>
              )}

              {/* Creator list */}
              {filteredCreators.length === 0 ? (
                <div className="text-center mt-8 text-white/60">
                  <MessageCircle className="mx-auto mb-2" size={64} />
                  <p>No creators followed yet. Explore and follow some!</p>
                  <Link href="/discover" className="text-pink-400 hover:underline">
                    Discover Creators
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {filteredCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="rounded-lg p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {creator.avatar ? (
                            <Image
                              src={creator.avatar}
                              alt={creator.name}
                              width={64}
                              height={64}
                              className="rounded-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-white text-xl font-bold">
                              {creator.name[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h2 className="text-xl font-semibold text-white">{creator.name}</h2>
                            <div className="flex flex-wrap gap-1">
                              {creator.tags?.map((tag) => (
                                <Badge
                                  key={tag}
                                  className="uppercase text-xs font-semibold bg-pink-600/80 text-white"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow(creator)}
                        >
                          Follow
                        </Button>
                      </div>

                      {/* Posts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creator.posts?.map((post) => (
                          <CreatorPostCard
                            key={post._id}
                            post={post}
                            signedUrl={postSignedUrls[post._id] || ""}
                            
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

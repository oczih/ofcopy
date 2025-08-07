'use client';

import { Button } from "../../components/ui/button";
import { CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Creator } from "../types";
import { Badge } from "../../components/ui/badge";
import creatorservice from "../services/creatorservice";
import statsservice from "../services/statsservice";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { CreatorPostCard } from "../../components/CreatorPostCard";
import userservice from "../services/userservice";
import { User } from "../types";
import AppWrapper from "../../components/AppWrapper";
import { useRouter } from "next/navigation";

export default function Page() {
  return (
    <SessionProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </SessionProvider>
  );
}

function App() {
  const router = useRouter()
  const { data: session, status } = useSession();
  const [creators, setCreators] = useState<Creator[] | null>(null);
  const [page, setPage] = useState("Feed");
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [stats, setStats] = useState({
    totalCreators: 0,
    activeCreators: 0,
    premiumCreators: 0,
    totalUsers: 0,
    totalSubscriptions: 0,
    totalRevenue: 0,
    averageSubscribers: 0,
    averagePrice: 0
  });
  const HIDE_DURATION = 2 * 60 * 1000;
  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push("/login");
    }
  }, [status, router]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCreators, fetchedStats] = await Promise.all([
          creatorservice.get(),
          statsservice.get()
        ]);
        const fetchedUsers: User[] = await userservice.get();
        setUsers(fetchedUsers);
        
        if (fetchedCreators) {
          const sortedCreators = fetchedCreators.creators.map((creator: Creator) => ({
            ...creator,
            posts: creator?.posts?.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          }));
          setCreators(sortedCreators);
        } else {
          setCreators([]);
        }

        setStats(fetchedStats);
      } catch (error) {
        console.error("Couldn't fetch data: ", error);
        toast.error("Error fetching data");
      }
    };
    fetchData();
  }, []);
  const [postSignedUrls, setPostSignedUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    async function fetchSignedUrls() {
      if (!creators) return;
  
      const allPosts = creators.flatMap(creator => creator.posts || []);
      const signedUrlsMap: Record<string, string> = {};
  
      await Promise.all(
        allPosts.map(async (post) => {
          if (!post.s3Key) return;
  
          try {
            const res = await fetch('/api/media/download-url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ s3Key: post.s3Key }),
            });
  
            if (res.ok) {
              const data = await res.json();
              signedUrlsMap[post._id] = data.downloadUrl;  // <-- use signedUrl here
            }
          } catch (error) {
            console.error('Failed to fetch signed URL for post:', post._id, error);
          }
        })
      );
  
      setPostSignedUrls(signedUrlsMap);
    }
  
    fetchSignedUrls();
  }, [creators]);
  

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
  
  const followedCreatorIds = new Set([
    ...(session?.user.following?.map(f => f.creatorId.toString()) || []),
    ...(session?.user.subscriptions?.map(s => s.creatorId.toString()) || [])
  ]);
  
  const filteredCreators = creators?.filter(creator => {
    const isFollowed = followedCreatorIds.has(creator.id.toString());
    const isOwnCreator = session?.user?.id === creator.user.toString(); // Check if user owns this creator
    return isFollowed || isOwnCreator;
  });
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
   
  const handleFollow = async (creator: Creator) => {
    if (!creator) return;
  
    try {
      const alreadyFollowing = session?.user?.following?.some(f => f.creatorId === creator.id);
      if (alreadyFollowing) return;
  
      await creatorservice.followCreator(creator.id);
  
    } catch (err) {
      console.error('Error following creator:', err);
    }
  };
  
  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session?.user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      toast.success('Verification email sent!');
      setShowBanner(false);
      setTimeout(() => setShowBanner(true), HIDE_DURATION);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      console.log(message)
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen w-full relative">
      <Toaster
  position="top-center"
  reverseOrder={false}
/>
      {/* Dynamic overlay that creates depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-transparent to-purple-950/50 pointer-events-none"></div>
      <div className="flex justify-center">
  <main className="relative z-10 space-y-8 max-w-3xl w-full px-4 py-8">
        {/* Toggle Buttons with enhanced styling */}
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
              <div className={`w-2 h-2 rounded-full ${page === "Dashboard" ? "bg-white" : "bg-green-400"} animate-pulse`}></div>
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
              <div className={`w-2 h-2 rounded-full ${page === "Feed" ? "bg-white" : "bg-pink-400"} animate-pulse`}></div>
              Feed
            </div>
          </Button>
        </div>
            )}
        {/* Dashboard View with enhanced cards */}
        {page === "Dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
            {[
              { value: stats.totalRevenue, label: "Total Earnings", color: "green", prefix: "$" },
              { value: stats.totalSubscriptions, label: "Subscribers", color: "pink" },
              { value: stats.totalCreators, label: "Total Creators", color: "purple" },
              { value: stats.activeCreators, label: "Active Creators", color: "yellow" },
              { value: stats.premiumCreators, label: "Premium Creators", color: "cyan" },
              { value: stats.totalUsers, label: "Total Users", color: "blue" }
            ].map((stat, index) => (
              <div key={index} className="group bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden">
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 to-${stat.color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <span className={`text-3xl font-bold text-${stat.color}-400 mb-2 transition-all duration-300 group-hover:text-4xl`}>
                    {stat.prefix}{stat.value?.toLocaleString() || 0}
                  </span>
                  <span className="text-white text-lg font-medium">{stat.label}</span>
                  
                  {/* Subtle animated indicator */}
                  <div className={`w-12 h-1 bg-${stat.color}-400 rounded-full mt-3 opacity-50 group-hover:opacity-100 transition-all duration-300`}></div>
                </div>
              </div>
            ))}
          </div>
        )}
        

        {!session?.user?.emailVerified && showBanner && session?.user.oauthProvider === "credentials" &&  (
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

        {/* Feed View with enhanced styling */}
        {page === "Feed" && (
          <>
            {/* Creators and their posts with enhanced spacing */}
            <div className="space-y-10 mt-10">
              {filteredCreators && filteredCreators.length > 0 && users && session ? (
                filteredCreators.map((creator) => (
                  <div key={creator.id} className="space-y-8">
                    {creator.posts && creator.posts.length > 0 && (
                      creator.posts.map(post => {
                        const isCreator = session?.user?.id === creator.user;
                        
                        const isFollower = session?.user?.following?.some(f => f.creatorId.toString() === creator.id);
                        const isSubscriber = !!session?.user?.subscriptions?.some(s => s.creatorId.toString() === creator.id);
                        return (
                          <div key={post._id} className="transform transition-transform duration-300">
                            <CreatorPostCard
                              creator={creator}
                              post={post}
                              session={session}
                              user={session.user as User}
                              isCreator={isCreator}
                              isFollower={isFollower ?? false}
                              isSubscriber={isSubscriber}
                              users={users}
                              signedUrl={postSignedUrls[post._id]}
                              handleFollow={handleFollow}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center group hover:bg-white/10 transition-all duration-500">
                <div className="mb-4">
                  <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-pink-400 transition-colors duration-300" />
                  <h3 className="text-xl font-bold text-white mb-2">No Subscriptions or Follows Yet</h3>
                  <p className="text-gray-400 mb-6">Start exploring creators and subscribe to their content to see it here.</p>
                  <Link href="/discover">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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
                    {session?.user.subscriptions.slice(0, 6).map((subscription) => (
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
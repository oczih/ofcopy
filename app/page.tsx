'use client';

import { Sidebar } from "./components/Sidebar";
import { Button } from "./components/ui/button";
import { MessageCircle, Sparkles } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Creator } from "./types";
import { Badge } from "./components/ui/badge";
import creatorservice from "./services/creatorservice";
import statsservice from "./services/statsservice";
import toast from "react-hot-toast";
import Link from "next/link";
import { CreatorCard } from "./components/CreatorCard";
export default function Page() {
  return (
    <SessionProvider>
          <App />
        
    </SessionProvider>
  );
}

function App() {
  const { data: session } = useSession();
  const [creators, setCreators] = useState<Creator[] | null>(null);
  const [page, setPage] = useState("Feed");
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCreators, fetchedStats] = await Promise.all([
          creatorservice.get(),
          statsservice.get()
        ]);
        console.log("fetchedcreators:", fetchedCreators)
        if (fetchedCreators) {
          const sortedCreators = fetchedCreators.creators.map((creator: Creator) => ({
            ...creator,
            posts: creator.posts.sort(
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
  console.log(creators)
  return (
    <div className="min-h-screen w-full ml-72 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </div>
      <Sidebar />
      <main className="flex-1 space-y-8 max-w-7xl mx-auto px-6 py-8 gap-8 relative z-10">
        {/* Toggle Buttons */}
        <div className="flex gap-4 justify-center mb-15 mt-15">
          <Button
            className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 text-lg ${page === "Dashboard" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-105" : "bg-white/10 text-green-300 hover:bg-green-500/20"}`}
            onClick={() => setPage("Dashboard")}
          >
            Dashboard
          </Button>
          <Button
            className={`px-8 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 text-lg ${page === "Feed" ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-105" : "bg-white/10 text-pink-300 hover:bg-pink-500/20"}`}
            onClick={() => setPage("Feed")}
          >
            Feed
          </Button>
        </div>
        {/* Dashboard View */}
        {page === "Dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl flex flex-col items-center">
              <span className="text-3xl font-bold text-green-400 mb-2">${stats.totalRevenue?.toLocaleString() || 0}</span>
              <span className="text-white text-lg">Total Earnings</span>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl flex flex-col items-center">
              <span className="text-3xl font-bold text-pink-400 mb-2">{stats.totalSubscriptions?.toLocaleString() || 0}</span>
              <span className="text-white text-lg">Subscribers</span>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl flex flex-col items-center">
              <span className="text-3xl font-bold text-purple-400 mb-2">{stats.totalCreators?.toLocaleString() || 0}</span>
              <span className="text-white text-lg">Total Creators</span>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl flex flex-col items-center">
              <span className="text-3xl font-bold text-yellow-400 mb-2">{stats.activeCreators?.toLocaleString() || 0}</span>
              <span className="text-white text-lg">Active Creators</span>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl flex flex-col items-center">
              <span className="text-3xl font-bold text-cyan-400 mb-2">{stats.premiumCreators?.toLocaleString() || 0}</span>
              <span className="text-white text-lg">Premium Creators</span>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-xl flex flex-col items-center">
              <span className="text-3xl font-bold text-blue-400 mb-2">{stats.totalUsers?.toLocaleString() || 0}</span>
              <span className="text-white text-lg">Total Users</span>
            </div>
          </div>
        )}
        {/* Feed View (existing content) */}
        {page === "Feed" && (
          <>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-4xl p-8 border border-white/20 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg w-fit mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent mb-2">
                    Feed
                  </h1>
                  <p className="text-gray-300 text-lg">Your personalized content feed</p>
                </div>
              </div>
            </div>
            {/* Creators and their posts */}
            <div className="space-y-10 mt-10">
              {creators && creators.length > 0 && creators.map((creator) => (
                <div key={creator.id} className="bg-white/5 rounded-3xl p-6 shadow-xl">
                  {creator.posts && creator.posts.length > 0 ? (
                    <div className="mt-4 gap-4">
                      {creator.posts && creator.posts.length > 0 ? (
                        <div className="mt-4 gap-4">
                          {creator.posts.map((post) => (
                            <div key={post._id} className="bg-slate-900/80 rounded-xl p-4 border border-white/10">
                              {post.signedUrl && (
                                <img src={post.signedUrl} alt={post.caption} className="rounded-md mb-2" />
                              )}
                              <div className="text-white font-semibold mb-2">{post.caption}</div>
                              <div className="text-gray-500 text-xs">{new Date(post.createdAt).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 italic mt-4">No posts yet.</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic mt-4">No posts yet.</div>
                  )}
                </div>
              ))}
            </div>
            {/* User Subscriptions Section (existing) */}
            {session?.user && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Subscriptions</h2>
                  <p className="text-gray-400 mt-2">Content from creators you&apos;re subscribed to</p>
                </div>
                {session.user.subscriptions && session.user.subscriptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {session.user.subscriptions.slice(0, 6).map((subscription) => (
                      <div 
                        key={subscription.creatorId} 
                        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.01] shadow-2xl"
                      >
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <img 
                                src={subscription.creatorImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} 
                                alt={subscription.creatorName}
                                className="w-12 h-12 rounded-full border-2 border-pink-500/50"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-bold text-lg">{subscription.creatorName}</h3>
                              <p className="text-gray-400 text-sm">{subscription.creatorUsername}</p>
                            </div>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-500/30">
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
                ) : (
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
                    <div className="mb-4">
                      <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No Subscriptions Yet</h3>
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
            )}
          </>
        )}
      </main>
    </div>
  );
}
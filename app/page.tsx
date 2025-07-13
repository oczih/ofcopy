'use client';

import { Header } from "./components/Header";
import { CreatorCard } from "@/app/components/CreatorCard";
import { Sidebar } from "./components/Sidebar";
import { Button } from "./components/ui/button";
import { Heart, MessageCircle, Share2, Lock, Sparkles, TrendingUp, Users, Star, Bookmark } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Creator, User } from "./types";
import { Badge } from "./components/ui/badge";
import creatorservice from "./services/creatorservice";
import toast from "react-hot-toast";
import Link from "next/link";
export default function Page() {
  return (
    <SessionProvider>
      <App />
    </SessionProvider>
  );
}

function App() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [creators, setCreators] = useState<Creator[] | null>(null)

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const fetchedCreators = await creatorservice.get()
        if(!fetchCreators){
          setCreators([])
        }
        setCreators(fetchedCreators)
      }
      catch (error){
        console.error("Couldn't fetch creators: ", error)
        toast.error("Error fetching creators")
      }
    }
    fetchCreators()
  },)

  const posts = [
    {
      id: 1,
      creator: {
        name: "Emma Rose",
        username: "@emmarose",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      },
      content: "Just finished an amazing photoshoot! Can't wait to share more exclusive content with my subscribers 💕",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=400&fit=crop",
      likes: 245,
      comments: 18,
      isPremium: false,
      timestamp: "2 hours ago",
      category: "Lifestyle"
    },
    {
      id: 2,
      creator: {
        name: "Alex Turner",
        username: "@alexturner",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
      content: "Exclusive workout routine for subscribers only! Get access to my premium fitness content 💪",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop",
      likes: 189,
      comments: 12,
      isPremium: true,
      timestamp: "4 hours ago",
      category: "Fitness"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </div>

      <Header user={user} setUser={setUser} />
      
      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8 relative z-10">
        <Sidebar />
        
        <main className="flex-1 space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
                    Welcome to CreatorHub
                  </h1>
                  <p className="text-gray-300 mt-2 text-lg">Discover and connect with amazing content creators</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-pink-500/20 rounded-lg">
                      <Users className="w-5 h-5 text-pink-400" />
                    </div>
                    <span className="text-white font-semibold">Active Creators</span>
                  </div>
                  <p className="text-3xl font-bold text-pink-400">2,847</p>
                  <p className="text-gray-400 text-sm">+12% this month</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Star className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-white font-semibold">Premium Content</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">15,234</p>
                  <p className="text-gray-400 text-sm">+8% this week</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-white font-semibold">Total Views</span>
                  </div>
                  <p className="text-3xl font-bold text-cyan-400">2.1M</p>
                  <p className="text-gray-400 text-sm">+23% this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Creators Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
                    Featured Creators
                  </h2>
                  <p className="text-gray-400 mt-1">Discover amazing content creators</p>
                </div>
              </div>
              <Link href="/discover" className="border-white/20 outline text-white hover:bg-white/10 rounded-full px-6">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {creators && creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </div>

          {/* Content Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Latest Content</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-full">
                  All
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-full">
                  Following
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-full">
                  Premium
                </Button>
              </div>
            </div>
            
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.01] shadow-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img 
                        src={post.creator.avatar} 
                        alt={post.creator.name}
                        className="w-12 h-12 rounded-full border-2 border-pink-500/50"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{post.creator.name}</h3>
                      <p className="text-gray-400 text-sm">{post.creator.username} • {post.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                        {post.category}
                      </Badge>
                      {post.isPremium && (
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl">
                          <Lock className="w-5 h-5 text-black" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-200 mb-6 text-lg leading-relaxed">{post.content}</p>
                  
                  {post.image && (
                    <div className="relative mb-6 rounded-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                      <img 
                        src={post.image} 
                        alt="Post content"
                        className="w-full h-64 object-cover"
                      />
                      {post.isPremium && !session?.user && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <div className="text-center p-8">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                              <Lock className="w-10 h-10 text-white" />
                            </div>
                            <h4 className="text-white font-bold text-xl mb-2">Premium Content</h4>
                            <p className="text-gray-300 mb-4">Subscribe to unlock exclusive content</p>
                            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              Subscribe Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all duration-300 rounded-full px-4 py-2">
                        <Heart className="w-5 h-5 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300 rounded-full px-4 py-2">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300 rounded-full px-4 py-2">
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-300 rounded-full px-4 py-2">
                      <Bookmark className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
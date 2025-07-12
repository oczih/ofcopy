'use client';

import { useState } from "react";
import { Header } from "./components/Header";
import { CreatorCard } from "@/app/components/CreatorCard";
import { Sidebar } from "./components/Sidebar";
import { Button } from "./components/ui/button";
import { Heart, MessageCircle, Share2, Lock, Sparkles } from "lucide-react";
import { UserProvider } from "./context/UserContext";

export default function Page() {
  return (
    <UserProvider>
      <App />
    </UserProvider>
  );
}
function App() {
  const [activeTab, setActiveTab] = useState("feed");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const featuredCreators = [
    {
      id: 1,
      name: "Emma Rose",
      username: "@emmarose",
      subscribers: 12500,
      isSubscribed: false,
      price: 19.99,
      category: "Lifestyle"
    },
    {
      id: 2,
      name: "Alex Turner",
      username: "@alexturner",
      subscribers: 8700,
      isSubscribed: true,
      price: 14.99,
      category: "Fitness"
    },
    {
      id: 3,
      name: "Sophia Chen",
      username: "@sophiachen",
      subscribers: 15200,
      isSubscribed: false,
      price: 24.99,
      category: "Art"
    }
  ];

  const posts = [
    {
      id: 1,
      creator: {
        name: "Emma Rose",
        username: "@emmarose",
      },
      content: "Just finished an amazing photoshoot! Can't wait to share more exclusive content with my subscribers 💕",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=400&fit=crop",
      likes: 245,
      comments: 18,
      isPremium: false,
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      creator: {
        name: "Alex Turner",
        username: "@alexturner",
      },
      content: "Exclusive workout routine for subscribers only! Get access to my premium fitness content 💪",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop",
      likes: 189,
      comments: 12,
      isPremium: true,
      timestamp: "4 hours ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
      <div className="flex max-w-7xl mx-auto px-4 py-8 gap-8 relative z-10">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 space-y-8">
          {activeTab === "feed" && (
            <div className="space-y-8 animate-fade-in">
              {/* Featured Creators Section */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {featuredCreators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              </div>

              {/* Content Feed */}
              <div className="space-y-6">
                {posts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.01] shadow-2xl animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-slate-950 animate-pulse"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">{post.creator.name}</h3>
                          <p className="text-gray-400 text-sm">{post.creator.username} • {post.timestamp}</p>
                        </div>
                        {post.isPremium && (
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl">
                            <Lock className="w-5 h-5 text-black" />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-200 mb-6 text-lg leading-relaxed">{post.content}</p>
                      
                      {post.isPremium && !isLoggedIn ? (
                        <div className="relative group">
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
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
                        </div>
                      ) : (
                        <div></div>
                      )}
                      
                      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "discover" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
              {featuredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          )}

          {activeTab === "messages" && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Messages</h2>
                <p className="text-gray-400 text-lg max-w-md mx-auto">Connect with your favorite creators through private messages and build meaningful relationships.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

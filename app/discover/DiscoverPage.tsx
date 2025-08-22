'use client';

import { useEffect, useState } from "react";
import { CreatorCard } from "@/components/CreatorCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { Search, Filter, Sparkles, TrendingUp, Star, Compass } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Creator, User } from "../types";
import Image from "next/image";
import { resolveImageUrl } from "@/components/resolveImageUrl";
import { Session } from "next-auth";

interface AppProps {
  creators: Creator[];
  session: Session | null
  users: User[];
}

export default function App({creators, users}: AppProps ) {
  const [searchQuery, setSearchQuery] = useState("");
  const [creatorsWithMedia, setCreatorsWithMedia] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoResults, setShowNoResults] = useState(false);
  const creatorKeysSignature = JSON.stringify(
    creators.map(c => ({
      avatarKey: c.avatarKey,
      postKeys: (c.posts || []).map(p => p.s3Key)
    }))
  );
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
  
        const creatorsWithMedia = await Promise.all(
          creators.map(async (creator: Creator) => {
            let image = creator.image;
  
            // Only fetch if avatarKey exists
            if (creator.avatarKey) {
              try {
                const res = await fetch("/api/media/download-url", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ s3Key: creator.avatarKey }),
                });
                const data = await res.json();
                if (res.ok && data.downloadUrl) {
                  image = data.downloadUrl;
                }
              } catch (err) {
                console.error(`Error getting creator image URL for ${creator.name}:`, err);
              }
            }
  
            // Posts
            const postsWithUrls = await Promise.all(
              (creator.posts || []).map(async (post) => {
                if (!post.s3Key) return post;
                try {
                  const res = await fetch("/api/media/download-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ s3Key: post.s3Key }),
                  });
                  const data = await res.json();
                  if (res.ok && data.downloadUrl) {
                    return { ...post, signedUrl: data.downloadUrl };
                  }
                } catch (err) {
                  console.error(`Error getting post media for post ${post._id}`, err);
                }
                return post;
              })
            );
  
            return {
              ...creator,
              image,
              posts: postsWithUrls,
            };
          })
        );
  
        setCreatorsWithMedia(creatorsWithMedia);
      } catch (error) {
        console.error("Couldn't fetch creators: ", error);
        toast.error("Error fetching creators");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCreators();
  }, [creatorKeysSignature, creators]);


  const filteredCreators = creatorsWithMedia.filter(creator => 
    creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle showing "no results" message after a delay when not loading
  useEffect(() => {
    if (!loading && filteredCreators.length === 0) {
      const timer = setTimeout(() => {
        setShowNoResults(true);
      }, 1500); // Show "no results" after 1.5 seconds

      return () => clearTimeout(timer);
    } else {
      setShowNoResults(false);
    }
  }, [loading, filteredCreators.length]);

  // Skeleton component for creator cards
  const CreatorCardSkeleton = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );

  // Skeleton component for trending creators
  const TrendingCreatorSkeleton = () => (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-700" />
        </div>
        <Skeleton className="h-4 w-8 bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );

  return (
    <div>
      <Toaster
      position="top-center"
      reverseOrder={false}
    />
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 gap-8 relative z-10">
        
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Discover Creators
                  </h1>
                  <p className="text-gray-400 mt-1">Find amazing content creators across all categories</p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
            </div>

            {/* Trending Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                  <p className="text-gray-400">Most popular creators this week</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                  // Show skeleton loading for trending creators
                  Array.from({ length: 4 }).map((_, index) => (
                    <TrendingCreatorSkeleton key={index} />
                  ))
                ) : (
                  creatorsWithMedia.slice(0, 4).map((creator, index) => (
                    <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <Image
                          src={resolveImageUrl(creator.image) || ""}
                          alt={creator.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm">{creator.name}</h3>
                          <p className="text-gray-400 text-xs">{creator.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white text-sm font-medium">4.{9 - index}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Creators Grid */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Our current creators
                </h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">All creators are verified</span>
                </div>
              </div>
              
              {loading ? (
                // Show skeleton loading for creator cards
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <CreatorCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredCreators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCreators.map((creator) => (
                    <CreatorCard key={creator._id} creator={creator} signedAvatarUrl={creator.image} />
                  ))}
                </div>
              ) : showNoResults ? (
                // Show "no results" message after delay
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No creators found</h3>
                  <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                // Show skeleton while waiting to show "no results"
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <CreatorCardSkeleton key={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
    </div>
  );
}
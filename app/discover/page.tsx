'use client';

import { useEffect, useState } from "react";
import { CreatorCard } from "@/app/components/CreatorCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, Filter, Sparkles, TrendingUp, Star, Compass } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import creatorservice from "../services/creatorservice";
import toast from "react-hot-toast";
import { Creator } from "../types";

export default function DiscoverPage() {
  return (
    <SessionProvider>

          <DiscoverApp />
        
    </SessionProvider>
  );
}

function DiscoverApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [creators, setCreators] = useState<Creator[]>([]);
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const fetchedCreators = await creatorservice.get()
        setCreators(fetchedCreators.creators)
      }
      catch (error){
        console.error("Couldn't fetch creators: ", error)
        toast.error("Error fetching creators")
      }
    }
    fetchCreators()
  }, []); // Added dependency array
  console.log("Creators: ",creators)
  const categories = [
    "all", "lifestyle", "fitness", "art", "music", "cooking", "travel", "tech", "fashion"
  ];

  const filteredCreators = creators?.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         creator.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || creator.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
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
                    placeholder="Search creators, categories..."
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
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                ))}
              </div>
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
                {creators.slice(0, 4).map((creator, index) => (
                  <div key={creator.id} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover" />
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
                ))}
              </div>
            </div>

            {/* Creators Grid */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {filteredCreators.length} Creators Found
                </h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">All creators are verified</span>
                </div>
              </div>
              
              {filteredCreators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCreators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No creators found</h3>
                  <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </main>
    </div>
  );
}

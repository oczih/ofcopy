import { Button } from "./ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Users, Heart, Star, Verified } from "lucide-react";
import Image from "next/image";
import { Creator } from "../types";

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorCard = ({ creator }: CreatorCardProps) => {
  return (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-pink-500/30 transition-all duration-300 hover:scale-102 hover:shadow-2xl hover:shadow-pink-500/10 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-1 animate-pulse">
            <div className="bg-slate-950 rounded-full p-1">
            </div>
          </div>
          <div className="w-24 h-24"></div>
          
          {/* Status indicator */}
          <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
            <div className="w-6 h-6 bg-green-500 rounded-full border-3 border-slate-950 animate-pulse"></div>
            <Verified className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">
            {creator.name}
          </h3>
          <p className="text-gray-400 text-sm">{creator.username}</p>
          
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300"
          >
            {creator.category}
          </Badge>
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-pink-400" />
            <span className="font-medium">{creator.subscribers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-gray-300 font-medium">4.9</span>
          </div>
        </div>
        
        <div className="w-full space-y-3">
          {creator.isSubscribed ? (
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Heart className="w-4 h-4 mr-2 fill-current" />
              Subscribed
            </Button>
          ) : (
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Subscribe ${creator.price}/month
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full border-2 border-white/20 text-white hover:bg-white/10 hover:border-pink-500/50 rounded-full py-3 font-medium transition-all duration-300 hover:scale-105"
          >
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
};
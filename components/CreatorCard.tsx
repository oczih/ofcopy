/* eslint-disable @next/next/no-img-element */
import { Button } from "./ui/button";
import { Heart, Verified, Crown, Sparkles } from "lucide-react";
import { Creator, Subscription } from  "../app/types";
import Link from "next/link";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Session } from "next-auth";
interface CreatorCardProps {
  creator: Creator;
  avatarKey?: string;
  signedAvatarUrl: string | undefined;
  session: Session | undefined;
}

export function CreatorCard({ creator, signedAvatarUrl, session }: CreatorCardProps) {
  const [avatarLoading, setAvatarLoading] = useState(true);

  return (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:border-pink-500/30 transition-all duration-200 hover:shadow-2xl hover:shadow-pink-500/20 relative overflow-hidden animate-scale-in">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400/30 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-6 left-4 w-1 h-1 bg-purple-400/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-6 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Avatar with enhanced styling */}
        <div className="relative mb-6">
          {/* Avatar gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full p-1 animate-pulse" />
          <div className="relative w-16 h-16">
            {avatarLoading && (
              <Skeleton className="absolute inset-0 w-full h-full rounded-full" />
            )}
            {signedAvatarUrl && (
              <img
                src={signedAvatarUrl}
                alt={creator.name}
                width={64}
                height={64}
                className="rounded-full object-cover"
                onLoad={() => setAvatarLoading(false)}
              />
            )}
          </div>
          {/* Status indicator */}
          <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
            
            <Verified className="w-5 h-5 text-blue-500" />
          </div>
          {/* Premium badge */}
          {session?.user.subscriptions?.find((s: Subscription) => s.creatorUsername=== creator.username) && (
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-full animate-glow">
              <Crown className="w-4 h-4 text-black" />
            </div>
          )}
        </div>
        
        {/* Creator info */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">
            {creator.name}
          </h3>
          <p className="text-gray-400 text-sm">{creator.username}</p>
          
        </div>
      
        
        {/* Action buttons */}
        <div className="w-full space-y-3">
          {session?.user.subscriptions?.find((s: Subscription) => s.creatorUsername=== creator.username) ? (
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:animate-glow cursor-pointer">
              <Heart className="w-4 h-4 mr-2 fill-current" />
              Subscribed
            </Button>
          ) : (
            <Link href={`/${creator.username}`} >
            <Button className="w-full mb-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group-hover:animate-glow cursor-pointer">
              <Sparkles className="w-4 h-4 mr-2" />
              Subscribe ${creator.price}/month
            </Button>
            </Link>
          )}
          <Link href={`/${creator.username}`}>
          <Button 
            variant="outline" 
            className="w-full border-2 border-white/20 text-white hover:bg-white/10 hover:border-pink-500/50 rounded-full py-3 font-medium transition-all duration-300 cursor-pointer"
          >
            View Profile
          </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Heart, UserPlus } from "lucide-react";
import { Creator, Post } from "@/app/types";
type MediaRenderProps = {
    creator: Creator;
    post: Post;
    canView: boolean;
    resolvedUrl: string
    resolvedBlurredUrl: string
    isSubscribersOnly: boolean 
    isFollowersOnly: boolean
    handleFollow: (creator: Creator) => void;
    setPaymentModal: (open: boolean) => void;
}

export default function MediaRenderer({
  resolvedUrl,
  resolvedBlurredUrl,
  post,
  canView,
  isSubscribersOnly,
  isFollowersOnly,
  handleFollow,
  creator,
  setPaymentModal
}: MediaRenderProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  // React to canView changes
  useEffect(() => {
    if (!resolvedUrl) return;
  
    if (isImage(resolvedUrl)) {
      // swap between full + blurred image
      setCurrentSrc(canView ? resolvedUrl : resolvedBlurredUrl);
    } else {
      // if you also generate a blurred video thumbnail or blurredKey, use it here
      setCurrentSrc(canView ? resolvedUrl : resolvedBlurredUrl);
    }
  
    setImageLoading(true);
  }, [canView, resolvedUrl, resolvedBlurredUrl]);
  return (
    <div className="relative w-full" style={{ minHeight: 200 }}>
      {/* Media */}
      {currentSrc &&
        (isImage(currentSrc) ? (
          <img
            src={encodeURI(currentSrc)}
            alt={post.caption || ""}
            width={post.width}
            height={post.height}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            style={{ objectFit: "contain", width: "100%", height: "auto" }}
            sizes="(max-width: 1200px) 100vw, 1200px"
            className={`transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : (
          <video
            className="w-full h-auto max-w-full rounded-none"
            controls
            preload="metadata"
          >
            <source src={currentSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ))}

      {/* Overlay if user cannot view */}
      {!canView && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3">
         <span className="text-2xl text-white drop-shadow-md">
            {post.price && post.price > 0
              ? `Unlock for $${post.price}`
              : isSubscribersOnly
              ? "Subscribe to view"
              : isFollowersOnly
              ? "Follow to view"
              : "Restricted"}
            </span>
          <div className="flex gap-3">
            {post.price && post.price > 0 && (
              <button 
               onClick={() => setPaymentModal(true)}
              className="bg-gradient-to-r px-3 py-1.5 sm:px-5 sm:py-2 from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow cursor-pointer">
                Unlock for ${post.price}
              </button>
            )}
            {isSubscribersOnly && (
              <Button className="bg-gradient-to-r px-3 py-1.5 sm:px-5 sm:py-2 from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow cursor-pointer">
                <Heart className="w-4 h-4 mr-2" /> Subscribe
              </Button>
            )}
            {isFollowersOnly && !post.price && (
              <Button
                onClick={() => handleFollow(creator)}
                className="bg-gradient-to-r px-3 py-1.5 sm:px-5 sm:py-2 from-blue-500 to-cyan-600 text-white font-semibold rounded-full shadow cursor-pointer"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Follow
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper
const isImage = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return /\.(jpeg|jpg|gif|png|webp|avif|svg)(\?.*)?$/.test(cleanUrl);
  };

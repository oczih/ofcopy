/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Creator, Post, Purchase, User } from '@/app/types';
import creatorservice from '@/app/services/creatorservice';
import { Skeleton } from "@/components/ui/skeleton"

import { CreatorPostCard } from './CreatorPostCard';
import { useSession } from 'next-auth/react';
import { resolveImageUrl } from './resolveImageUrl';
import { ChevronLeft, Heart, Lock, Video, X } from 'lucide-react';
import SignUpModal from './SignupModal';
import { Session } from 'next-auth';
import { createPortal } from 'react-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from "uuid";
import { getChatsBetween } from '@/lib/messages';
import PaymentForm from './PaymentForm';
import { Box} from '@mui/material';


const SocialMediaChips = ({ creator }: {creator: Creator}) => {
  const platforms = [
    { name: 'Twitter/X', url: creator.twitter, icon: "/TwitterLogo.png" },
    { name: 'Bluesky', url: creator.bluesky, icon: "/Bluesky_Logo.svg" },
    { name: 'TikTok', url: creator.tiktok , icon: "/TikTok_icon.svg"},
    { name: 'Instagram', url: creator.instagram, icon: "/Instagram_logo_2016.svg" },
    { name: 'Facebook', url: creator.facebook , icon: "/FacebookLogo.png"},
    { name: 'YouTube', url: creator.youtube , icon: "/YoutubeLogo.svg"},
  ];

  // Filter only platforms that have a URL
  const activePlatforms = platforms.filter(platform => platform.url);

  if (!activePlatforms.length) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        py: 1,
        '&::-webkit-scrollbar': { display: 'none' }, // hide scrollbar on webkit
      }}
    >
      {activePlatforms.map(platform => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            flex items-center gap-2 w-full justify-center
            rounded-full font-bold cursor-pointer px-4 py-2
            text-white border border-transparent
            transition-colors transition-border duration-200
            "bg-[#3c0d6c] hover:bg-[#4d138a] hover:border-white"
          `}
        >
          <img src={platform.icon} alt={platform.name} width={18} height={18} />
          {platform.name}
        </a>
      ))}
    </Box>
  );
}

// Bio Modal Component
const BioSection = ({
  bio,
}: {
  bio: string;
}) => {
  const [showFullBio, setShowFullBio] = useState(false);

  const getPreviewText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="max-w-2xl pb-5">
      <p className="text-gray-300 text-base leading-relaxed transition-all duration-300">
        {showFullBio ? bio : getPreviewText(bio)}
      </p>

      {bio.length > 100 && (
        <button
          onClick={() => setShowFullBio(!showFullBio)}
          className="mt-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          {showFullBio ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};

type UserProfileData = {
  userViewed: User,
  viewingUser: Creator | User,
  totalSpent: number,
  isOwnProfile: boolean,
  relationshipStatus: 'subscriber' | 'follower' | 'none'
  users: User[],
  creators: Creator[],
  session: Session | null
  creator: Creator | null;
  purchases: Purchase[]
}

export default function ProfileContent({ 
  userViewed, 
  viewingUser,
  totalSpent, 
  isOwnProfile, 
  relationshipStatus,
  users,
  creators,
  purchases,
  session,
  creator,
}: UserProfileData) {
  const [modalOpen, setModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | Creator>(viewingUser);
  const [status, setStatus] = useState<'subscriber' | 'follower' | 'none'>(relationshipStatus);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'cancelled' | 'expired' | null>(null);
  const [StopSubscribeModalOpen, SetStopSubscribeModal] = useState(false)
  // Cache for signed URLs with timestamps
  const [urlCache, setUrlCache] = useState<Record<string, { url: string; timestamp: number }>>({});
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  const router = useRouter();

  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const avatarKey = creator?.avatarKey ?? userViewed?.avatarKey?.replace(/^\/+/, '');
  const lastFetchedAvatarKey = useRef<string | null>(null);
  const [imageLoading, setImageLoading] = useState(!!avatarKey);
  // Memoized function to get signed URL
  const getSignedUrl = useCallback(async (s3Key: string): Promise<string | null> => {
    if (!s3Key) return null;
    
    // Check cache first
    const cached = urlCache[s3Key];
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.url;
    }
    
    try {
      const res = await fetch("/api/media/download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key }),
      });

      const data = await res.json();
      if (res.ok && data.downloadUrl?.startsWith("https://")) {
        // Update cache
        setUrlCache(prev => ({
          ...prev,
          [s3Key]: { url: data.downloadUrl, timestamp: Date.now() }
        }));
        return data.downloadUrl;
      }
    } catch (error) {
      console.error("Error fetching signed URL:", error);
    }
    
    return null;
  }, [urlCache, CACHE_TTL]);

  // Avatar URL fetching - only when avatarKey changes
  useEffect(() => {
    if (!avatarKey) {
      setImageLoading(false);
      return;
    }
  
    if (avatarKey === lastFetchedAvatarKey.current) {
      setImageLoading(false);
      return;
    }
  
    const fetchAvatarUrl = async () => {
      setImageLoading(true);
      if (avatarKey.startsWith("http")) {
        setAvatarImage(avatarKey);
        setAvatarUrl(avatarKey); // use the URL directly
        lastFetchedAvatarKey.current = avatarKey;
        setImageLoading(false);
        return;
      }
      const url = await getSignedUrl(avatarKey);
      if (url) {
        setAvatarUrl(url);
        lastFetchedAvatarKey.current = avatarKey;
      }
      setImageLoading(false);
    };
  
    fetchAvatarUrl();
  }, [avatarKey, getSignedUrl]);
  useEffect(() => {
    if (!session?.user.subscriptions?.some(s => s.creatorId === creator?._id)) return;
    
    const subscription = session.user.subscriptions.find(
      s => s.creatorId === creator?._id
    );
    if (!subscription) return;
  
    // Save status in state (active, cancelled, expired…)
    setSubscriptionStatus(subscription.status);
  }, [session, creator?._id]);
  // Post signed URLs - batch fetch and cache
  type SignedUrls = {
    signedUrl: string;
    blurredUrl: string;
  };
  const [postSignedUrls, setPostSignedUrls] = useState<Record<string, SignedUrls>>({});
  const fetchedPostsRef = useRef<Set<string>>(new Set());
  const rightCreator = creators.find(c => c.user === session?.user._id)

  type S3Key = {
    key: string;
    blurredKey?: string;
    blurred_key?: string;
  };

  useEffect(() => {
    async function fetchSignedUrls() {
      if (!creators || creators.length === 0) return;
  
      const allPosts = creators.flatMap((creator) => creator.posts || []);
  
      const postsToFetch = allPosts.filter((post) => {
        if (!post.s3Key) return false;
  
        const fullKey = typeof post.s3Key === "string" ? post.s3Key : post.s3Key?.key;
        const blurredKey = typeof post.s3Key === "string" ? post.s3Key : post.s3Key?.blurred_key;
        const rightCreator = creators.find(c => c.user === session?.user._id)
        const canView =
          rightCreator?._id.toString() === post.creator.toString() ||
          status === "subscriber" ||
          status === "follower";
        const keyToFetch = canView ? fullKey : blurredKey;
        if (!keyToFetch) return false;
  
        // Already fetched
        if (fetchedPostsRef.current.has(post._id)) return false;
  
        return true;
      });
  
      if (postsToFetch.length === 0) return;
  
      // Mark posts as being fetched
      postsToFetch.forEach((post) => fetchedPostsRef.current.add(post._id + "-" + status));
  
      const signedUrlMap: Record<string, SignedUrls> = {};
  
      await Promise.all(
        postsToFetch.map(async (post: Post) => {
          const s3KeyObj: S3Key | null | undefined =
          typeof post.s3Key === "string"
            ? { key: post.s3Key }
            : post.s3Key;
          const fullKey = s3KeyObj?.key ?? "";
          const blurredKeyNorm = s3KeyObj?.blurredKey || s3KeyObj?.blurred_key;
          const blurredKey = blurredKeyNorm ?? fullKey;
          const rightCreator = creators.find(c => c.user === session?.user._id)
          const canView =
            rightCreator?._id.toString() === post.creator.toString() ||
            session?.user?.following?.some((f) => f.creatorId === post.creator) ||
            session?.user?.subscriptions?.some((s) => s.creatorId === post.creator);
  
          const keyToFetch = canView ? fullKey : blurredKey;
          if (!keyToFetch) return;
  
          const signedUrl = (await getSignedUrl(keyToFetch)) ?? ""; // fallback to empty string
          const blurredUrl =
            blurredKey && blurredKey !== keyToFetch ? (await getSignedUrl(blurredKey)) ?? signedUrl : signedUrl;
  
          signedUrlMap[post._id] = { signedUrl, blurredUrl };
        })
      );
  
      if (Object.keys(signedUrlMap).length > 0) {
        setPostSignedUrls((prev) => ({ ...prev, ...signedUrlMap }));
      }
    }
  
    fetchSignedUrls();
  }, [creators, session?.user, getSignedUrl, status]);
  
  // Clean up expired cache entries periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setUrlCache(prev => {
        const cleaned = { ...prev };
        Object.keys(cleaned).forEach(key => {
          if (now - cleaned[key].timestamp > CACHE_TTL) {
            delete cleaned[key];
          }
        });
        return cleaned;
      });
      
      // Reset fetched posts tracking periodically
      fetchedPostsRef.current.clear();
    }, CACHE_TTL);

    return () => clearInterval(cleanup);
  }, [CACHE_TTL]);

  const activePromotion = useMemo(() => {
    if (!creator?.promotions?.length) return null;
    const now = new Date();
    return [...creator.promotions]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .find(p => p.active && new Date(p.startDate) <= now && (!p.endDate || new Date(p.endDate) >= now));
  }, [creator?.promotions]);

  
  // Calculate stats
  const getCreatorStats = () => {
    if (!creator) return { posts: 0, videos: 0, likes: 0 };
    
    const posts = creator.posts?.length || 0;
    const videos = creator.posts?.filter(post => post.type === 'video').length || 0;
    const likes = creator.posts?.reduce((total, post) => total + (post.likes?.length || 0), 0) || 0;
    
    return { posts, videos, likes };
  };

  const stats = getCreatorStats();
  const notifiedCreators = useRef<Set<string>>(new Set());

  const handleFollow = async (creator: Creator) => {
    if (!session?.user?._id) {
      setJoinModalOpen(true);
      return;
    }
    if (!creator) return;
  
    try {
      // Optimistic update
      setCurrentUser({
        ...currentUser,
        following: [
          ...currentUser.following,
          {
            creatorId: creator._id,
            creatorName: creator.name,
            creatorUsername: creator.username,
            followingDate: new Date(),
          },
        ],
      });
      setStatus("follower");
    
      // Call backend
      await creatorservice.followCreator(creator._id, session.user._id);
      // ✅ no need to check res.ok with Axios
    
      // Notify once per creator
      if (!notifiedCreators.current.has(creator._id)) {
        notifiedCreators.current.add(creator._id);
    
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "newfollower",
            by: session.user._id,
            forUsers: [
              {
                model: "Creator",
                id: creator._id.toString(),
              },
            ],
            creatorId: creator._id,
          }),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to create notification:", errorData);
        }
      }
    } catch (err) {
      console.error("Error following creator:", err);
    
      // Rollback optimistic update
      setCurrentUser((prev) => ({
        ...prev,
        following: prev.following.filter((f) => f.creatorId !== creator._id),
      }));
      setStatus("none");
    }
  };
  
  const handleUnfollow = async (creator: Creator) => {
    if (!creator || !viewingUser) return;

    try {
      await creatorservice.unfollowCreator(creator._id);

      setCurrentUser({
        ...currentUser,
        following: currentUser.following.filter(f => f.creatorId !== creator._id),
      });

      setStatus('none');
    } catch (err) {
      console.error('Error unfollowing creator:', err);
    }
  };
  const resolvedSrc = resolveImageUrl(avatarUrl);
  
  const handleStartChat = async (userId: string, sessionUserId: string) => {
    const chats = await getChatsBetween(sessionUserId, userId);
    let chat = chats.find(c => c.participants.includes(userId) && c.participants.includes(sessionUserId));
  
    if (!chat) {
      const newChat = {
        id: uuidv4(),
        participants: [sessionUserId, userId],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
  
      const { data, error } = await supabase
        .from("chats")
        .insert(newChat)
        .select()
        .single();
  
      if (error) {
        console.error("Error creating chat:", error);
        return;
      }
  
      chat = data;
    }
  
    localStorage.setItem("currentChatIdentifier", chat?.id || "");
    router.push("/messages");
  };
  const handleStopSubscribe = async (creator: Creator) => {
    if(!creator) return;
    SetStopSubscribeModal(true)
  }

  type StopSubscribeProps= {
    avatarUrl: string | null;
    onClose: () => void;
    creator: Creator | null;
  }

  function StopSubscribeModal({ creator, avatarUrl, onClose }: StopSubscribeProps
  ) {
    const [loading, setLoading] = useState(false);
  
    const handleConfirm = async () => {
      try {
        setLoading(true);
        // 🔑 Call your unsubscribe API here
        // await api.unsubscribe(creator._id);
        if(!creator?._id) return null;
        await creatorservice.unSubscribe(creator?._id)
        onClose();
      } catch (error) {
        console.error("Failed to unsubscribe:", error);
      } finally {
        setLoading(false);
      }
    };
    const rightSubscription = session?.user.subscriptions?.find(s => s.creatorId === creator?._id)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative w-full max-w-sm bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-6 text-center shadow-2xl">
  
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={creator?.name || creator?.username || "Creator"}
              className="w-20 h-20 mx-auto rounded-full border border-white/20 object-cover mb-4"
            />
          ) : (
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold text-3xl">
              {creator?.name?.charAt(0).toUpperCase() ||
                creator?.username?.charAt(0).toUpperCase() ||
                "U"}
            </div>
          )}
  
          <h2 className="text-xl font-bold text-white mb-2">Cancel Subscription</h2>
          <p className="text-gray-300 mb-6">
            Your subscription won&apos;t continue after 
            <span className="font-semibold text-pink-400">
            {rightSubscription?.nextBillingDate
                ? new Date(rightSubscription.nextBillingDate).toLocaleDateString()
                : "the next billing date"}

          </span>
          ?
        </p>
          <p className="text-gray-300 mb-6">
            Are you sure you want to unsubscribe from 
            <span className="font-semibold text-pink-400">
             {" " + creator?.name || creator?.username || "this creator"}
          </span>
          ?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-pink-500 cursor-pointer to-red-500 hover:from-pink-600 hover:to-red-600 text-white  px-4 py-2 rounded-xl font-semibold transition-colors duration-300"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1  cursor-pointer  border-gray-400 text-gray-300  px-4 py-2 rounded-xl font-semibold hover:bg-gray-400/20 transition-colors duration-300"
          >
            {loading ? "Unsubscribing..." : "Confirm Unsubscribe"}
          </button>
        </div>
      </div>
    </div>
  );
}


    const subscription = session?.user?.subscriptions?.find(
      s => s.creatorId === creator?._id
    );
    const daysLeft = subscription?.nextBillingDate
      ? Math.ceil(
          (new Date(subscription.nextBillingDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
        )
      : 0;
  return (
    <div>
      <Toaster
      position="top-center"
      reverseOrder={false}
    />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="md:hidden">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-white"
        >
          <ChevronLeft className="w-6 h-6"/>
        </button>
      </div>
      {subscriptionStatus === "cancelled" && daysLeft !== null && (
  <div className="my-4 p-4 bg-yellow-500/10 border border-yellow-400/40 text-yellow-200 rounded-xl text-center">
    Your subscription has been <span className="font-semibold">cancelled</span> from this creator.{" "}
    Your access to subscriber-only content will end
    {daysLeft > 0 ? (
      <> in <span className="font-semibold">{daysLeft}</span> {daysLeft === 1 ? "day" : "days"}.</>
    ) : daysLeft === 0 ? (
      <> today.</>
    ) : (
      <> (access has already ended).</>
    )}
    {" "}Don&apos;t miss out on exclusive content—consider re-subscribing to stay connected!
  </div>
)}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            {/* Left Column - Profile Image, Stats, and Subscribe Button */}
            <div className="flex flex-col gap-6 items-start">
              {/* Profile Image */}
              <div className='flex-row flex justify-between'>
              <div className="relative w-40 h-40 rounded-full overflow-hidden">
                  {imageLoading ? (
                    <Skeleton className="w-40 h-40 rounded-full bg-gray-300 dark:bg-gray-700" />
                  ) : avatarUrl ? (
                    <img
                      src={resolvedSrc || avatarImage || ""}
                      alt={userViewed.username || "User profile image"}
                      className="w-40 h-40 rounded-full border border-black shadow-lg object-cover"
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        console.error("Avatar failed to load");
                        setAvatarUrl(null);
                        setImageLoading(false);
                      }}
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold text-6xl">
                      {creator?.name?.charAt(0).toUpperCase() ||
                        userViewed.name?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>
                  )}
                </div>
              </div>
              <div className='flex flex-row gap-6'>
                <div className='flex flex-col items-start'>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {creator?.name || creator?.username || userViewed.name || userViewed.username}
                  </h1>
                  <p className="text-xl text-purple-200">@{creator?.username || userViewed.username}</p>
                </div>
                <div className='flex flex-col gap-3 flex-1'>          
                  {/* Follow Button - On the right side of name */}
                  {status === 'none' && creator &&  !isOwnProfile && viewingUser && (
                    <button 
                      onClick={() => handleFollow(creator)}  
                      className="border border-blue-500 hover:bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer whitespace-nowrap"
                    >
                      Follow
                    </button>
                  )}
                  {status === 'none' && userViewed.creator && !viewingUser && (
                    <button 
                      onClick={() => setJoinModalOpen(true)}  
                      className="border border-blue-500 hover:bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer whitespace-nowrap"
                    >
                      Follow
                    </button>
                  )}
                  {status === 'follower' && creator && (
                    <button
                      onClick={() => handleUnfollow(creator)}
                      className="border border-white text-white hover:bg-white/10 px-4 py-1 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer whitespace-nowrap"
                    >
                      Following
                    </button>
                  )}
                  {status === 'subscriber' && creator && (subscription?.status === "active") && (
                    <button
                      onClick={() => handleStopSubscribe(creator)}
                      className="bg-gradient-to-r w-full from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
                    >
                      Unsubscribe
                    </button>
                  )}
                  {status === 'subscriber' && creator && (subscription?.status === "cancelled" ||  subscription?.status === "expired") && (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="bg-gradient-to-r w-full from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-bold transition-colors duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
                    >
                      Resubscribe
                    </button>
                  )}
                </div>
              </div>
              
              {/* Creator Stats - Under profile pic and smaller */}
              {creator && (
                <div className="flex flex-row gap-2 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <Lock className="w-3 h-3 text-gray-400" />
                    <div className="text-sm font-medium text-white">{stats.posts} Posts</div>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Video className="w-3 h-3 text-gray-400" />
                    <div className="text-sm font-medium text-white">{stats.videos} Videos</div>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Heart className="w-3 h-3 text-gray-400" />
                    <div className="text-sm font-medium text-pink-400">{stats.likes} Likes</div>
                  </div>
                </div>
              )}
              
              {creator?.bio && (
  <BioSection 
    bio={creator.bio} 
  />
)}
              {creator && <SocialMediaChips creator={creator} />}
              
              {/* User Stats (for non-creators) - Under profile pic and smaller */}
              {!creator && (rightCreator?.subscribers?.some(sub => sub.userId.toString() === userViewed._id) || rightCreator?.followers?.some(fol => fol.userId === userViewed._id.toString())) && (
  <div className="w-full flex flex-col gap-2 text-center">
    <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
      <div className="text-xs text-gray-300">Status</div>
      <div className="text-sm font-semibold text-white capitalize">
        {status}
      </div>
    </div>
    <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
      <div className="text-xs text-gray-300">Total Spent</div>
      <div className="text-sm font-semibold text-green-400">
        ${totalSpent.toFixed(2)}
      </div>
    </div>

    {/* Send Message Button */}

  </div>
)}

            </div>
            {/* Right Column - Profile Info and Action Buttons */}
            <div className="flex-1 text-center lg:text-left">
              {/* Action Buttons - Spread out evenly */}
              {isOwnProfile && (
                <div className="flex flex-wrap justify-between gap-4 mt-6">
                <Link 
                  href="/myprofile/edit" 
                  className="flex-1 flex items-center text-center justify-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-white font-semibold px-6 py-3 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Edit Profile
                </Link>
              
                <Link 
                  href="/insights" 
                  className="flex-1 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-white font-semibold px-6 py-3 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Insights
                </Link>
              
                <Link 
                  href="/creator-promotions" 
                  className="flex-1 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-white font-semibold px-6 py-3 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Promote
                </Link>
              </div>
              
              )}
            </div>
          </div>
          
          {!isOwnProfile && userViewed.creator && viewingUser && status !== 'subscriber' && (
                <>
{creator?.promotions?.length ? (() => {
  const now = new Date();

  // 🔎 Sort by start date (newest first)
  const sortedPromotions = [...creator.promotions].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // ✅ Take ONLY the latest promotion that is active *right now*
  const latestActivePromotion = sortedPromotions.find(
    (p) =>
      p.active &&
      new Date(p.startDate) <= now &&
      (!p.endDate || new Date(p.endDate) >= now)
  );

  return latestActivePromotion ? (
<div className="mb-2 flex justify-center">
  {/* ✅ relative parent so we can absolutely position the avatar */}
  <div
    className="
      relative               /* <-- important */
      bg-gray-500/40
      w-full min-h-12 rounded-xl
      flex items-center justify-start
      pl-6
    "
  >
    {/* ✅ Avatar positioned at the top-left corner */}
    <div className="absolute -top-4 -left-4">   {/* adjust offsets as needed */}
      {imageLoading ? (
        <Skeleton className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
      ) : avatarUrl ? (
        <img
          src={resolvedSrc || avatarImage || ""}
          alt={userViewed.username || "User profile image"}
          className="w-10 h-10 rounded-full shadow-lg object-cover"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            console.error("Avatar failed to load");
            setAvatarUrl(null);
            setImageLoading(false);
          }}
        />
      ) : (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold text-2xl">
          {creator?.name?.charAt(0).toUpperCase() ??
           userViewed.name?.charAt(0).toUpperCase() ??
           "U"}
        </div>
      )}
    </div>

    {/* ✅ Promotion text centered inside the gray box */}
    <div className="text-white text-md font-semibold">
      🎉 {latestActivePromotion.discountPercent}% OFF!
    </div>
  </div>
</div>

  ) : null;
})() : null}
                  
                  <button
  className="bg-gradient-to-r w-full from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-colors text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform cursor-pointer"
  onClick={async () => {
    if (creator?.freeTrial && activePromotion) {
      // ✅ Handle free trial subscription directly
      try {
        const res = await fetch("/api/subscribe-free-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorId: creator._id, userId: session?.user?._id })
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Free trial subscription activated!");
        } else {
          toast.error("Failed to activate free trial: " + data.error);
        }
      } catch (err) {
        console.error("Error subscribing to free trial:", err);
      }
    } else {
      // Open payment modal if not free trial
      setModalOpen(true);
    }
  }}
>
  <div className="flex flex-row justify-between w-full">
    <span>Subscribe Now</span>
    <div className="flex items-center gap-2">
      {activePromotion && (
        <span className="text-black text-md line-through opacity-75">
          ${creator?.price?.toFixed(2)}
        </span>
      )}
      <span className="text-white font-semibold">
        ${activePromotion
          ? (creator && creator.price * (1 - activePromotion.discountPercent / 100))?.toFixed(2)
          : creator?.price?.toFixed(2)}
        /Month
      </span>
    </div>
  </div>
</button>
                </>
              )}
              {(status === 'follower' || status === 'subscriber') && (
             <button
             onClick={() => {
              
             
              if (userViewed._id && session?.user?._id) {
                handleStartChat(userViewed._id, session.user._id);
              }
             }}
             className="w-full mt-4 border border-purple-500 hover:bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
           >
             Send Message
           </button>
            )}
          {!viewingUser && (
            <button 
              className="bg-gradient-to-r w-full from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
              onClick={() => setJoinModalOpen(true)}
            >
              <div className='flex flex-row justify-between'>
                <span>Join today!</span>
              </div>
            </button>
          )}
        </div>
        
        {joinModalOpen && creator && (
          <SignUpModal 
            open={joinModalOpen}
            onClose={() => setJoinModalOpen(false)}
            creator={creator}
            avatarUrl={avatarUrl || ""}
          />
        )}
        
            {modalOpen && creator && (
      <PaymentForm 
        type="subscription"
        onClose={() => setModalOpen(false)}
        open={modalOpen}
        creator={creator}
        avatarUrl={avatarUrl || ""}
        // ✅ Apply promotion if active
        price={
          activePromotion
            ? creator.price * (1 - activePromotion.discountPercent / 100)
            : creator.price
        }
        session={session}
      />
    )}
        {StopSubscribeModalOpen && creator && (
          <StopSubscribeModal
            onClose={() => SetStopSubscribeModal(false)}
            creator={creator}
            avatarUrl={avatarUrl}
          />
        )}
        {/* Content Tabs */}
        {creator && (
          <ContentTabs
            creator={creator}
            isOwnProfile={isOwnProfile}
            status={status}
            viewingUser={viewingUser}
            postSignedUrls={postSignedUrls}
            handleFollow={handleFollow}
            user={viewingUser}
            users={users}
            purchases={purchases}
            session={session}
            creators={creators}
          />
        )}
      </div>
    </div>
  );
}
type SignedUrls = {
  signedUrl: string;
  blurredUrl: string;
};
function ContentTabs({  
  creator, 
  isOwnProfile, 
  status,
  viewingUser,
  postSignedUrls,
  handleFollow,
  user,
  users,
  session,
  creators,
  purchases,
}: {
  creator: Creator;
  isOwnProfile: boolean;
  status: 'subscriber' | 'follower' | 'none';
  viewingUser: Creator | User
  purchases: Purchase[]

  postSignedUrls: Record<string, SignedUrls>; 
  handleFollow: (creator: Creator) => Promise<void>
  user: Creator | User,
  users: User[],
  session: Session | null,
  creators: Creator[],
}) {
  const creatorContent = purchases.filter(p => p.creatorId.toString() === creator._id)
  const [activeTab, setActiveTab] = useState(creator ? 'posts' : 'purchased');
  const tabs = [
    { id: 'posts', label: 'Posts', count: creator?.posts?.length || 0 },
    { id: 'media', label: 'Media', count: creator?.posts?.filter(p => p.signedUrl).length || 0 },
    ...((status === 'subscriber' || status === 'follower') && !isOwnProfile
      ? [{ id: 'purchased', label: 'Purchased Content', count: creatorContent?.filter(c => c.userId.toString() === viewingUser._id).length ?? 0 }]
      : []),
    ...([{ id: 'likes', label: 'Likes', count: 0 }]),
  ];


  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-white/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border-b-2 border-pink-400'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'posts' && (
          <PostsGrid creator={creator} status={status} postSignedUrls={postSignedUrls} user={user} handleFollow={handleFollow} purchases={purchases} users={users} session={session} />
        )}
        {activeTab === 'purchased' && (
          <PurchasedPostsGrid status={status} creator={creator} handleFollow={handleFollow} creators={creators} purchases={purchases} viewingUser={viewingUser} postSignedUrls={postSignedUrls} user={user}/>
        )}
        {activeTab === 'media' && (
          <MediaGrid creator={creator} status={status} postSignedUrls={postSignedUrls}user={user}  />
        )}
        {activeTab === 'likes' && (
          <LikedContent creator={creator} status={status} postSignedUrls={postSignedUrls} viewingUser={viewingUser} creators={creators} purchases={purchases}/>
          
        )}
      </div>
    </div>
  );
}
function LikedContent({
  creator,
  status,
  postSignedUrls,
  viewingUser,
  purchases,
  creators,
}: {
  creator?: Creator;
  status: "follower" | "subscriber" | "none";
  postSignedUrls: Record<string, SignedUrls>
  viewingUser: Creator | User;
  creators: Creator[];
  purchases: Purchase[],
}) {

  const [likedPosts, setLikedPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!creator || !creator.posts) {
      setLikedPosts([]);
      return;
    }

    // Find the viewing user's creator object, if any
    const viewingCreator = creators.find(
      (c) => String(c.user) === String(viewingUser?._id)
    );

    // Check if viewingUser is the owner of this creator
    const isOwner = creator._id === viewingCreator?._id;

    // Filter posts liked by the viewingUser
    let filtered =
      creator.posts.filter((post) =>
        post.likes?.some(
          (like) => String(like.userId) === String(viewingUser?._id)
        )
      ) ?? [];

    if (!isOwner) {
      // Apply visibility rules
      filtered = filtered.filter((post) => {
        if (post.viewableFor === "subscribers") {
          return status === "subscriber";
        }
        if (post.viewableFor === "followers") {
          return status === "subscriber" || status === "follower";
        }
        return true; // public
      });
    }

    setLikedPosts(filtered);
  }, [creator, viewingUser?._id, creators, status]);
  const handleDeletePost = async (creatorId: string, postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete post");

      setLikedPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error(error);
      alert('Failed to delete post');
    }
  };
  if (!creator) return null;
  

  return (
    <div className="grid grid-cols-1 gap-6">
      {likedPosts.length > 0 ? (
        likedPosts.map((post) => (
         
          <CreatorPostCard
            key={post._id}
            blurredUrl={postSignedUrls[post._id]?.blurredUrl || ""}
            post={post}
            creator={creator}
            status={status}
            signedUrl={postSignedUrls[post._id]?.signedUrl || ""}
            user={viewingUser}
            users={[]}
            session={null}
            handleDeletePost={() => handleDeletePost(creator._id, post._id)}
            purchases={purchases}
          />
        ))
      ) : (
        <div className="text-center text-gray-400 py-12">
          <div className="text-6xl mb-4">❤️</div>
          <p>No liked posts found.</p>
        </div>
      )}
    </div>
  );
}


function PurchasedPostsGrid ({
  creator,
  viewingUser,
  postSignedUrls,
  handleFollow,
  user,
  purchases,
  status,
}: {
  creator?: Creator;
  viewingUser: Creator | User;
  postSignedUrls: Record<string, SignedUrls>
  handleFollow: (creator: Creator) => void;
  user: Creator | User,
  status: 'follower' | 'subscriber' | 'none',
  creators: Creator[]
  purchases: Purchase[]
}) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  
  useEffect(() => {
    if (!creator?.posts || !viewingUser) return;
  
    // Find all purchases by this user for this creator
    const creatorPurchases = purchases.filter(
      (p) => p.creatorId.toString() === creator._id && p.userId.toString() === viewingUser._id
    );
  
    // Get an array of purchased mediaIds
    const mediaIds = creatorPurchases
      .map(p => p.mediaId?.toString())
      .filter((id): id is string => !!id);
  
    // Filter creator.posts to only include purchased posts
    const purchasedPosts = creator.posts.filter(post =>
      mediaIds.includes(post._id.toString())
    );
  
    setVisiblePosts(purchasedPosts);
  }, [creator, viewingUser, purchases]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(!users){
          setUsers(null)
        }
        else{
          setUsers(users);
        }
      } catch (error) {
        console.error("Couldn't fetch data: ", error);
      }
    };
    fetchData();
  }, [users]);
  
  const { data: session} = useSession();
  
  if (!creator) return null;
  
  // Filter posts based on purchased content
  
  
  
  const handleDeletePost = async (creatorId: string, postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
  
      // remove from UI
      setVisiblePosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete post");
    }
  };

  return (
    <div>
      {visiblePosts.length === 0 && (
        <div className='flex flex-col items-center'>
          <h1 className="text-2xl font-bold text-white mb-2">
            You haven&apos;t purchased anything from this person yet!
          </h1>
        </div>
      )}
      
      {visiblePosts.map((post) => (
        <CreatorPostCard
          key={post._id}
          post={post}
          creator={creator}
          blurredUrl={postSignedUrls[post._id]?.blurredUrl || ""}
          status={status}
          session={session}
          users={users ?? []}
          user={user}
          signedUrl={postSignedUrls[post._id]?.signedUrl || ""}
          handleFollow={handleFollow}
          handleDeletePost={() => handleDeletePost(creator._id, post._id)}
          purchases={purchases}
        />
      ))}
    </div>
  );
}

function MediaGrid({
  creator,
  status,
  postSignedUrls,
  user,
}: {
  status: "subscriber" | "follower" | "none";
  creator?: Creator;
  postSignedUrls: Record<string, SignedUrls>;
  user: Creator | User;
}) {
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (creator?.posts) {
      let filtered: Post[];
      if (user?._id.toString() === creator.user.toString()) {
        filtered = creator.posts; // Own profile shows all
      } else {
        filtered = creator.posts.filter((post) => {
          if (status === "subscriber") return true; // Subscriber sees all
          if (status === "follower") return post.viewableFor === "followers";
          return post.viewableFor === "followers"; // Not following sees only blurred
        });
      }
      setVisiblePosts(filtered);
    }
  }, [creator, status, user]);

  const handleImageLoad = (postId: string) => {
    setLoadedImages((prev) => ({ ...prev, [postId]: true }));
  };

  const canView = (post: Post) => {
    if (user?._id.toString() === creator?._id.toString()) return true;
    if (status === "subscriber") return true;
    if (status === "follower") return post.viewableFor === "followers";
    return false;
  };
  return (
    <><div>
      {visiblePosts.length > 0 ? (
      <div className="grid grid-cols-3 gap-1">
        {visiblePosts.map((post) => {
          const isLoaded = loadedImages[post._id];
          const urls = postSignedUrls[post._id] ?? { signedUrl: '', blurredUrl: '' };
          const showFull = canView(post);

          return (
            <div
              key={post._id}
              className={`relative w-full aspect-square overflow-hidden ${
                showFull ? "cursor-pointer" : ""
              }`}
              onClick={showFull ? () => setActiveImage(urls.signedUrl) : undefined}
            >
              {/* Background image */}
              <img
                src={showFull ? urls.signedUrl : urls.blurredUrl || urls.signedUrl}
                alt="background"
                className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 brightness-50"
              />

              {/* Skeleton */}
              {!isLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-gray-200 dark:bg-gray-700 z-20" />
              )}

              {/* Foreground image */}
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <img
                  src={showFull ? urls.signedUrl : urls.blurredUrl || urls.signedUrl}
                  alt={post.caption || "Media post"}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => handleImageLoad(post._id)}
                />
              </div>
            </div>
          );
        })}
      </div>
       ) : creator?.posts && creator.posts.length > 0 ? (
        <div className="text-center text-gray-400 py-12">
          <div className="text-6xl mb-4">🔒</div>
          <p>Subscribe to view more content!</p>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-12">
          <div className="text-6xl mb-4">🤔</div>
          <p>This person hasn&apos;t posted anything yet!</p>
        </div>
      ) }
      </div>

      {/* Fullscreen modal */}
      {activeImage &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
            onClick={() => setActiveImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/30 hover:bg-white/60 transition cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage(null);
              }}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={activeImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}

  
function PostsGrid({
  creator,
  status,
  postSignedUrls,
  handleFollow,
  user,
  users,
  session,
  purchases,
}: {
  creator?: Creator;
  status: 'subscriber' | 'follower' | 'none';
  postSignedUrls: Record<string, SignedUrls>;
  handleFollow: (creator: Creator) => void;
  user: Creator | User;
  users: User[];
  session: Session | null;
  purchases: Purchase[]
}) {
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  useEffect(() => {
    if (creator?.posts) {
      let filtered: Post[];
      if (user?._id.toString() === creator.user.toString()) {
        // Viewing own profile — show all posts
        filtered = creator.posts;
      } else {
        // Viewing someone else's profile — filter by status
        filtered = creator.posts.filter((post) => {
          if (status === 'subscriber') return true;
          if (status === 'follower') return post.viewableFor === 'followers';
          return post.viewableFor === 'followers'; // treat "none" as followers-only list
        });
      }
      setVisiblePosts(filtered);
    }
  }, [creator, status, user]);

  if (!creator) return null;

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');
      setVisiblePosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      console.error(error);
      alert('Failed to delete post');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {visiblePosts.length > 0 ? (
        visiblePosts.map((post) => {
          const urls = postSignedUrls[post._id] ?? { signedUrl: '', blurredUrl: '' };
          return (
            <CreatorPostCard
              key={post._id}
              post={post}
              creator={creator}
              status={status}
              session={session}
              users={users ?? []}
              user={user}
              handleFollow={handleFollow}
              handleDeletePost={() => handleDeletePost(post._id)}
              // 👇 satisfy the required props
              signedUrl={urls.signedUrl}
              blurredUrl={urls.blurredUrl}
              purchases={purchases}
            />
          );
        })
      ) : creator?.posts && creator.posts.length > 0 ? (
        <div className="text-center text-gray-400 py-12">
          <div className="text-6xl mb-4">🔒</div>
          <p>Subscribe to view more content!</p>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-12">
          <div className="text-6xl mb-4">🤔</div>
          <p>This person hasn&apos;t posted anything yet!</p>
        </div>
      )}
    </div>
  );
}

  
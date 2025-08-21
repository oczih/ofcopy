/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Creator, Follower, MediaPost, Post, Subscriber, User } from '@/app/types';
import SubscribeModal from '@/components/SubscribeModal';
import creatorservice from '@/app/services/creatorservice';
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { CreatorPostCard } from './CreatorPostCard';
import { useSession } from 'next-auth/react';
import { resolveImageUrl } from './resolveImageUrl';
import { Heart, Lock, Video, X } from 'lucide-react';
import SignUpModal from './SignupModal';
import { Session } from 'next-auth';
import { createPortal } from 'react-dom';
import { Toaster } from 'react-hot-toast';

// Bio Modal Component
const BioModal = ({ bio, creatorName }: { bio: string; creatorName: string }) => {
  const [open, setOpen] = useState(false);
  
  const getPreviewText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <p className="text-gray-300 mb-6 max-w-2xl hover:text-gray-200 transition-colors">
            {getPreviewText(bio)}
            {bio.length > 100 && (
              <span className="text-blue-400 ml-2 font-medium">Read more</span>
            )}
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-lg border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{creatorName}&apos;s Bio</DialogTitle>
          <DialogDescription className="text-gray-300 text-base leading-relaxed mt-4">
            {bio}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

type UserProfileData = {
  userViewed: User,
  viewingUser: User,
  purchasedContent: MediaPost[],
  totalSpent: number,
  isOwnProfile: boolean,
  relationshipStatus: 'subscriber' | 'follower' | 'none'
  users: User[],
  creators: Creator[],
  session: Session | null
  creator: Creator | null;
}

export default function ProfileContent({ 
  userViewed, 
  viewingUser,
  purchasedContent, 
  totalSpent, 
  isOwnProfile, 
  relationshipStatus,
  users,
  creators,
  session,
  creator
}: UserProfileData) {
  
  const [modalOpen, setModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(viewingUser);
  const [status, setStatus] = useState<'subscriber' | 'follower' | 'none'>('none');
  console.log("kakkaka", creators)
  // Cache for signed URLs with timestamps
  const [urlCache, setUrlCache] = useState<Record<string, { url: string; timestamp: number }>>({});
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  
  useEffect(() => {
    setStatus(relationshipStatus);
  }, [relationshipStatus]);
  
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
      const url = await getSignedUrl(avatarKey);
      if (url) {
        setAvatarUrl(url);
        lastFetchedAvatarKey.current = avatarKey;
      }
      setImageLoading(false);
    };
  
    fetchAvatarUrl();
  }, [avatarKey, getSignedUrl]);

  // Post signed URLs - batch fetch and cache
  const [postSignedUrls, setPostSignedUrls] = useState<Record<string, string>>({});
  const fetchedPostsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSignedUrls() {
      if (!creators || creators.length === 0) return;

      const allPosts = creators.flatMap((creator) => creator.posts || []);
      const postsToFetch = allPosts.filter(post => {
        if (!post.s3Key) return false;
        
        // Check if we already have a valid cached URL
        const cached = urlCache[typeof post.s3Key === 'string'
          ? post.s3Key
          : post.s3Key?.key];
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
          // Update postSignedUrls if we have cached data but it's not in postSignedUrls
          if (!postSignedUrls[post._id]) {
            setPostSignedUrls(prev => ({ ...prev, [post._id]: cached.url }));
          }
          return false;
        }
        
        // Don't refetch if we've already tried recently
        return !fetchedPostsRef.current.has(post._id);
      });

      if (postsToFetch.length === 0) return;

      // Mark these posts as being fetched
      postsToFetch.forEach(post => fetchedPostsRef.current.add(post._id));

      const signedUrlMap: Record<string, string> = {};
      const fetchPromises = postsToFetch.map(async (post: Post) => {
        
        const s3Key =
                typeof post.s3Key === "string"
                  ? post.s3Key
                  : session?.user?.following?.some((f) => f.creatorId === post.creator) || creators.some(c => c.user === session?.user._id)
                  ? post.s3Key?.key
                  : post.s3Key?.blurredKey;

              if (!s3Key) return; // ⛔ bail early if undefined

              const url = await getSignedUrl(s3Key);
              if (url) {
                signedUrlMap[post._id] = url;
              }
      });

      await Promise.all(fetchPromises);

      if (Object.keys(signedUrlMap).length > 0) {
        setPostSignedUrls(prev => ({ ...prev, ...signedUrlMap }));
      }
    }

    fetchSignedUrls();
  }, [creators, postSignedUrls, urlCache, getSignedUrl, CACHE_TTL, session?.user._id, session?.user.following]);
  
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

  useEffect(() => {
    if (!creator || !viewingUser?._id) {
      setStatus('none');
      return;
    }
    const isSubscriber =
      Array.isArray(creator.subscribers) &&
      creator.subscribers.some(
        (sub: Subscriber) => sub.userId.toString() === viewingUser?._id.toString()
      );
    const isFollower =
      creator.followers &&
      creator.followers.some(
        (fol: Follower) => fol.userId.toString() === viewingUser?._id.toString()
      );
  
    if (isSubscriber) {
      setStatus('subscriber');
    } else if (isFollower) {
      setStatus('follower');
    } else {
      setStatus('none');
    }
  }, [creator, viewingUser]);

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
    if(!session?.user) {
      setJoinModalOpen(true)
      return;
    }
    if (!creator) return;
  
    try {
      const alreadyFollowing = viewingUser?.following.some(f => f.creatorId === creator._id);
      if (alreadyFollowing) return;
  
      await creatorservice.followCreator(creator._id);
  
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
  
      if (!session?.user._id) {
        console.error("No user ID in session");
        return;
      }
  
      // Only notify if we haven't before
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
                model: "Creator", // or "Creator" if the target is a creator
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
  console.log(isOwnProfile)
  const resolvedSrc = resolveImageUrl(avatarUrl);
  return (
    <div>
      <Toaster
      position="top-center"
      reverseOrder={false}
    />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
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
                      src={resolvedSrc ?? ""}
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
                <BioModal 
                  bio={creator.bio} 
                  creatorName={creator?.name || creator?.username || userViewed.name || userViewed.username} 
                />
              )}
              
              {/* User Stats (for non-creators) - Under profile pic and smaller */}
              {!creator && (
                <div className="flex flex-col gap-2 text-center">
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
                  href="/settings/creator/promotions" 
                  className="flex-1 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-white font-semibold px-6 py-3 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Promote
                </Link>
              </div>
              
              )}
            </div>
          </div>
          
          {!isOwnProfile && viewingUser && status !== 'subscriber' && (
            <button 
              className="bg-gradient-to-r w-full from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
              onClick={() => setModalOpen(true)}
            >
              <div className='flex flex-row justify-between'>
                <span>Subscribe Now</span>
                
                <span>${creator?.price}/Month</span>
              </div>
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
          <SubscribeModal 
            open={modalOpen} 
            onClose={() => setModalOpen(false)} 
            creator={creator}
            avatarUrl={avatarUrl} 
          />
        )}
        
        {/* Content Tabs */}
        {creator && (
          <ContentTabs
            purchasedContent={purchasedContent}
            creator={creator}
            isOwnProfile={isOwnProfile}
            status={status}
            viewingUser={viewingUser}
            postSignedUrls={postSignedUrls}
            handleFollow={handleFollow}
            user={viewingUser}
            users={users}
            session={session}
            creators={creators}
          />
        )}
      </div>
    </div>
  );
}

function ContentTabs({  
  purchasedContent, 
  creator, 
  isOwnProfile, 
  status,
  viewingUser,
  postSignedUrls,
  handleFollow,
  user,
  users,
  session,
  creators
}: {
  purchasedContent: MediaPost[];
  creator: Creator;
  isOwnProfile: boolean;
  status: 'subscriber' | 'follower' | 'none';
  viewingUser: User
  postSignedUrls: Record<string, string>;
  handleFollow: (creator: Creator) => Promise<void>
  user: User,
  users: User[],
  session: Session | null,
  creators: Creator[]
}) {
  const [activeTab, setActiveTab] = useState(creator ? 'posts' : 'purchased');
  const tabs = [
    { id: 'posts', label: 'Posts', count: creator?.posts?.length || 0 },
    { id: 'media', label: 'Media', count: creator?.posts?.filter(p => p.signedUrl).length || 0 },
    ...((status === 'subscriber' || status === 'follower') && !isOwnProfile
      ? [{ id: 'purchased', label: 'Purchased Content', count: purchasedContent.length }]
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
          <PostsGrid creator={creator} status={status} postSignedUrls={postSignedUrls} user={user} handleFollow={handleFollow} users={users} session={session} />
        )}
        {activeTab === 'purchased' && (
          <PurchasedPostsGrid status={status} creator={creator} handleFollow={handleFollow} creators={creators} viewingUser={viewingUser} postSignedUrls={postSignedUrls} user={user}/>
        )}
        {activeTab === 'media' && (
          <MediaGrid creator={creator} status={status} postSignedUrls={postSignedUrls}  />
        )}
        {activeTab === 'likes' && (
          <LikedContent creator={creator} status={status} postSignedUrls={postSignedUrls} viewingUser={viewingUser} creators={creators}/>
          
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
  creators
}: {
  creator?: Creator;
  status: "follower" | "subscriber" | "none";
  postSignedUrls: Record<string, string>;
  viewingUser: User;
  creators: Creator[];
}) {
  if (!creator) return null;

  // Find the viewing user's creator object, if any
  const viewingCreator = creators.find(
    (c) => String(c.user) === String(viewingUser?._id)
  );

  // Check if viewingUser is the owner of this creator
  const isOwner = creator._id === viewingCreator?._id;

  // Filter posts liked by the viewingUser
  let likedPosts =
    creator.posts?.filter((post) =>
      post.likes?.some(
        (like) => String(like.userId) === String(viewingUser?._id)
      )
    ) ?? [];

  if (!isOwner) {
    // Apply visibility rules
    likedPosts = likedPosts.filter((post) => {
      if (post.viewableFor === "subscribers") {
        return status === "subscriber";
      }
      if (post.viewableFor === "followers") {
        return status === "subscriber" || status === "follower";
      }
      // public posts
      return true;
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {likedPosts.length > 0 ? (
        likedPosts.map((post) => (
          <CreatorPostCard
            key={post._id}
            post={post}
            creator={creator}
            status={status}
            signedUrl={postSignedUrls[post._id]}
            user={viewingUser}
            handleFollow={() => {}}
            users={[]}
            session={null}
            handleDeletePost={() => {}}
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
  status,
}: {
  creator?: Creator;
  viewingUser: User;
  postSignedUrls: Record<string, string>;
  handleFollow: (creator: Creator) => void;
  user: User,
  status: 'follower' | 'subscriber' | 'none',
  creators: Creator[]
}) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  
  useEffect(() => {
    if (creator?.posts) {
      const purchased = creator.posts.filter((post) =>
        viewingUser.purchases?.some((purchase) => purchase.postId === post._id)
      );
      setVisiblePosts(purchased);
    }
  }, [creator, viewingUser]);

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
  console.log(Object.values(visiblePosts))
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
          status={status}
          session={session}
          users={users ?? []}
          user={user}
          signedUrl={postSignedUrls[post._id]}
          handleFollow={handleFollow}
          handleDeletePost={() => handleDeletePost(creator._id, post._id)}
        />
      ))}
    </div>
  );
}
function MediaGrid({
  creator,
  status,
  postSignedUrls,
}: {
  status: "subscriber" | "follower" | "none";
  creator?: Creator;
  postSignedUrls: Record<string, string>;
}) {
  const allPosts = creator?.posts || [];

  const visiblePosts = allPosts.filter((post) => {
    if (status === "subscriber") return true;
    if (status === "follower") return post.viewableFor === "followers";
    return post.viewableFor === "followers";
  });

  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const handleImageLoad = (postId: string) => {
    setLoadedImages((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-1">
        {visiblePosts.map((p) => {
          const isLoaded = loadedImages[p._id];
          const src = resolveImageUrl(postSignedUrls[p._id]) || "";

          return (
            <div
              key={p._id}
              className={`relative w-full aspect-square overflow-hidden ${
                status !== "none" ? "cursor-pointer" : ""
              }`}
              onClick={status !== "none" ? () => setActiveImage(src) : undefined}
            >
              {/* Blurred background */}
              <img
                src={src}
                alt="blurred background"
                className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 brightness-50"
              />

              {/* Skeleton while loading */}
              {!isLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-gray-200 dark:bg-gray-700 z-20" />
              )}

              {/* Foreground image (centered, keeps aspect ratio) */}
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <img
                  src={src}
                  alt={p.caption || "Media post"}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => handleImageLoad(p._id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Modal */}
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
  }: {
    creator?: Creator;
    status: 'subscriber' | 'follower' | 'none';
    postSignedUrls: Record<string, string>;
    handleFollow: (creator: Creator) => void;
    user: User,
    users: User[],
    session: Session | null,
  }) {
    const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
    useEffect(() => {
      if (creator?.posts) {
        let filtered: Post[];
        if (user?._id === creator.user) {
          // Viewing own profile — show all posts
          filtered = creator.posts;
        } else {
          // Viewing someone else's profile — filter by status
          filtered = creator.posts.filter((post) => {
            if (status === "subscriber") return true;
            if (status === "follower") return post.viewableFor === "followers";
            return post.viewableFor === "followers"; // public/followers only
          });
        }
        setVisiblePosts(filtered);
      }
    }, [creator, status, user]);
    if (!creator) return null;
    
    
    
    const handleDeletePost = async (postId: string) => {
      try {
        const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete post");
    
        setVisiblePosts((prev) => prev.filter((p) => p._id !== postId));
      } catch (error) {
        console.error(error);
        alert("Failed to delete post");
      }
    };
    return (
      <div className="grid grid-cols-1 gap-6">
        {visiblePosts.length > 0 ? visiblePosts.map((post) => (
          <CreatorPostCard
          key={post._id}
          post={post}
          creator={creator}
          status={status}
          session={session}
          users={users ?? []}
          signedUrl={postSignedUrls[post._id]}
          user={user}
          handleFollow={handleFollow}
          handleDeletePost={() => handleDeletePost(creator._id)}
        />
        )) : creator?.posts && creator.posts.length > 0 ? (
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
  
  
  
  
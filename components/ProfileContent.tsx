'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Creator, Follower, MediaPost, Post, Subscriber, User } from '@/app/types';
import Image from 'next/image';
import SubscribeModal from '@/components/SubscribeModal';
import creatorservice from '@/app/services/creatorservice';
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


import { CreatorPostCard } from './CreatorPostCard';
import { useSession } from 'next-auth/react';
import { resolveImageUrl } from './resolveImageUrl';
import { Heart, Lock, Video } from 'lucide-react';
import SignUpModal from './SignupModal';

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
  relationshipStatus: 'subscriber' | 'follower' | 'none'  // Add this line
  users: User[],
  creators: Creator[],
  session: any
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
  session
}: UserProfileData) {
  
  const [modalOpen, setModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(viewingUser);
  const [status, setStatus] = useState<'subscriber' | 'follower' | 'none'>('none');
  const [userStatsLoading, setUserStatsLoading] = useState(true);
  
  useEffect(() => {
    setStatus(relationshipStatus);
  }, [relationshipStatus]);
  useEffect(() => {
    async function fetchCreator() {
      const found = creators.find(
        (c: Creator) => {
          console.log('Checking creator user:', c.user, 'against userViewed.id:', userViewed.id);
          return c.user?.toString() === userViewed.id?.toString();
        }
      );
      console.log('Found creator:', found);
      if (found) {
        setCreator(found);
      } else {
        setCreator(null);
      }
      setUserStatsLoading(false);
    }
    if (userViewed?.id) fetchCreator();
  }, [userViewed, creators]);
  
  console.log(creator)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  console.log(avatarUrl)
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (userViewed?.avatarKey) {
        try {
          setImageLoading(true);
          
          const key = creator ? creator?.avatarKey : userViewed?.avatarKey?.replace(/^\/+/, ''); // Remove leading slash
          console.log(key)
          const res = await fetch("/api/media/download-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ s3Key: key }),
          });
  
          const data = await res.json();
  
          if (res.ok && data.downloadUrl && data.downloadUrl.startsWith("https://")) {
            setAvatarUrl(data.downloadUrl);
          } else {
            console.error("Invalid download URL:", data.downloadUrl);
          }

        } catch (error) {
          console.error("Error fetching avatar URL:", error);
        } finally {
          setImageLoading(false);
        }
      } else {
        setImageLoading(false);
      }
    };
  
    fetchAvatarUrl();
  }, [creator, userViewed?.avatarKey]);
  
  const [postSignedUrls, setPostSignedUrls] = useState<Record<string, { url: string; expiresAt: number }>>({});

  const SIGNED_URL_TTL = 15 * 60 * 1000; // 15 minutes TTL in milliseconds

useEffect(() => {
  async function fetchSignedUrls() {
    if (!creators || creators.length === 0) return;

    const allPosts = creators.flatMap((creator) => creator.posts || []);
    const now = Date.now();
    const newUrlsMap = { ...postSignedUrls }; // keep existing URLs

    const postsToFetch = allPosts.filter(post => {
      if (!post.s3Key) return false;
      const cached = postSignedUrls[post._id];
      if (!cached) return true; // no cached url
      if (cached.expiresAt < now) return true; // expired url
      return false; // url still valid
    });

    await Promise.all(
      postsToFetch.map(async (post) => {
        try {
          const res = await fetch("/api/media/download-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ s3Key: post.s3Key }),
          });

          if (res.ok) {
            const data = await res.json();
            newUrlsMap[post._id] = {
              url: data.downloadUrl,
              expiresAt: now + SIGNED_URL_TTL,
            };
          }
        } catch (error) {
          console.error("Failed to fetch signed URL for post:", post._id, error);
        }
      })
    );

    setPostSignedUrls(newUrlsMap);
  }

  fetchSignedUrls();
}, [creators, SIGNED_URL_TTL, postSignedUrls]);


  useEffect(() => {
    if (!creator || !viewingUser?.id) {
      setStatus('none');
      return;
    }
    const isSubscriber =
      Array.isArray(creator.subscribers) &&
      creator.subscribers.some(
        (sub: Subscriber) => sub.userId.toString() === viewingUser._id.toString()
      );
    const isFollower =
      creator.followers &&
      creator.followers.some(
        (fol: Follower) => fol.userId.toString() === viewingUser._id.toString()
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

  console.log(status)
  
  const handleFollow = async (creator: Creator) => {
    if (!creator) return;
    console.log("clicked")
    console.log("mmoroa", ...creator.followers)
    try {
    
    console.log("fitta", viewingUser)
      const alreadyFollowing = viewingUser.following.some(f => f.creatorId === creator._id);
      console.log(creator.followers)
      console.log(alreadyFollowing)
      console.log("perkele", creator)
      await creatorservice.followCreator(creator._id);
      setCurrentUser({
        ...currentUser,
        following: [...currentUser.following, { 
          creatorId: creator.id, creatorName: creator.name, creatorUsername: creator.username, followingDate: new Date()
        }],
      });
      setStatus('follower');
    } catch (err) {
      console.error('Error following creator:', err);
    }
  };
console.log(status)
  const handleUnfollow = async (creator: Creator) => {
    if (!creator || !viewingUser) return;

    try {
      await creatorservice.unfollowCreator(creator.id);

      setCurrentUser({
        ...currentUser,
        following: currentUser.following.filter(f => f.creatorId !== creator.id),
      });

      setStatus('none');
    } catch (err) {
      console.error('Error unfollowing creator:', err);
    }
  };
  const resolvedSrc = resolveImageUrl(avatarUrl);
  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
    {/* Left Column - Profile Image, Stats, and Subscribe Button */}
    <div className="flex flex-col gap-6 items-start">
      {/* Profile Image */}
      <div className='flex-row flex justify-between'>
      <div className="relative w-30 h-30 rounded-full overflow-hidden">
        {!userViewed ? (
          <Skeleton className="w-40 h-40 rounded-full bg-gray-300 dark:bg-gray-700" />
        ) : avatarUrl || userViewed.avatarKey ? (
          <>
           

            <img
              src={resolvedSrc ?? undefined}
              alt={userViewed.username || "User profile image"}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="rounded-full border border-black shadow-lg transition-all duration-300 object-cover"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <Skeleton className="w-40 h-40 rounded-full bg-gray-300 dark:bg-gray-700 absolute top-0 left-0" />
            )}
          </>
        ) : (
          <div className="w-40 h-40 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold text-6xl">
            {creator?.name?.charAt(0).toUpperCase() || userViewed.name?.charAt(0).toUpperCase() || "U"}
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
          {status === 'none' && creator && userViewed.creator && !isOwnProfile && viewingUser && (
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
      {!userStatsLoading && !creator && (
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
            className="flex-1 text-center outline-3 outline-white/50 text-white px-6 py-3 rounded-xl hover:bg-white/10 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform"
          >
            Edit Profile
          </Link>
          <Link 
            href="/insights" 
            className="flex-1 text-center outline-3 outline-white/50 text-white px-6 py-3 rounded-xl hover:bg-white/10 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform"
          >
            Insights
          </Link>
          <Link 
            href="/settings/creator/promotions" 
            className="flex-1 text-center outline-3 outline-white/50 text-white px-6 py-3 rounded-xl hover:bg-white/10 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform"
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
      ) 
      }
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
    session
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
    session: any
  }) {
    const [activeTab, setActiveTab] = useState(creator ? 'posts' : 'purchased');
    const tabs = [
      { id: 'posts', label: 'Posts', count: creator?.posts?.length || 0 },
      ...(status !== 'none'
        ? [{ id: 'media', label: 'Media', count: creator?.posts?.filter(p => p.signedUrl).length || 0 }]
        : []),
      ...((status === 'subscriber' || status === 'follower') && !isOwnProfile
        ? [{ id: 'purchased', label: 'Purchased Content', count: purchasedContent.length }]
        : []),
      ...(isOwnProfile ? [{ id: 'likes', label: 'Likes', count: 0 }] : []),
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
            <PostsGrid creator={creator} status={status} viewingUser={viewingUser} postSignedUrls={postSignedUrls} user={user} handleFollow={handleFollow} users={users} session={session} />
          )}
          {activeTab === 'purchased' && (
            <PurchasedPostsGrid status={status} creator={creator} handleFollow={handleFollow} viewingUser={viewingUser} postSignedUrls={postSignedUrls} user={user}/>
          )}
          {activeTab === 'media' && (
            <MediaGrid creator={creator} status={status} postSignedUrls={postSignedUrls}  />
          )}
          {activeTab === 'likes' && (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4">❤️</div>
              <p>Your liked content will appear here</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function PurchasedPostsGrid ({
    creator,
    viewingUser,
    postSignedUrls,
    handleFollow,
    user,
    status
  }: {
    creator?: Creator;
    viewingUser: User;
    postSignedUrls: Record<string, string>;
    handleFollow: (creator: Creator) => void;
    user: User,
    status: 'follower' | 'subscriber' | 'none',
  }) {
    const [users, setUsers] = useState<User[] | null>(null);
    
    const allPosts = creator?.posts || [];
    useEffect(() => {
  const fetchData = async () => {
    try {  // this should return { users: User[] }
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
    // Filter posts based on relationship status
    const visiblePosts = allPosts.filter((post) =>
      viewingUser.purchases?.some((purchase) => purchase.postId === post._id)
    );
    
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
    status: 'subscriber' | 'follower' | 'none';
    creator?: Creator;
    postSignedUrls: Record<string, string>;

  }) {
    const allPosts = creator?.posts || [];
  
    // Filter posts based on relationship status
    const visiblePosts = allPosts.filter((post) => {
      if (status === 'subscriber') return true;
      if (status === 'follower') return post.viewableFor === 'followers';
      return post.viewableFor === 'followers';
    });
    const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});

  const handleImageLoad = (postId: string) => {
    setLoadedImages((prev) => ({ ...prev, [postId]: true }));
  };
    return (
      <div className="grid grid-cols-3 gap-1">
        {visiblePosts.map((p) => {
          const isLoaded = loadedImages[p._id];
  
          return (
            <div
              key={p._id}
              className="relative w-full aspect-square overflow-hidden"
            >
              {/* Blurred Background Layer */}
              {!isLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-gray-200 dark:bg-gray-700 z-20" />
            )}
              <img
                src={resolveImageUrl(postSignedUrls[p._id]) || ""}
                alt="blurred background"
                className="object-cover blur-lg scale-110 brightness-50"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
  
              {/* Skeleton while loading */}
  
              {/* Foreground Image */}
              {/*@next/next/no-img-element */}
              <img
                src={resolveImageUrl(postSignedUrls[p._id]) || ""}
                alt={p.caption || 'Media post'}
                className="object-contain z-10 transition-opacity duration-300"
                onLoad={() => handleImageLoad(p._id)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          );
        })}
      </div>
    );
  }
  
  function PostsGrid({
    creator,
    status,
    viewingUser,
    postSignedUrls,
    handleFollow,
    user,
    users,
    session,
  }: {
    creator?: Creator;
    status: 'subscriber' | 'follower' | 'none';
    viewingUser: User;
    postSignedUrls: { [key: string]: string };
    handleFollow: (creator: Creator) => void;
    user: User,
    users: User[],
    session: any
  }) {
    if (!creator) return null;
    
    const allPosts = creator.posts || [];
    
    // Filter posts based on relationship status
    const visiblePosts = allPosts.filter((post) => {
      if (status === 'subscriber') return true;
      if (status === 'follower') return post.viewableFor === 'followers';
      return post.viewableFor === 'followers'; // show blurred for public
    });
    
    
    return (
      <div className="grid grid-cols-1 gap-6">
        {visiblePosts.map((post) => (
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
        />
        ))}
      </div>
    );
  }
  
  
  
  
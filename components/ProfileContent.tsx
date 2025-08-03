'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Creator, Follower, MediaPost, Post, Subscriber, User } from '@/app/types';
import Image from 'next/image';
import SubscribeModal from '@/components/SubscribeModal';
import creatorservice from '@/app/services/creatorservice';
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import userservice from '@/app/services/userservice';

import { CreatorPostCard } from './CreatorPostCard';
import { useSession } from 'next-auth/react';
import { resolveImageUrl } from './resolveImageUrl';
import { Heart, Lock, PersonStanding, User, User, Video } from 'lucide-react';

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
          <DialogTitle className="text-white text-xl">{creatorName}'s Bio</DialogTitle>
          <DialogDescription className="text-gray-300 text-base leading-relaxed mt-4">
            {bio}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default function ProfileContent({ 
  userViewed, 
  viewingUser,
  purchasedContent, 
  totalSpent, 
  isOwnProfile, 
}: UserProfileData) {

  const [modalOpen, setModalOpen] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(viewingUser);
  const [status, setStatus] = useState<'subscriber' | 'follower' | 'none'>('none');

  useEffect(() => {
    async function fetchCreator() {
      const creators = await creatorservice.get();
      // Find creator where userViewed.id matches either c.user or c.user.id
      const found = creators.creators.find(
        c => c.user === userViewed.id || c.user?.id === userViewed.id
      );
      if (found) {
        setCreator(found);
        setIsCreator(true);
      } else {
        setCreator(null);
        setIsCreator(false);
      }
    }
    if (userViewed?.id) fetchCreator();
  }, [userViewed]);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (userViewed?.avatarKey) {
        try {
          setImageLoading(true);
          setAvatarError(false);
          
          const key = creator ? creator?.image : userViewed?.avatarKey?.replace(/^\/+/, ''); // Remove leading slash
          
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
            setAvatarError(true);
          }

        } catch (error) {
          console.error("Error fetching avatar URL:", error);
          setAvatarError(true);
        } finally {
          setImageLoading(false);
        }
      } else {
        setImageLoading(false);
      }
    };
  
    fetchAvatarUrl();
  }, [creator?.image, userViewed?.avatarKey]);
  
  const [postSignedUrls, setPostSignedUrls] = useState<Record<string, string>>({});
  
  useEffect(() => {
    async function fetchSignedUrls() {
      if (!creator?.posts) return;
  
      const signedUrlMap: Record<string, string> = {};
      await Promise.all(
        creator.posts.map(async (post: Post) => {
          if (!post.s3Key) return;
  
          try {
            const res = await fetch('/api/media/download-url', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ s3Key: post.s3Key }),
            });
  
            const data = await res.json();
  
            if (res.ok && data.downloadUrl) {
              signedUrlMap[post._id] = data.downloadUrl;
            }
          } catch (err) {
            console.error(`Failed to fetch signed URL for post ${post._id}`, err);
          }
        })
      );
  
      setPostSignedUrls(signedUrlMap);
    }
  
    fetchSignedUrls();
  }, [creator?.posts]);
  
  useEffect(() => {
    if (!creator?.id || !viewingUser?.id || !viewingUser) {
      setStatus('none');
      return;
    }
  
    const isSubscriber = Array.isArray(creator.subscribers) &&
      creator.subscribers.some((sub: Subscriber) => sub.userId === viewingUser.id);
  
    const isFollower = Array.isArray(creator.followers) &&
      creator.followers.some((fol: Follower) => fol.userId === viewingUser.id);
  
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
    const videos = creator.posts?.filter(post => post.mediaType === 'video').length || 0;
    const likes = creator.posts?.reduce((total, post) => total + (post.likes?.length || 0), 0) || 0;
    
    return { posts, videos, likes };
  };

  const stats = getCreatorStats();

  console.log(status)
  
  const handleFollow = async (creator: Creator) => {
    if (!creator) return;
  
    try {
      const alreadyFollowing = viewingUser.following.some(f => f.creatorId === creator.id);
      if (alreadyFollowing) return;
  
      await creatorservice.followCreator(creator.id);
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

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Image */}
            <div className="relative w-40 h-40 rounded-full overflow-hidden">
              {!userViewed ? (
                <Skeleton className="w-40 h-40 rounded-full bg-gray-300 dark:bg-gray-700" />
              ) : avatarUrl || userViewed.image? (
                <>
                  <Image
                    src={resolveImageUrl(avatarUrl || creator?.image || userViewed?.image)}
                    alt={userViewed.username || "User profile image"}
                    fill
                    className="rounded-full border-pink-500/40 shadow-lg transition-all duration-300 object-cover"
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

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                {creator?.name || creator?.username || userViewed.name || userViewed.username}
              </h1>
              <p className="text-xl text-purple-200 mb-4">@{creator?.username || userViewed.username}</p>

              {creator?.bio && (
                <BioModal 
                  bio={creator.bio} 
                  creatorName={creator?.name || creator?.username || userViewed.name || userViewed.username} 
                />
              )}

              {/* Creator Stats */}
              {creator && (
                <div className="mb-6 flex flex-wrap gap-4 justify-center lg:justify-start">
                  <div className="rounded-xl px-4 py-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <div className="text-lg font-semibold text-white">{stats.posts}</div>
                  </div>
                  <div className="rounded-xl px-4 py-2 flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-400" />
                    <div className="text-lg font-semibold text-white">{stats.videos}</div>
                  </div>
                  <div className="rounded-xl px-4 py-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <div className="text-lg font-semibold text-pink-400">{stats.likes}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start items-center">
                {isOwnProfile ? (
                  <div className='flex flex-row gap-3'>
                    <Link 
                      href="/myprofile/edit" 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform"
                    >
                      Edit Profile
                    </Link>
                    <Link 
                      href="/insights" 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform"
                    >
                      Insights
                    </Link>
                    <Link 
                      href="/settings/creator/promotions" 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform"
                    >
                      Promote
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Subscribe Button - Bigger and more prominent */}
                    {viewingUser && status !== 'subscriber' && (
                      <button 
                        className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                        onClick={() => setModalOpen(true)}
                      >
                        Subscribe Now
                      </button>
                    )}
                    
                    {/* Follow Button - Outline style, positioned to the side */}
                    {status === 'none' && userViewed.creator && (
                      <button 
                        onClick={() => handleFollow(creator)}  
                        className="outline outline-white  hover:bg-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
                      >
                        Follow
                      </button>
                    )}
                    
                    {status === 'follower' && creator && (
                      <button
                        onClick={() => handleUnfollow(creator)}
                        className="border-2 border-blue-500 bg-blue-500 text-white hover:bg-transparent hover:text-blue-400 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
                      >
                        Following
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* User Stats (for non-creators) */}
              {!creator && (
                <div className="mt-6 flex gap-6 text-center lg:text-left">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-sm text-gray-300">Status</div>
                    <div className="text-lg font-semibold text-white capitalize">
                      {userViewed.status}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-sm text-gray-300">Total Spent</div>
                    <div className="text-lg font-semibold text-green-400">
                      ${totalSpent.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {modalOpen && creator && (
          <SubscribeModal 
            open={modalOpen} 
            onClose={() => setModalOpen(false)} 
            creator={creator} 
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
    postSignedUrls
  }: {
    purchasedContent: MediaPost[];
    creator: Creator;
    isOwnProfile: boolean;
    status: 'subscriber' | 'follower' | 'none';
    viewingUser: User
    postSignedUrls: Record<string, string>;
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
            <PostsGrid creator={creator} status={status} viewingUser={viewingUser} postSignedUrls={postSignedUrls} />
          )}
          {activeTab === 'purchased' && (
            <PurchasedPostsGrid creator={creator} status={status} viewingUser={viewingUser} postSignedUrls={postSignedUrls}/>
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
    status,
    viewingUser,
    postSignedUrls
  }: {
    status: 'subscriber' | 'follower' | 'none';
    creator?: Creator;
    viewingUser: User;
    postSignedUrls: Record<string, string>;
  }) {
    const [users, setUsers] = useState<User[] | null>(null);
    
    const allPosts = creator?.posts || [];
    useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUsers = await userservice.get();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Couldn't fetch data: ", error);
      }
    };
    fetchData();
  }, []);
  const { data: session} = useSession();
  if (!creator) return null;
    // Filter posts based on relationship status
    const visiblePosts = allPosts.filter((post) =>
      viewingUser.purchases?.some((purchase) => purchase.postId === post._id)
    );
    const isCreator = viewingUser && viewingUser.id === creator.user;
    const isFollower = viewingUser.following?.some(f => f.creatorId.toString() === creator.id);
    const isSubscriber = !!viewingUser.subscriptions?.some(s => s.creatorId.toString() === creator.id);
    
    return (
      <div>
        {visiblePosts.length === 0 && (
          <div className='flex flex-col items-center'>
              <h1 className="text-2xl font-bold text-white mb-2">
                  You haven't purchased anything from this person yet!
                </h1>
          </div>
        )}
        
        {visiblePosts.map((post) => (
          <CreatorPostCard
            key={post._id}
            post={post}
            creator={creator}
            isCreator={isCreator}
            isFollower={isFollower}
            isSubscriber={isSubscriber}
            session={session}
            users={users.users}
            signedUrl={postSignedUrls[post._id]}
          />
        ))}
      </div>
    );
  }
  function MediaGrid({
    creator,
    status,
    postSignedUrls
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
              <Image
                src={resolveImageUrl(postSignedUrls[p._id])}
                alt="blurred background"
                fill
                className="object-cover blur-lg scale-110 brightness-50"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
  
              {/* Skeleton while loading */}
              {!isLoaded && (
              <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-gray-200 dark:bg-gray-700 z-20" />
            )}
  
              {/* Foreground Image */}
              <Image
                src={resolveImageUrl(postSignedUrls[p._id])}
                alt={p.caption || 'Media post'}
                fill
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
    postSignedUrls
  }: {
    creator?: Creator;
    status: 'subscriber' | 'follower' | 'none';
    viewingUser: User;
    postSignedUrls: { [key: string]: string };
  }) {
    const [users, setUsers] = useState<User[] | null>(null);
    const { data: session} = useSession();
    useEffect(() => {
      const fetchData = async () => {
        try {
          const fetchedUsers = await userservice.get();
          setUsers(fetchedUsers);
        } catch (error) {
          console.error("Couldn't fetch data: ", error);
        }
      };
      fetchData();
    }, []);
    if (!creator) return null;
    
    const allPosts = creator.posts || [];
    
    // Filter posts based on relationship status
    const visiblePosts = allPosts.filter((post) => {
      if (status === 'subscriber') return true;
      if (status === 'follower') return post.viewableFor === 'followers';
      return post.viewableFor === 'followers'; // show blurred for public
    });
    const isCreator = viewingUser && viewingUser.id === creator.user;
    const isFollower = viewingUser && viewingUser.following?.some(f => f.creatorId.toString() === creator.id);
    const isSubscriber = !!viewingUser && viewingUser.subscriptions?.some(s => s.creatorId.toString() === creator.id);
    
    return (
      <div className="grid grid-cols-1 gap-6">
        {visiblePosts.map((post) => (
          <CreatorPostCard
          key={post._id}
          post={post}
          creator={creator}
          isCreator={isCreator}
          isFollower={isFollower}
          isSubscriber={isSubscriber}
          session={session}
          users={users?.users}
          signedUrl={postSignedUrls[post._id]}
        />
        ))}
      </div>
    );
  }
  
  
  
  
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Creator, MediaPost, Post } from '@/app/types';
import { MoreHorizontal, TreesIcon } from 'lucide-react';
import Image from 'next/image';
import SubscribeModal from '@/components/SubscribeModal';
import creatorservice from '@/app/services/creatorservice';
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from './ui/button';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { AvatarFallback } from './ui/avatar';
import postservice from '@/app/services/postservice';

function Modal({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-scale-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-pink-400"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-white mb-4 text-center">{title}</h2>
        <div className="text-gray-300 text-sm max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function ProfileContent({ 
    user, 
    purchasedContent, 
    totalSpent, 
    relationshipStatus, 
    isOwnProfile, 
    canViewContent 
  }: UserProfileData) {
    const [modalOpen, setModalOpen] = useState(false)
    const [creator, setCreator] = useState<Creator | null>(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [subscriptionStep, setSubscriptionStep] = useState<'select' | 'pay'>('select');
    const [isCreator, setIsCreator] = useState(false)
    useEffect(() => {
      async function fetchCreator() {
        const creators = await creatorservice.get()
        const correct = creators.creators.find(c => c.user === user.id || c.user?.id === user.id)
        if(correct){
          setCreator(correct)
          setIsCreator(true)
        }
      }
    
      if (user?.id) fetchCreator()
    }, [user])
  console.log("Creator", creator)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Profile Image */}
              <div className="relative">
              {!creator ? (
          <Skeleton className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700" />
        ) : creator.image ? (
          <>
            <Image
              src={creator.image}
              alt={creator.image || creator.username || "User profile image"}
              fill
              className="rounded-full border-pink-500/40 shadow-lg transition-all duration-300 object-cover"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <Skeleton className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 absolute top-0 left-0" />
            )}
          </>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold text-lg">
            {creator.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
                {creator && (
                  <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Creator
                  </div>
                )}
              </div>
  
              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {user.name || user.username}
                </h1>
                <p className="text-xl text-purple-200 mb-4">@{user.username}</p>
                
                {creator?.bio && (
                  <p className="text-gray-300 mb-6 max-w-2xl">{creator?.bio}</p>
                )}
  
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {isOwnProfile ? (
                    <Link 
                      href="/myprofile/edit" 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform"
                    >
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      {relationshipStatus === 'none' && (
                        <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform">
                          Follow
                        </button>
                      )}
                      {user && relationshipStatus !== 'subscriber' && (
                        <button 
                        className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform"
                        onClick={() => setModalOpen(true)}
                        >
                          Subscribe
                        </button>
                      )}
                    </>
                  )}
                </div>
                {/* Stats */}
                {!isOwnProfile && user.isCreator && (
                  <div className="mt-6 flex gap-6 text-center lg:text-left">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-sm text-gray-300">Status</div>
                      <div className="text-lg font-semibold text-white capitalize">
                        {relationshipStatus}
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
              canViewContent={canViewContent}
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
    canViewContent 
  }: {
    purchasedContent: MediaPost[];
    creator: Creator;
    isOwnProfile: boolean;
    canViewContent: boolean;
  }) {
    const [activeTab, setActiveTab] = useState(creator ? 'posts' : 'purchased');
  
    const tabs = [
      ...(creator ? [{ id: 'posts', label: 'Posts', count: creator.posts.length }] : []),
      ...(canViewContent ? [{ id: 'media', label: 'Media', count: creator.posts.some(p => p.signedUrl) ? creator.posts.filter(p => p.signedUrl).length : 0 }] : []),
      ...(!creator ? [{id: 'purchased', label: 'Purchased Content', count: purchasedContent.length}] : []),
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
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-200 ${
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
            <PostsGrid creator={creator} canViewContent={canViewContent} />
          )}
          {activeTab === 'purchased' && (
            <PostsGrid posts={purchasedContent} canViewContent={true} />
          )}
          {activeTab === 'media' && (
            <MediaGrid creator={creator} canViewContent={canViewContent}  />
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
  function MediaGrid({
    creator,
    canViewContent
  }: {
    canViewContent: boolean;
    creator?: Creator;
  }) {
    return (
      <div className='grid grid-cols-1 gap-6'>
          {creator?.posts.map(
            (p) => (
              /* <div>
                <Image
                key=[]
                src={p.signedUrl}
                alt={post.caption}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div> */ 
            )
          )}
      </div>
    )
  }
  function PostsGrid({
    canViewContent,
    creator,
  }: {
    canViewContent: boolean;
    creator?: Creator;
    posts?: MediaPost[];
  }) {
    const postList = creator?.posts || [];
  
    if (postList.length === 0) {
      return (
        <div className="text-center text-gray-400 py-12">
          <div className="text-6xl mb-4">📱</div>
          <p>No content available</p>
        </div>
      );
    }
  
    return (
      <div className={`grid grid-cols-1 gap-6`}>
        {postList.map((post) => (
          <PostCard key={post._id} post={post} creator={creator} canViewContent={canViewContent} />
        ))}
      </div>
    );
  }
  
  
  function PostCard({ post, canViewContent, creator }: { post: Post; canViewContent: boolean, creator: Creator }) {
    const shouldBlur = !canViewContent
    const [imageLoading, setImageLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const handleModalOpen = () => {
      
      setModalOpen((open) => !open)
    }
    const handleDeletePost = (id: string) => {
      try {
        postservice.deletePost(id)}
        catch(error){
          console.error(error)
          alert('Failed to delete post')
        }
    }
    const handleRepostContent = () => {
      
    };
    return (
      <div className="bg-white/10 backdrop-blur-sm max-w-3xl w-full rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 group hover:transform hover:shadow-2xl">
            <header className="flex items-center gap-4 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-purple-900/80">
    <div className="flex items-center gap-3 flex-1 min-w-0">
  <Link href={`/${creator.username}`}>
    <Avatar className="w-12 h-12">
      <AvatarImage src={creator.avatar} alt={creator.name || creator.username} />
      <AvatarFallback>{creator.name?.[0] || creator.username?.[0]}</AvatarFallback>
    </Avatar>
  </Link>

  <div className="min-w-0">
    <Link href={`/${creator.username}`}>
    <div className="font-semibold text-white truncate">{creator.name}</div>
    <div className="text-xs text-gray-400 truncate">@{creator.username}</div>
    </Link>
  </div>
</div>
      
      <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <Button
          variant="ghost"
          onClick={handleModalOpen}
          size="icon"
          className="text-gray-400 hover:text-pink-400 cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>

{/* Animated Dropdown for Post Options */}
<div className="relative">

{modalOpen && canViewContent && (
  <div
    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 space-y-2 transition-all duration-100 transform origin-top scale-95 opacity-100 animate-fade-in z-30 cursor-pointer"
  >
    <Link href={`/post/${post._id}/edit`}>
      <Button variant="ghost" className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer">
        Edit Post
      </Button>
    </Link>
    <Button
      variant="ghost"
      onClick={handleRepostContent}
      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer"
    >
      Repost Content
    </Button>
    <Button
      variant="ghost"
      onClick={() => handleDeletePost(post._id)}
      className="w-full justify-start text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
    >
      Delete Post
    </Button>
  </div>
)}

</div>
      
        {modalOpen && !canViewContent && (
          <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 space-y-2 transition-all duration-100 transform origin-top scale-100 opacity-100 animate-fade-in z-30"
        >
          <Link href={`/${creator.username}`}>
            <Button variant="ghost" className="w-full justify-start text-left">
              Go to creator profile
            </Button>
          </Link>

        </div>
        ) }
      </div>
    </header>
        <div className="aspect-square relative overflow-hidden">
          {post.type?.startsWith('image') ? (
            <Image
            src={post.signedUrl}
            alt={post.caption}
            fill
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 1200px) 100vw, 1200px"
            className={`transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
          />
          ) : post.type?.startsWith('video') ? (
            <video
              src={canViewContent ? post.signedUrl : ''}
              className={`w-full h-full object-cover ${shouldBlur ? 'blur-lg' : ''}`}
              poster="/video-placeholder.png"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-4xl">📄</div>
            </div>
          )}
          
          {/* Overlay */}
          {shouldBlur && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-sm">Subscribe to view</p>
              </div>
            </div>
          )}
  
          {/* Price tag */}
          {post.price && post.price > 0 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-sm font-semibold shadow-lg">
              ${post.price}
            </div>
          )}
        </div>
  
        {/* Content Info */}
        <div className="p-4">
          <h3 className={`font-semibold text-white mb-2 ${shouldBlur ? 'blur-sm select-none' : ''}`}>
            {post.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
            <div className="flex items-center gap-2">
              {post.subscriberOnly && (
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                  Subscribers Only
                </span>
              )}
              {post.isPublic && (
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                  Public
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
 
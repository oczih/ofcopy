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
import { PostCard } from './PostCard';

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

const handleFollow = (creator, user) => {

}


export default function ProfileContent({ 
    user, 
    purchasedContent, 
    totalSpent, 
    relationshipStatus, 
    isOwnProfile, 
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
                        <Button onClick={() => handleFollow} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform">
                          {user.following.some(c:  => c.creatorId === creator?.id) ? Following : Follow }
                        </Button>
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
            relationshipStatus={relationshipStatus}
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
    relationshipStatus,
  }: {
    purchasedContent: MediaPost[];
    creator: Creator;
    isOwnProfile: boolean;
    relationshipStatus: 'subscriber' | 'follower' | 'none';
  }) {
    const [activeTab, setActiveTab] = useState(creator ? 'posts' : 'purchased');
  
    const tabs = [
      ...([{ id: 'posts', label: 'Posts', count: creator.posts.length }]),
      ...(relationshipStatus !== 'none' ? [{ id: 'media', label: 'Media', count: creator.posts.filter(p => p.signedUrl).length }] : []),
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
            <PostsGrid creator={creator} relationshipStatus={relationshipStatus} />
          )}
          {activeTab === 'purchased' && (
            <PostsGrid creator={creator} relationshipStatus={relationshipStatus} />
          )}
          {activeTab === 'media' && (
            <MediaGrid creator={creator} relationshipStatus={relationshipStatus}  />
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
    relationshipStatus
  }: {
    relationshipStatus: 'subscriber' | 'follower' | 'none';
    creator?: Creator;
  }) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {creator?.posts.map((p) => (
          <div key={p.id} className="relative w-full h-60"> {/* fixed key here and set height for next/image */}
            <Image
              src={p.signedUrl}
              alt={p.caption || "Media post"}
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        ))}
      </div>
    );
  }
  function PostsGrid({
    creator,
    relationshipStatus,
  }: {
    creator?: Creator;
    relationshipStatus: 'subscriber' | 'follower' | 'none';
  }) {
    if (!creator) return null;
  
    const allPosts = creator.posts || [];
  
    // Filter posts based on relationship status
    const visiblePosts = allPosts.filter((post) => {
      if (relationshipStatus === 'subscriber') return true;
      if (relationshipStatus === 'follower') return post.viewableFor === 'followers';
      return post.viewableFor === 'followers'; // show blurred for public
    });
  
    return (
      <div className="grid grid-cols-1 gap-6">
        {visiblePosts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            creator={creator}
            relationshipStatus={relationshipStatus}
          />
        ))}
      </div>
    );
  }
  
  
  
  
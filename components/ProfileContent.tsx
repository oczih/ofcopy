'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Creator, MediaPost } from '@/app/types';
import { TreesIcon } from 'lucide-react';
import Image from 'next/image';
import SubscribeModal from '@/components/SubscribeModal';
import creatorservice from '@/app/services/creatorservice';
import { Skeleton } from "@/components/ui/skeleton"

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
    posts, 
    purchasedContent, 
    totalSpent, 
    relationshipStatus, 
    isOwnProfile, 
    canViewContent 
  }: UserProfileData) {
    const handleOpenModal = () => {
      
    }
    const [modalOpen, setModalOpen] = useState(false)
    const [creator, setCreator] = useState<Creator | null>(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [subscriptionStep, setSubscriptionStep] = useState<'select' | 'pay'>('select');
    useEffect(() => {
      async function fetchCreator() {
        const creators = await creatorservice.get()
        const correct = creators.creators.find(c => c.user === user.id || c.user?.id === user.id)
        setCreator(correct)
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
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      {relationshipStatus === 'none' && (
                        <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                          Follow
                        </button>
                      )}
                      {user && relationshipStatus !== 'subscriber' && (
                        <button 
                        className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
          <ContentTabs 
            posts={posts}
            purchasedContent={purchasedContent}
            isCreator={user.isCreator}
            isOwnProfile={isOwnProfile}
            canViewContent={canViewContent}
          />
        </div>
      </div>
    );
  }
  
  function ContentTabs({ 
    posts, 
    purchasedContent, 
    isCreator, 
    isOwnProfile, 
    canViewContent 
  }: {
    posts: MediaPost[];
    purchasedContent: MediaPost[];
    isCreator: boolean;
    isOwnProfile: boolean;
    canViewContent: boolean;
  }) {
    const [activeTab, setActiveTab] = useState(isCreator ? 'posts' : 'purchased');
  
    const tabs = [
      ...(isCreator ? [{ id: 'posts', label: 'Posts & Media', count: posts.length }] : []),
      { id: 'purchased', label: 'Purchased Content', count: purchasedContent.length },
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
            <PostsGrid posts={posts} canViewContent={canViewContent} />
          )}
          {activeTab === 'purchased' && (
            <PostsGrid posts={purchasedContent} canViewContent={true} />
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
  
  function PostsGrid({ posts, canViewContent }: { posts: MediaPost[]; canViewContent: boolean }) {
    if (posts.length === 0) {
      return (
        <div className="text-center text-gray-400 py-12">
          <div className="text-6xl mb-4">📱</div>
          <p>No content available</p>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} canViewContent={canViewContent} />
        ))}
      </div>
    );
  }
  
  function PostCard({ post, canViewContent }: { post: MediaPost; canViewContent: boolean }) {
    const shouldBlur = !canViewContent && !post.isPublic;
    
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 group hover:transform hover:scale-105 hover:shadow-2xl">
        <div className="aspect-square relative overflow-hidden">
          {post.type?.startsWith('image') ? (
            <img
              src={canViewContent ? `/api/media/get-media?key=${encodeURIComponent(post.s3Key)}` : '/blurred.png'}
              alt={post.title}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                shouldBlur ? 'blur-lg' : ''
              }`}
            />
          ) : post.type?.startsWith('video') ? (
            <video
              src={canViewContent ? `/api/media/get-media?key=${encodeURIComponent(post.s3Key)}` : ''}
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
 
'use client'

import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongoose';
import Media from '@/app/models/mediamodel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-client';
import User from '../models/usermodel';
import Purchase from '@/app/models/purchasemodel';
import Link from 'next/link';
import AppWrapper from "../../components/AppWrapper";
import { useState } from 'react';
import Post from '../models/postmodel';
const RESERVED_ROUTES = [
  'discover', 'messages', 'settings', 'subscriptions', 'notifications', 'api', 'components',
  'models', 'services', 'context', 'favicon.ico',
  'globals.css', 'layout.tsx', 'page.tsx', 'public',
  'lib', 'ui', 'auth', 'creators', 'stats', 'media',
  'users', 'upload',
];

// Define types

interface UserProfileData {
  user: typeof User; 
  posts: typeof Post[];
  purchasedContent: typeof Post[];
  totalSpent: number;
  relationshipStatus: string;
  isOwnProfile: boolean;
  canViewContent: boolean;
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  return (
    <AppWrapper>
      {await UserProfile({ params: Promise.resolve(params) })}
    </AppWrapper>
  );
}

async function UserProfile({ params: paramsPromise }: { params: Promise<{ username: string }> }) {
  const params = await paramsPromise;
  const session = await getServerSession(authOptions);
  await connectDB();

  const username = params.username.toLowerCase();

  if (RESERVED_ROUTES.includes(username)) {
    notFound();
  }

  const user = await User.findOne({ username });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.username === user.username;

  // If not logged in and viewing a normal user (not creator), redirect to signup
  if (!session && !user.isCreator) {
    redirect('/signup');
  }

  let posts: typeof Post[] = [];
  let purchasedContent: typeof Post[] = [];
  let totalSpent = 0;
  let relationshipStatus = 'none';
  let canViewContent = isOwnProfile;

  if (user.isCreator) {
    posts = await Media.find({ creatorId: user._id }).sort({ createdAt: -1 });
    
    if (!isOwnProfile && session?.user?.id) {
      relationshipStatus = await getUserRelationshipStatus(session.user.id, user._id.toString());
      totalSpent = await getTotalSpentOnCreator(session.user.id, user._id.toString());
      canViewContent = relationshipStatus === 'subscriber' || relationshipStatus === 'follower';
    }
  }

  // Get purchased content for any user (creator or regular user)
  if (session?.user?.id) {
    const purchases = await Purchase.find({ userId: session.user.id }).populate('mediaId');
    purchasedContent = purchases.map(p => p.mediaId).filter(Boolean);
  }

  const profileData: UserProfileData = {
    user,
    posts,
    purchasedContent,
    totalSpent,
    relationshipStatus,
    isOwnProfile,
    canViewContent
  };

  return <ProfileContent {...profileData} />;
}

function ProfileContent({ 
  user, 
  posts, 
  purchasedContent, 
  totalSpent, 
  relationshipStatus, 
  isOwnProfile, 
  canViewContent 
}: UserProfileData) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={user.image || '/default-avatar.png'}
                alt={user.name || user.username}
                className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-gradient-to-r from-pink-400 to-purple-400 shadow-2xl"
              />
              {user.isCreator && (
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
              
              {user.bio && (
                <p className="text-gray-300 mb-6 max-w-2xl">{user.bio}</p>
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
                    {user.isCreator && relationshipStatus !== 'subscriber' && (
                      <button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
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

// Helper functions
async function getUserRelationshipStatus(viewerId: string, creatorId: string) {
  // TODO: Implement actual logic for follower/subscriber/none
  // This should check your Follow and Subscription models
  return 'subscriber';
}

async function getTotalSpentOnCreator(viewerId: string, creatorId: string) {
  const purchases = await Purchase.find({ userId: viewerId, creatorId });
  return purchases.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
}
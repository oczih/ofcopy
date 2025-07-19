'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { MoreHorizontal, Heart, UserPlus, MessageCircle } from 'lucide-react';
import { Post, User } from '@/app/types';
import { useParams } from 'next/navigation';
import postservice from '@/app/services/postservice';
import { Sidebar } from '@/app/components/Sidebar';

export default function EditPostPage() {
  return (
    <SessionProvider>
      <EditPost />
    </SessionProvider>
  );
}

function EditPost() {
  const { data: session } = useSession();
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState<User | null>(null);

  // Fetch post
  useEffect(() => {
    async function fetchPost() {
      const fetchedPost = await postservice.getOne(postId);
      setPost(fetchedPost);
      setLikes(fetchedPost.likes || 0);
      setComments(fetchedPost.comments || []);
    }
    fetchPost();
  }, [postId]);

  // Mock user info (replace with actual session.user fetch if needed)
  useEffect(() => {
    if (session?.user) {
      setUser(session.user as User); // assuming session.user has the User type
    }
  }, [session]);

  if (!post) return <p>Loading...</p>;
  console.log("Post:", post)
  const postCreator = post.creator;
  const isFollowersOnly = post.viewableFor === 'followers';
  const isSubscribersOnly = post.viewableFor === 'subscribers';

  const isCreator = user?.id === postCreator.id;
  const isFollower = true; // TODO: determine based on your logic
  const isSubscriber = true; // TODO: determine based on your logic

  const canView = !isFollowersOnly && !isSubscribersOnly || isCreator || isFollower || isSubscriber;

  const handleModalToggle = () => setModalOpen(!modalOpen);
  const handleLike = () => setLikes((prev) => prev + 1);
  const handleToggleComment = () => {};
  const handleEditPost = () => { console.log('Edit post') };
  const handleRepostContent = () => { console.log('Repost content') };
  const handleDeletePost = () => { console.log('Delete post') };

  return (
    <div>
      <Sidebar />
      <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 max-w-3xl mx-auto overflow-hidden animate-fade-in">
        
        {/* Header */}
        <header className="flex items-center gap-4 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-purple-900/80">
          <Link href={`/${postCreator.username}`} className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-12 h-12">
              <AvatarImage src={postCreator.avatar} alt={postCreator.name || postCreator.username} />
              <AvatarFallback>{postCreator.name?.[0] || postCreator.username?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-white truncate">{postCreator.name}</div>
              <div className="text-xs text-gray-400 truncate">@{postCreator.username}</div>
            </div>
          </Link>

          <div className="relative">
            <Button variant="ghost" onClick={handleModalToggle} size="icon" className="text-gray-400 hover:text-pink-400">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
            {modalOpen && (
              <div className="absolute right-0 mt-2 bg-slate-800 rounded shadow p-2 space-y-1 z-10">
                {isCreator && (
                  <>
                    <Button variant="ghost" onClick={handleEditPost}>Edit Post</Button>
                    <Button variant="ghost" onClick={handleRepostContent}>Repost Content</Button>
                    <Button variant="ghost" onClick={handleDeletePost} className="text-red-500">Delete Post</Button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Media */}
        <div className="relative bg-slate-900">
            <div className="relative w-full" style={{ aspectRatio: `${post.width} / ${post.height}` }}>
              <Image
                src={post.signedUrl}
                alt={post.caption}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="rounded-none"
              />
            </div>
        </div>

        {/* Caption */}
          <div className="px-5 py-3">
            <div className="text-white text-sm">{post.caption}</div>
            <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
          </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-slate-950/80">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-pink-400" onClick={handleLike}>
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400" onClick={handleToggleComment}>
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-3 text-xs text-gray-400">
            <span>{likes} Likes</span>
            <span>{comments.length} Comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

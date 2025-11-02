import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, Eye, EyeOff, AlertCircle, X, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import { toast } from 'react-hot-toast';
import { useRouter } from "next/navigation";
import postservice from '@/app/services/postservice'; // adjust path accordingly
import { Comment, Creator, Post, User } from '@/app/types';
import { Skeleton } from './ui/skeleton';
import { resolveImageUrl } from './resolveImageUrl';

// Signup Modal Component
function SignupModal({ open, onClose, creatorName }: { open: boolean, onClose: () => void, creatorName: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'oauth' | 'email'>('oauth');
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fun username generator
  function generateUsername() {
    const adjectives = [
      'starry', 'brave', 'lucky', 'fuzzy', 'cosmic', 'silly', 'swift', 'sunny', 'fancy', 'mighty',
      'frosty', 'jazzy', 'witty', 'zesty', 'breezy', 'quirky', 'snazzy', 'peachy', 'spicy', 'dreamy'
    ];
    const animals = [
      'lion', 'otter', 'panda', 'fox', 'tiger', 'koala', 'eagle', 'wolf', 'bunny', 'owl',
      'dolphin', 'bear', 'cat', 'dog', 'falcon', 'shark', 'whale', 'moose', 'lynx', 'gecko'
    ];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${animal}${num}`;
  }

  const handleOAuthSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: '/discover' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Error signing in with ${provider}: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push("/home");
      toast.success('Registration successful! Please check your email to verify your account.');
      onClose();
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => {
      let newUsername = prev.username;
      if (!prev.username) {
        newUsername = generateUsername();
      }
      return { ...prev, email: value, username: newUsername };
    });
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-md relative animate-scale-in overflow-hidden">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center p-6 pb-4">
          <div className="text-4xl mb-3">🔓</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Unlock {creatorName}&apos;s Content
          </h2>
          <p className="text-gray-300 text-sm">
            Join Fanslio to access exclusive content from your favorite creators
          </p>
        </div>

        <div className="px-6 pb-6">
          {signupMethod === 'oauth' ? (
            // OAuth Signup
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                  className="flex items-center gap-3 w-full justify-center py-3 px-4 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? 'Signing up...' : 'Continue with Google'}
                </button>
                
                <button
                  onClick={() => handleOAuthSignIn('twitter')}
                  disabled={isLoading}
                  className="flex items-center gap-3 w-full justify-center py-3 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  {isLoading ? 'Signing up...' : 'Continue with Twitter'}
                </button>
              </div>

              <div className="flex items-center my-6">
                <Separator className="flex-1 h-px bg-white/20" />
                <span className="mx-4 text-white/60 text-xs font-medium">OR</span>
                <Separator className="flex-1 h-px bg-white/20" />
              </div>

              <button
                onClick={() => setSignupMethod('email')}
                className="w-full py-3 px-4 rounded-xl border border-purple-500/50 text-white hover:bg-purple-500/10 transition-all duration-200 font-medium"
              >
                Sign up with Email
              </button>
            </div>
          ) : (
            // Email Signup Form
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <button
                type="button"
                onClick={() => setSignupMethod('oauth')}
                className="text-purple-400 hover:text-purple-300 text-sm mb-4 flex items-center gap-1"
              >
                ← Back to quick signup
              </button>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-gray-400 border ${
                    errors.email ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-500 focus:outline-none transition-colors`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Username Field */}
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-gray-400 border ${
                    errors.username ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-500 focus:outline-none transition-colors`}
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 bg-white/10 rounded-xl text-white placeholder-gray-400 border ${
                    errors.password ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-500 focus:outline-none transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-gray-400 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                  } focus:border-purple-500 focus:outline-none transition-colors`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 underline">
                Log in
              </Link>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              By signing up, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostCard({
  post,
  creator,
  status,
  viewingUser,
  signedUrl
}: {
  post: Post;
  creator: Creator;
  status: 'subscriber' | 'follower' | 'none';
  viewingUser: User
  signedUrl: string
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState<string | null>(null); // Track which comment's modal is open
  const [commentOpen, setCommentOpen] = useState(false); // Fixed variable name
  const [commentText, setCommentText] = useState(''); // Added missing state
  const [sending, setSending] = useState(false); // Added missing state
  const [comments, setComments] = useState(post.comments || []); // Added comments state
  const [likes, setLikes] = useState(post.likes ?? []);

  const shouldBlur = status === 'none';
  const isOwner = viewingUser._id === creator._id; // Fixed owner check

  const handleModalOpen = () => setModalOpen((open) => !open);

  const handleDeletePost = async (id: string) => {
    try {
      await postservice.deletePrivatePost(id);
      alert('Post deleted');
    } catch (error) {
      console.error(error);
      alert('Failed to delete post');
    }
  };

  const handleRepostContent = () => {
    // implement repost logic
  };

  const handleUnlockClick = () => {
    if (status === 'none') {
      setSignupModalOpen(true);
    }
  };

  const handleLike = async (post: Post) => {

    if(post.likes.some(like => like.userId.toString() === viewingUser._id)){

      try {
        const res = await fetch(`/api/media?username=${creator.username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post._id,
            liker: { userId: viewingUser._id },
            unlike: true
          }),
        });
    
        if (res.ok) {
          const data = await res.json();
          const updated = data.posts.find((p: Post) => p._id === post._id);
          if (updated) {
            setLikes(updated.likes ?? []);

          }
        } else {
          alert('Failed to unlike post');
        }
      } catch (error) {
        console.error(error);
        alert('Failed to unlike post');
      }
    }
    else {
      try {
        const res = await fetch(`/api/media?username=${creator.username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post._id,
            liker: { userId: viewingUser._id }
          })
        });
      
        if (res.ok) {
          const data = await res.json();
          const updated = data.posts.find((p: Post) => p._id === post._id);

          if (updated) setLikes(updated.likes ?? []);
        } else {
          alert('Failed to like post');
        }
        const notifRes = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'like',
            by: viewingUser._id,
            forUsers: [creator._id],
            postId: post._id, // 🔹 now sent to backend
          }),
        });
    
        if (!notifRes.ok) {
          const errorData = await notifRes.json();
          console.error('Failed to create notification:', errorData);
        }
      } catch (error) {
        console.error(error);
        alert('Failed to like post');
      }
    }
  };

  const isLikedByCurrentUser = likes.some(
    (like) => like.userId.toString() === viewingUser._id?.toString()
  );

  const handleToggleComment = () => {
    setCommentOpen((open) => !open);
  };

    const handleCommentModalOpen = (commentId: string) => {
      setCommentModalOpen(commentModalOpen === commentId ? null : commentId);
    };
  const notifiedCreators = useRef<Set<string>>(new Set());
  const handleSendComment = async () => {
    if (!commentText.trim() || sending) return;
    
    setSending(true);
    try {
      const res = await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          text: commentText,
          userId: viewingUser._id,
          username: viewingUser.username
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
        setCommentText('');
      } else {
        alert('Failed to send comment');
      }

      if (!notifiedCreators.current.has(creator._id)) {
        notifiedCreators.current.add(creator._id);
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "comment",
            by: viewingUser._id,
            postId: post._id,
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

    } catch (error) {
      console.error(error);
      alert('Failed to send comment');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          userId: viewingUser._id
        }),
      });

      if (res.ok) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
        setCommentModalOpen(null);
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete comment');
    }
  };

  // Helper function to check if user can delete comment
  const canDeleteComment = (comment: Comment) => {
    const isCommentOwner = comment.userId === viewingUser._id;
    const isPostOwner = creator._id;
    return isCommentOwner || isPostOwner;
  };
  
  return (
    <>
      <div className="bg-white/10 backdrop-blur-sm max-w-3xl w-full rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 group hover:transform hover:shadow-2xl">
        {/* HEADER */}
        <header className="flex items-center gap-4 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-purple-900/80">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href={`/${creator.username}`}>
              <Avatar className="w-12 h-12">
                <AvatarImage src={`/api/media/${creator.avatarKey}`} alt={creator.name || creator.username} />
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

          {/* OPTIONS BUTTON */}
          {isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={handleModalOpen}
                size="icon"
                className="text-gray-400 hover:text-pink-400 cursor-pointer"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>

              {modalOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 space-y-2 z-30">
                  <Link href={`/post/${post._id}/edit`}>
                    <Button variant="ghost" className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-slate-600">
                      Edit Post
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleRepostContent}
                    className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-slate-600"
                  >
                    Repost Content
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeletePost(post._id)}
                    className="w-full justify-start text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete Post
                  </Button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* MEDIA SECTION */}
        <div className="aspect-square relative overflow-hidden">
          {imageLoading && (
            <Skeleton className="w-full h-full rounded-none bg-gray-200 dark:bg-gray-700" />  
          )}
          {post.type?.startsWith('image') ? (
            <Image
              src={resolveImageUrl(signedUrl) || ""}
              alt={post.caption || ""}
              fill
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 1200px) 100vw, 1200px"
              className={`transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'} ${shouldBlur ? 'blur-md brightness-50' : ''}`}
            />
          ) : post.type?.startsWith('video') ? (
            <video
              src={!shouldBlur ? signedUrl : ''}
              className={`w-full h-full object-cover ${shouldBlur ? 'blur-md brightness-50' : ''}`}
              controls={!shouldBlur}
              poster="/video-placeholder.png"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-4xl">📄</div>
            </div>
          )}

          {shouldBlur && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Subscribe to {creator.name} to unlock this content
                </p>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 text-sm font-medium transition-all duration-200 hover:scale-105" 
                  onClick={handleUnlockClick}
                >
                  Unlock Content
                </Button>
              </div>
            </div>
          )}

          {post.price && post.price > 0 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-sm font-semibold shadow-lg">
              ${post.price}
            </div>
          )}
        </div>

        {/* CONTENT INFO */}
        <div className="p-4">
          <div className="px-5 py-3 space-y-1">
            <div className="text-white text-sm">{post.caption}</div>
            <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-slate-950/80">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-pink-400 cursor-pointer"
                onClick={() => handleLike(post)}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isLikedByCurrentUser
                      ? "text-pink-400 fill-pink-400"
                      : "text-gray-400"
                  }`}
                />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400 hover:bg-grey cursor-pointer" onClick={handleToggleComment}>
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex gap-3 text-xs text-gray-400 items-center">
              <span>{likes.length} Likes</span>
              <button onClick={handleToggleComment} className="hover:underline cursor-pointer">
                {comments.length} Comments
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {commentOpen && (
            <div className="w-full px-5 pb-4 mt-5 mb-5 space-y-4 animate-fade-in-fast">
              {/* Comments List */}
              <div className="space-y-2">
                {comments && comments.length > 0 ? (
                  comments.map((comment: Comment, idx) => (
                    <div key={comment._id || idx} className="flex items-start gap-3 bg-slate-800/60 rounded-lg p-3 relative">
                      <div className="flex flex-row items-center gap-2 min-w-0 flex-1">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.userId || ''} alt={comment.username || 'User'} />
                          <AvatarFallback>{comment.username?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-pink-300 font-semibold truncate">{comment.username}</span>
                            <span className="text-xs text-gray-400">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                            </span>
                          </div>
                          <span className="text-white text-sm break-words mt-1">{comment.text}</span>
                        </div>
                      </div>
                      
                      {/* Comment Options */}
                      {canDeleteComment(comment) && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-pink-400 cursor-pointer w-8 h-8"
                            onClick={() => handleCommentModalOpen(comment._id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>

                          {commentModalOpen === comment._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 space-y-2 transition-all duration-100 transform origin-top scale-95 opacity-100 animate-fade-in z-30">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                                onClick={() => handleDeleteComment(comment._id)}
                              >
                                Delete Comment
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 italic">No comments yet.</div>
                )}
              </div>

              {/* Comment Input */}
              <div className="flex w-full items-start gap-3">
                {viewingUser?.avatarKey && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={`/api/media/${viewingUser.avatarKey}` || ""} alt={viewingUser.name || 'User'} />
                    <AvatarFallback>{viewingUser.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <textarea
                  className="flex-1 rounded-lg border border-white/20 bg-slate-900 text-white p-2 resize-none transition-all duration-200 hover:border-white focus:border-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  rows={2}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  disabled={sending}
                />
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-4 py-1 rounded-full shadow mt-1"
                  onClick={handleSendComment}
                  disabled={sending || !commentText.trim()}
                >
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
            <div className="flex items-center gap-2">
              {post.viewableFor === 'subscribers' && (
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                  Subscribers Only
                </span>
              )}
              {post.viewableFor === "Followers" && (
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                  Followers
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal 
        open={signupModalOpen} 
        onClose={() => setSignupModalOpen(false)}
        creatorName={creator.name || creator.username}
      />
    </>
  );
}
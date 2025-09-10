/* eslint-disable @next/next/no-img-element */
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MoreHorizontal, Heart, MessageCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import { Session } from "next-auth";
import { Comment, Creator, Post, User} from "../app/types";
import { Skeleton } from "@/components/ui/skeleton"
import MediaRenderer from "./MediaRenderer";
import PaymentForm from "./PaymentForm";
import { createPortal } from "react-dom";


// Dynamically import emoji-picker-react to avoid SSR issues

export function CreatorPostCard({
  creator,
  post,
  session,
  status,
  user,
  users,
  blurredUrl,
  signedUrl,
  handleFollow,
  handleDeletePost
}: {
  creator: Creator;
  post: Post;
  session: Session | null;
  status: 'follower' | 'subscriber' | 'none',
  user: Creator | User
  users: User[]
  signedUrl: string;
  blurredUrl: string;
  handleFollow: (creator: Creator) => void;
  handleDeletePost: () => void;
}) {
  // Restriction logic
  const isFollowersOnly = post.viewableFor === "followers";
const isSubscribersOnly = post.viewableFor === "subscribers";
const [paymentModal, setPaymentModal] = useState(false)
function resolveImageUrl(url: string) {
  if (!url) return null;
  if (url.startsWith("http")) return url; // signed URL is absolute
  return `https://cdn.fanslio.com/${url.replace(/^\/+/, '')}`;
}
  // Example: find the creator that matches the current session user

  const isViewingUserOwner = String(creator.user) === String(session?.user?._id);
  
  // Check if the post creator is the same as the viewing creator
  const [canView, setCanView] = useState(false);
  const PortalModal = ({ children, open }: { children: React.ReactNode; open: boolean }) => {
    if (!open || typeof document === "undefined") return null;
    return createPortal(children, document.body);
  };
  useEffect(() => {
    const isFollowersOnly = post.viewableFor === "followers";
    const isSubscribersOnly = post.viewableFor === "subscribers";
    const isViewingUserOwner = String(creator.user) === String(session?.user?._id);
  
    // Default visibility rules
    let canUserView =
      isViewingUserOwner ||
      (!isFollowersOnly && !isSubscribersOnly) ||
      status === "follower" ||
      status === "subscriber";
  
    // If post has a price, restrict unless owner (or later: unlocked)
    if (post.price && post.price > 0 && !isViewingUserOwner) {
      canUserView = false; // or check against a `hasPurchased(post)` function
    }
  
    setCanView(canUserView);
  }, [status, session?.user?._id, creator.user, post.viewableFor, post.price]);
  // Like and comment modal state
  useEffect(() => {
    if (!paymentModal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [paymentModal]);
  
  // close on Escape
  useEffect(() => {
    if (!paymentModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPaymentModal(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paymentModal]);
  const [commentOpen, setCommentOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false)
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState<string | null>(null);
  const [likes, setLikes] = useState(post.likes ?? []);
  const [comments, setComments] = useState(post.comments ?? []);
  
  const [imageLoading, setImageLoading] = useState(true);

  const handleLike = async (post: Post) => {
  try {
    // 1️⃣ Update like status in your media API
    const res = await fetch(`/api/media?username=${creator.username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: post._id,
        liker: { userId: session?.user?._id },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const updated = data.posts.find((p: Post) => p._id === post._id);
      if (updated) setLikes(updated.likes ?? []);
    } else {
      alert('Failed to like post');
      return; // stop if like didn't go through
    }
    const forUsersFormatted = [creator, user].map(u => ({
      model: 'Creator', // or 'Creator' if applicable
      id: u._id.toString(),
    }));
    
    // 2️⃣ Send notification request with postId for duplicate check
    const notifRes = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'like',
        by: session?.user._id,
        forUsers: forUsersFormatted,
        postId: post._id, 
      // 🔹 now sent to backend
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
};
  const handleUnlike = async (post: Post) => {
    try {
      const res = await fetch(`/api/media?username=${creator.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          liker: { userId: session?.user?._id },
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (creator.avatarKey) {
        try {
          setImageLoading(true);
  
          const key = creator.avatarKey?.replace(/^\/+/, ''); // Remove leading slash
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
          setSignedUrlLoading(false);
          setImageLoading(false);
        }
      } else {
        setImageLoading(false);
      }

    };
  
    fetchAvatarUrl();
  }, [creator?.avatarKey]);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  const avatarKey = (session?.user as User)?.avatarKey;
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (avatarKey) {
        try {
          setImageLoading(true);
          if (avatarKey.startsWith("http")) {
            setUserAvatarUrl(avatarKey);
            setUserAvatarUrl(avatarKey); // use the URL directly
            setImageLoading(false);
            return null;
          }
          const key = avatarKey.replace(/^\/+/, ''); // Remove leading slash
          const res = await fetch("/api/media/download-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ s3Key: key }),
          });
  
          const data = await res.json();
  
          if (res.ok && data.downloadUrl && data.downloadUrl.startsWith("https://")) {
            setUserAvatarUrl(data.downloadUrl);
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
  }, [avatarKey]);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
const [avatarsLoading, setAvatarsLoading] = useState<Record<string, boolean>>({});
const resolvedUrl = useMemo(() => resolveImageUrl(signedUrl), [signedUrl]);
const resolvedBlurredUrl = useMemo(() => resolveImageUrl(blurredUrl), [blurredUrl]);
const [signedUrlLoading, setSignedUrlLoading] = useState(true);
const fetchUserAvatarUrl = async (user: User) => {
  if (!user.avatarKey) return;

  setAvatarsLoading(prev => ({ ...prev, [user._id]: true }));

  try {
    const key = user.avatarKey.replace(/^\/+/, '');
    const res = await fetch("/api/media/download-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ s3Key: key }),
    });

    const data = await res.json();

    if (res.ok && data.downloadUrl?.startsWith("https://")) {
      setUserAvatars(prev => ({ ...prev, [user._id]: data.downloadUrl }));
    }
  } catch (err) {
    console.error(err);
  } finally {
    setAvatarsLoading(prev => ({ ...prev, [user._id]: false }));
  }
};
useEffect(() => {
  if (!Array.isArray(users)) return;

  users.forEach(user => {
    if (user.avatarKey && !userAvatars[user._id]) {
      fetchUserAvatarUrl(user);
    }
  });
}, [users, userAvatars]);
  const isLikedByCurrentUser = likes.some(
    (like) => like.userId.toString() === session?.user?._id?.toString()
  );
  const handleToggleComment = () => {
    setCommentOpen((open) => !open);
  };
  const handleModalOpen = () => {
    setModalOpen((open) => !open)
  }
  const notifiedCreators = useRef<Set<string>>(new Set());
  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/media?username=${creator.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          comment: {
            userId: user?._id,
            username: user?.username,
            text: commentText,
            createdAt: new Date().toISOString(),
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.posts.find((p: typeof post) => p._id === post._id);
        if (updated) setComments(updated.comments ?? []);
        setCommentText("");
      } else {
        alert('Failed to add comment');
      }
      if (!notifiedCreators.current.has(creator._id)) {
        notifiedCreators.current.add(creator._id);
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "comment",
            by: session?.user?._id,
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
      alert('Failed to add comment');
    } finally {
      setSending(false);
    }
  };
  const handleRepostContent = async () => {
    try {
      const response = await fetch(`/api/media?username=${session?.user?.username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3Key: post.s3Key,
          caption: post.caption,
          creatorId: creator?._id,
          type: post.type,
          viewable: post.viewableFor,
          width: post.width,
          height: post.height,
          price: post.price ?? 0,
          originalContentId: post._id, // 👈 tie repost to original
          isRepost: true, // 👈 flag it as a repost for UI
        }),
      });
  
      if (!response.ok) {
        console.error("Post creation failed");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const rightUser = (comment: Comment) => {
    const correctUser = users?.find(u => u._id === comment.userId)
    return correctUser
  }
  const canDeleteComment = (comment: Comment) => {
    const isCommentOwner = comment.userId === session?.user?._id;
    const isPostOwner = session?.user?._id === creator._id
    return isCommentOwner || isPostOwner;
  };
  const canDeletePost = () => { const isPostOwner = isViewingUserOwner; return isPostOwner; };
  const handleCommentModalOpen = (commentId: string) => {
    setCommentModalOpen(commentModalOpen === commentId ? null : commentId);
  };
  const handleDeleteComment = async (postId: string, commentId: string) => {
  if (!postId || !commentId) {
    console.error('Missing postId or commentId');
    return;
  }

  try {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }), // ✅ send postId
    });

    if (res.ok) {
      setComments(prev => prev.filter(comment => comment._id !== commentId)); // ✅ correct filtering
      setCommentModalOpen(null);
    } else {
      console.error(res);
      alert('Failed to delete');
    }
  } catch (error) {
    console.error(error);
    alert('Failed to delete comment');
  }
};

  const resolvedAvatarUrl = useMemo(
    () => resolveImageUrl(avatarUrl ?? ""), // Use empty string if null
    [avatarUrl]
  );
  function timeAgo(date: string | Date) {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime(); // difference in ms
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }
  return (
  <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-0 overflow-hidden max-w-3xl w-full mx-auto animate-fade-in">
    {/* Header */}
    
    <header className="flex flex-wrap items-center gap-3 sm:gap-4 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-purple-900/80">
    <div className="flex items-center gap-4 flex-1 min-w-0">
  {/* Avatar + link */}
  <div className="flex flex-col">
    <div className="flex flex-row gap-5">
  <Link href={`/${creator.username}`} className="shrink-0">
    <Avatar className="w-12 h-12 ring-2 ring-gray-800 hover:ring-indigo-500 transition">
      {imageLoading ? (
        <Skeleton className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700" />
      ) : 
      (<img
        src={resolvedAvatarUrl ?? undefined}
        alt={creator.name || creator.username}
        onLoad={() => setImageLoading(false)}
        className="object-cover"
      />)}
      <AvatarFallback>
        {creator.name?.[0]?.toUpperCase() || creator.username?.[0]?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  </Link>

  {/* Creator info */}
  <div className="flex flex-col min-w-0">
    <Link href={`/${creator.username}`}>
      <span className="font-semibold text-white text-sm sm:text-base truncate hover:underline">
        {creator.name}
      </span>
    </Link>
    <span className="text-xs sm:text-sm text-gray-400 truncate">
      @{creator.username}
    </span>
  </div>
  </div>
  <div className="mt-5">
        <div className="text-white text-sm whitespace-pre-wrap break-words">{post.caption}</div>
      </div> 
      </div>
  {/* Repost info */}
  {session?.user?.following?.some(f => f.creatorId === post.creator) && post.isRepost && post.originalContentId && (
    <div className="ml-auto text-xs text-gray-400 flex items-center space-x-1 truncate">
      <span>Reposted from</span>
      <Link href={`/post/${post.originalContentId}`}>
        <span className="text-indigo-400 hover:underline">this post</span>
      </Link>
    </div>
  )}
</div>
<span className="text-white text-sm">
    {timeAgo(post.createdAt)}
  </span>
      <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
        
        
        <div className="relative">
        <button
          onClick={handleModalOpen}
          className="text-white rounded-full p-3 transition-all duration-200 hover:bg-white/10 cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
        {modalOpen && !session?.user?.creator && !canDeletePost() && (
  <div className="absolute right-0 top-full mt-2 w-48 max-w-[90vw] overflow-hidden text-ellipsis bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 space-y-2 transition-all duration-100 transform origin-top scale-100 opacity-100 animate-fade-in z-30">
    <Link href={`/${creator.username}`}>
      <button className="w-full justify-start text-left cursor-pointer">
        Go to creator profile
      </button>
    </Link>
  </div>
)}
</div>
{/* Animated Dropdown for Post Options */}
<div className="relative">
{/* fixaa tää kohta, pitää olla post creator, koska toi creator on vaan että creator on olemassa*/}
{modalOpen && canDeletePost() && (
  <div
    className="absolute right-0 top-full mt-5 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 space-y-2 transition-all duration-100 transform origin-top scale-100 opacity-100 animate-fade-in z-30"
  >
    <Link href={`/post/${post._id}/edit`}>
      <Button variant="ghost" className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer">
        Edit Post
      </Button>
    </Link>
    <Button
      variant="ghost"
      onClick={() => handleRepostContent()}
      className="w-full justify-start text-left hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer"
    >
      Repost Content
    </Button>
    <Button
      variant="ghost"
      onClick={() => handleDeletePost()}
      className="w-full justify-start text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
    >
      Delete Post
    </Button>
  </div>
)}
<PortalModal open={paymentModal}>
  <div
    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    onClick={() => setPaymentModal(false)} // click backdrop to close
    aria-modal="true"
    role="dialog"
  >
    <div className="w-full max-w-xl mx-auto" onClick={(e) => e.stopPropagation()}>
      <PaymentForm
        creator={creator}
        avatarUrl={avatarUrl || ""}
        onClose={() => setPaymentModal(false)}
        open={paymentModal}
        price={post.price}
        session={session}
        type="post"
      />
    </div>
  </div>
</PortalModal>
      </div>
      </div>
    </header>
    
    {/* Media */}
    <div className="relative bg-slate-900">
  {signedUrlLoading ? (
    <div className="relative w-full" style={{ minHeight: 200 }}>
      <Skeleton className="w-full rounded-none bg-gray-200 dark:bg-gray-700" />
    </div>
  ) : (
   <MediaRenderer 
    resolvedUrl={resolvedUrl ?? ""}
    resolvedBlurredUrl={resolvedBlurredUrl ?? ""}
    post={post}
    canView={canView}
    isSubscribersOnly={isSubscribersOnly}
    isFollowersOnly={isFollowersOnly}
    handleFollow={handleFollow}
    creator={creator}
    setPaymentModal={setPaymentModal}
   />
  )}

  {(isSubscribersOnly || isFollowersOnly) && (
    <Badge className="absolute top-4 left-4 bg-pink-600/90 text-white border-none shadow">
      {isSubscribersOnly ? "Subscribers only" : "Followers only"}
    </Badge>
  )}
</div> 

    {/* Footer */}
    {canView ? (
  <div className="flex flex-row justify-between">
    {/* Left side: Likes + Comments */}
    <div className="flex flex-col gap-2 items-left px-5 py-3 border-t border-white/10">
      <div className="flex flex-row gap-5">
        {/* Like button */}
        <button
          className="text-gray-400 hover:text-pink-400 cursor-pointer"
          onClick={() =>
            !isLikedByCurrentUser ? handleLike(post) : handleUnlike(post)
          }
        >
          <Heart
            className={`w-5 h-5 ${
              isLikedByCurrentUser
                ? "text-pink-400 fill-pink-400"
                : "text-gray-400"
            }`}
          />
        </button>

        {/* Comment button */}
        <button
          className="text-gray-400 hover:text-blue-400 hover:bg-grey/10 transition-all duration-200 cursor-pointer"
          onClick={handleToggleComment}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Counts */}
      <div className="flex gap-3 text-xs text-gray-400 flex-row">
        <span>{likes.length > 0 && `${likes.length} Likes`}</span>
        <span>{comments.length > 0 && `${comments.length} Comments`}</span>
      </div>
    </div>

    {/* Right side: Price */}
    <div className="flex flex-row items-center gap-1 px-4">
      {post.price > 0 ? (
        <>
          <LockKeyhole className="w-4 h-4 text-gray-400" />
          <span className="text-white text-sm">${post.price}</span>
        </>
      ) : null}
    </div>
  </div>
) : null}

    {/* Comments Section */}
    {(commentOpen) && (
      <div className="w-full px-5 pb-4 mt-3 sm:mt-5 mb-3 sm:mb-5 space-y-3 sm:space-y-4 animate-fade-in-fast">
        {/* Comments List */}
        <div className="space-y-2">
          {comments && comments.length > 0 ? (
            comments.map((comment: Comment, idx) => {
              const userObj = rightUser(comment);
              if (!userObj) return null;
              return (
                <div key={comment._id || idx} className="flex items-start gap-3 bg-slate-800/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-8 h-8">
                      {avatarsLoading[userObj._id] ? (
                        <Skeleton className="w-full h-full rounded-none bg-gray-200 dark:bg-gray-700" />
                      ) : userAvatars[userObj._id] ? (
                        <AvatarImage
                          key={userObj._id} // force re-render if src changes
                          src={userAvatars[userObj._id]}
                          alt={userObj?.name || userObj?.username || "User"}
                        />
                      ) : (
                        <AvatarFallback>
                          {userObj?.name?.[0] || userObj?.username?.[0] || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                      <span className="text-xs text-pink-300 font-semibold truncate">{comment.username}</span>
                    </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-white text-sm break-words">{comment.text}</span>
                    <span className="text-xs text-gray-400 mt-1">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</span>
                  </div>
                  {canDeleteComment(comment) && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-pink-400 cursor-pointer w-8 h-8"
                            onClick={() => handleCommentModalOpen(comment.postId)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>

                          {commentModalOpen === comment.postId && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 space-y-2 transition-all duration-100 transform origin-top scale-95 opacity-100 animate-fade-in z-30">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                                onClick={() => handleDeleteComment(post._id, comment._id)}
                              >
                                Delete Comment
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                </div>
              );
            })
          ) : (
            <div className="text-gray-400 italic">No comments yet.</div>
          )}
        </div>
        {/* Comment Input */}
        <div className="flex w-full items-start gap-3">
              {userAvatarUrl && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src={resolveImageUrl(userAvatarUrl) || ""} alt={session?.user?.name || 'User'} />
                  <AvatarFallback>
                    
                  <div className="w-15 h-15 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl  shadow-lg">
                    {session?.user?.name?.[0] || 'U'}
                    </div></AvatarFallback>
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
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-3 text-sm sm:px-4 py-1 rounded-full shadow mt-1"
                onClick={handleSendComment}
                disabled={sending || !commentText.trim()}
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>

      </div>
    )}
  </div>
);
}
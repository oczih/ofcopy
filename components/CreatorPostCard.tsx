import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Image from "next/image";
import { MoreHorizontal, Heart, MessageCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Session } from "@auth/core/types";
import { Comment, Creator, Post, User} from "../app/types";
import postservice from "../app/services/postservice";
import { Skeleton } from "@/components/ui/skeleton"
import { resolveImageUrl } from "./resolveImageUrl";

// Dynamically import emoji-picker-react to avoid SSR issues

export function CreatorPostCard({
  creator,
  post,
  session,
  isCreator,
  isFollower,
  isSubscriber,
  user,
  users,
  signedUrl,
  handleFollow,
}: {
  creator: Creator;
  post: Post;
  session: Session | null;
  isCreator: boolean;
  isFollower: boolean;
  isSubscriber: boolean | undefined;
  user: User
  users: User[]
  signedUrl: string
  handleFollow: (creator: Creator) => void;
}) {
  // Restriction logic
  const isFollowersOnly = post.viewableFor === "followers";
  const isSubscribersOnly = post.viewableFor === "subscribers";
  const canView = !isFollowersOnly && !isSubscribersOnly || isCreator || isFollower || isSubscriber;
  // Like and comment modal state
  const [commentOpen, setCommentOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false)
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState<string | null>(null);
  const [likes, setLikes] = useState(post.likes ?? []);
  const [comments, setComments] = useState(post.comments ?? []);
  const [showcomment, setShowComments] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const handleLike = async (post: Post) => {
      try {
        const res = await fetch(`/api/media?username=${creator.username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post._id,
            liker: { userId: session?.user?.id }
          })
        });
      
        if (res.ok) {
          const data = await res.json();
          const updated = data.posts.find((p: Post) => p._id === post._id);
          console.log("Like API response updated.likes:", updated?.likes);
          if (updated) setLikes(updated.likes ?? []);
        } else {
          alert('Failed to like post');
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
          liker: { userId: session?.user?.id },
          unlike: true
        }),
      });
  
      if (res.ok) {
        const data = await res.json();
        const updated = data.posts.find((p: Post) => p._id === post._id);
        if (updated) {
          setLikes(updated.likes ?? []);
          console.log("After: ", updated.likes);
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
const fetchUserAvatarUrl = async (user: User) => {
  if (!user.avatarKey) return null;

  try {
    setAvatarsLoading(prev => ({ ...prev, [user.id]: true }));

    const key = user.avatarKey.replace(/^\/+/, ''); // remove leading slash
    const res = await fetch("/api/media/download-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ s3Key: key }),
    });

    const data = await res.json();
    if (res.ok && data.downloadUrl && data.downloadUrl.startsWith("https://")) {
      setUserAvatars(prev => ({ ...prev, [user.id]: data.downloadUrl }));
      return data.downloadUrl;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user avatar:", error);
    return null;
  } finally {
    setAvatarsLoading(prev => ({ ...prev, [user.id]: false }));
  }
};
useEffect(() => {
  users.forEach(user => {
    if (user.avatarKey && !userAvatars[user.id]) {
      fetchUserAvatarUrl(user);
    }
  });
}, [users]);

  const isLikedByCurrentUser = likes.some(
    (like) => like.userId.toString() === session?.user?.id?.toString()
  );
  const handleToggleComment = () => {
    setCommentOpen((open) => !open);
  };
  const handleModalOpen = () => {
    setModalOpen((open) => !open)
  }
  const handleRepostContent = () => {
    setShowConfirm(true);
  };
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
            userId: user?.id,
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
    } catch (error) {
      console.error(error);
      alert('Failed to add comment');
    } finally {
      setSending(false);
    }
  };
  const rightUser = (comment: Comment) => {
    const correctUser = users?.find(u => u.id === comment.userId)
    return correctUser
  }
  const handleDeletePost = (id: string) => {
    try {
      postservice.deletePost(id)}
      catch(error){
        console.error(error)
        alert('Failed to delete post')
      }
  }
  const canDeleteComment = (comment: Comment) => {
    const isCommentOwner = comment.userId === session?.user?.id;
    const isPostOwner = session?.user?.id === creator.id
    return isCommentOwner || isPostOwner;
  };
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
        body: JSON.stringify({ postId }),
      });
  
      if (res.ok) {
        setComments(prev => prev.filter(comment => comment.commentId !== commentId));
        setCommentModalOpen(null);
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete comment');
    }
  };
  
  const resolvedAvatarUrl = useMemo(() => resolveImageUrl(avatarUrl), [avatarUrl]);
  return (
  <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-0 overflow-hidden max-w-3xl w-full mx-auto animate-fade-in">
    {/* Header */}
    
    <header className="flex items-center gap-4 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-purple-900/80">
    <div className="flex items-center gap-3 flex-1 min-w-0">
  <Link href={`/${creator.username}`}>
    <Avatar className="w-12 h-12">
      <AvatarImage src={resolvedAvatarUrl ?? undefined} alt={creator.name || creator.username} />
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

{modalOpen && creator && (
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
      
        {modalOpen && !user?.creator && (
          <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 space-y-2 transition-all duration-100 transform origin-top scale-100 opacity-100 animate-fade-in z-30"
        >
          <Link href={`/${creator.username}`}>
            <Button variant="ghost" className="w-full justify-start text-left cursor-pointer">
              Go to creator profile
            </Button>
          </Link>

        </div>
        ) }
      </div>
    </header>
    
    {/* Media */}
    <div className="relative bg-slate-900">
      
    {canView && signedUrl ? (
      <div
        className="relative w-full bg-black"
        style={post.width && post.height ? { aspectRatio: `${post.width} / ${post.height}` } : {}}
      >
        {imageLoading && (
          <Skeleton
          className="w-full h-full rounded-none bg-gray-200 dark:bg-gray-700"
        />  
        )}

        {post.width && post.height ? (
          <Image
          src={resolvedUrl || ""}
          alt={post.caption || ""}
          fill
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
          style={{ objectFit: "contain" }}
          sizes="(max-width: 1200px) 100vw, 1200px"
          className={`transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
        />
        ) : (
          <Image
            src={resolveImageUrl(signedUrl) || ""}
            alt={post.caption || ""}
            width={600}
            height={400}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            style={{ objectFit: 'cover' }}
            className={`w-full h-auto transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
          />
        )}
      </div>
    ) : (
        <div className="flex flex-col items-center justify-center h-72 w-full bg-slate-800 text-center space-y-3">
          <span className="text-2xl text-gray-300">
            {isSubscribersOnly ? "Subscribe to view" : isFollowersOnly ? "Follow to view" : "Restricted"}
          </span>
          <div className="flex gap-3">
            {isSubscribersOnly && (
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow cursor-pointer">
                <Heart className="w-4 h-4 mr-2" /> Subscribe
              </Button>
            )}
            {isFollowersOnly && (
              <Button onClick={() => handleFollow(creator)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-full shadow cursor-pointer">
                <UserPlus className="w-4 h-4 mr-2" /> Follow
              </Button>
            )}
          </div>
        </div>
      )}

      {(isSubscribersOnly || isFollowersOnly) && (
        <Badge className="absolute top-4 left-4 bg-pink-600/90 text-white border-none shadow">
          {isSubscribersOnly ? "Subscribers only" : "Followers only"}
        </Badge>
      )}
    </div>

    {/* Caption */}
    {canView && (
      <div className="px-5 py-3 space-y-1">
        <div className="text-white text-sm">{post.caption}</div>
        <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
      </div>
    )}

    {/* Footer */}
    <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-slate-950/80">
      <div className="flex gap-2">
      <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-pink-400 cursor-pointer"
            onClick={() => !isLikedByCurrentUser ? handleLike(post) : handleUnlike(post)}
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
        <button
         onClick={handleToggleComment}
          className="hover:underline cursor-pointer"
        >
          {comments.length} Comments
        </button>
      </div>
    </div>

    {/* Comments Section */}
    {(commentOpen || showcomment) && (
      <div className="w-full px-5 pb-4 mt-5 mb-5 space-y-4 animate-fade-in-fast">
        {/* Comments List */}
        <div className="space-y-2">
          {comments && comments.length > 0 ? (
            comments.map((comment: Comment, idx) => {
              const userObj = rightUser(comment);
              return (
                <div key={comment.commentId || idx} className="flex items-start gap-3 bg-slate-800/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={userAvatars[userObj?.id || ''] || userObj?.avatarKey || ''} 
                        alt={userObj?.name || userObj?.username || 'User'} 
                      />
                      <AvatarFallback>
                        {userObj?.name?.[0] || userObj?.username?.[0] || 'U'}
                      </AvatarFallback> 
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
                                onClick={() => handleDeleteComment(post._id, comment.commentId)}
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
                  <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
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
  </div>
);
}
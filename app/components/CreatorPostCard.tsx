import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Image from "next/image";
import { MoreHorizontal, Heart, MessageCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { Session } from "@auth/core/types";
import { Comment, Creator, Post } from "../types";
import uploadmediaservice from "../services/uploadmediaservice";
import { User } from "../types";
import postservice from "../services/postservice";

// Dynamically import emoji-picker-react to avoid SSR issues

export function CreatorPostCard({
  creator,
  post,
  session,
  isCreator,
  isFollower,
  isSubscriber,
  user,
  users
}: {
  creator: Creator;
  post: Post;
  session: Session;
  isCreator: boolean;
  isFollower: boolean;
  isSubscriber: boolean;
  user: User
  users: User[]
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
  const [showEmojis, setShowEmojis] = useState(false);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [comments, setComments] = useState(post.comments ?? []);
  const [showcomment, setShowComments] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false);
  const handleLike = async () => {
    try {
      const res = await fetch(`/api/media?username=${creator.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id, likes: likes + 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        // Find the updated post in the returned posts
        const updated = data.posts.find((p: typeof post) => p._id === post._id);
        if (updated) setLikes(updated.likes ?? likes + 1);
      } else {
        alert('Failed to like post');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to like post');
    }
  };

  const handleToggleComment = () => {
    setCommentOpen((open) => !open);
  };
  const handleShowComments = () => {
    setShowComments((open) => !open)
  }
  const handleModalOpen = () => {
    setModalOpen((open) => !open)
  }
  const handleRepostContent = () => {
    setShowConfirm(true);
  };
  const confirmRepost = () => {
    setShowConfirm(false);
    // TODO: Call your API to repost content
    console.log('Content reposted');
  };
  const cancelRepost = () => {
    setShowConfirm(false);
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
        setCommentOpen(false);
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
  return (
  <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-0 overflow-hidden max-w-3xl w-full mx-auto animate-fade-in">
    {/* Header */}
    <header className="flex items-center gap-4 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900/80 to-purple-900/80">
      <Link href={`/${creator.username}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="w-12 h-12">
          <AvatarImage src={creator.avatar} alt={creator.name || creator.username} />
          <AvatarFallback>{creator.name?.[0] || creator.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-semibold text-white truncate">{creator.name}</div>
          <div className="text-xs text-gray-400 truncate">@{creator.username}</div>
        </div>
      </Link>
      <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <Button variant="ghost" onClick={handleModalOpen} size="icon" className="text-gray-400 hover:text-pink-400">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
        {modalOpen && user.creator && (
          <div>
            <Link href={`/post/${post._id}/edit`}>
              <Button>
                  Edit Post
              </Button>
              </Link>
              <Button onClick={handleRepostContent}>
                Repost Content
              </Button>
              <Button onClick={() => handleDeletePost(post._id)}>
                  Delete Post
                </Button>
            </div>
        )}
        {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Repost
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to repost this content?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={cancelRepost}>Cancel</Button>
              <Button className="bg-pink-600 text-white" onClick={confirmRepost}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
        {modalOpen && !user.creator && (
          <div>
            
          </div>
        ) }
      </div>
    </header>

    {/* Media */}
    <div className="relative bg-slate-900">
      {canView && post.signedUrl ? (
        post.width && post.height ? (
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
        ) : (
          <Image
            src={post.signedUrl}
            alt={post.caption}
            width={600}
            height={400}
            className="w-full h-100 object-cover object-center"
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center h-72 w-full bg-slate-800 text-center space-y-3">
          <span className="text-2xl text-gray-300">
            {isSubscribersOnly ? "Subscribe to view" : isFollowersOnly ? "Follow to view" : "Restricted"}
          </span>
          <div className="flex gap-3">
            {isSubscribersOnly && (
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow">
                <Heart className="w-4 h-4 mr-2" /> Subscribe
              </Button>
            )}
            {isFollowersOnly && (
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-full shadow">
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
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-pink-400" onClick={handleLike}>
          <Heart className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400" onClick={handleToggleComment}>
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex gap-3 text-xs text-gray-400 items-center">
        <span>{likes} Likes</span>
        <span
          className="hover:underline"
        >
          {comments.length} Comments
        </span>
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
                        <AvatarImage src={userObj?.image || ''} alt={userObj?.name || userObj?.username || 'User'} />
                        <AvatarFallback>{userObj?.name?.[0] || userObj?.username?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-pink-300 font-semibold truncate">{comment.username}</span>
                    </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="text-white text-sm break-words">{comment.text}</span>
                    <span className="text-xs text-gray-400 mt-1">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-400 italic">No comments yet.</div>
          )}
        </div>
        {/* Comment Input */}
        <div className="flex w-full items-start gap-3">
              {session?.user?.image && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarImage src={session.user.image} alt={session.user.name || 'User'} />
                  <AvatarFallback>{session.user.name?.[0] || 'U'}</AvatarFallback>
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
'use client'

import { Session } from "next-auth";
import { Creator, User, Post, Purchase } from "@/app/types";
import { CreatorPostCard } from "@/components/CreatorPostCard";
import { notFound, useRouter} from "next/navigation";
import { useEffect, useState, useRef } from "react";
import creatorservice from "@/app/services/creatorservice";
import { Skeleton } from "@/components/ui/skeleton";
import SignUpModal from "@/components/SignupModal";
import { ChevronLeft } from "lucide-react";

interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
  posts: Post[];
  postId: string;
  purchases: Purchase[]
}

export default function App({ creators, users, session, posts, postId, purchases }: AppProps) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'subscriber' | 'follower' | 'none'>('none');
  const [currentUser, setCurrentUser] = useState<User>(session?.user as User);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  //const [imageLoading, setImageLoading] = useState(true);
  // Find the creator & post
  useEffect(() => {
    const foundCreator = creators.find(c =>
        c.posts?.some(p => p._id.toString() === postId)
      );
      const foundPost = posts.find(p => p._id.toString() === postId);
    setCreator(foundCreator ?? null);
    setPost(foundPost ?? null)
    setLoading(false);
  }, [creators, postId, posts]);

  // Redirect if not found
  if (!loading && (!creator || !post)) {
    notFound(); // only call after we finished loading
  }

  // Follow handler
  const notifiedCreators = useRef<Set<string>>(new Set());

  const handleFollow = async (creator: Creator) => {
    if(!session){
      setJoinModalOpen(true)
      return;
    }
    if (!creator) return;
  
    try {
      const alreadyFollowing = currentUser.following.some(f => f.creatorId === creator._id);
      if (alreadyFollowing) return;
  
      await creatorservice.followCreator(creator._id, session.user._id);
  
      setCurrentUser({
        ...currentUser,
        following: [
          ...currentUser.following,
          {
            creatorId: creator._id,
            creatorName: creator.name,
            creatorUsername: creator.username,
            followingDate: new Date(),
          },
        ],
      });
      setStatus("follower");
  
      if (!session?.user._id) {
        console.error("No user ID in session");
        return;
      }
  
      // Only notify if we haven't before
      if (!notifiedCreators.current.has(creator._id)) {
        notifiedCreators.current.add(creator._id);
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "newfollower",
            by: session.user._id,
            forUsers: [creator._id],
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to create notification:", errorData);
        }
      }
    } catch (err) {
      console.error("Error following creator:", err);
    }
  };
  const router = useRouter();
  const handleDeletePost = async (creatorId: string, postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error("Failed to delete post");
  
      // Redirect to home page after deletion
      router.push("/home");
  
    } catch (error) {
      console.error(error);
      alert('Failed to delete post');
    }
  };

  if (!creator || !post) return null;
  const viewingUser = session?.user
  return (
    <div className="max-w-4xl mx-auto py-8">
       <div className="md:hidden">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-white"
        >
          <ChevronLeft className="w-6 h-6"/>
        </button>
      </div>
      {!loading ? (
        <>
          {joinModalOpen && creator && (
            <SignUpModal
              open={joinModalOpen}
              onClose={() => setJoinModalOpen(false)}
              creator={creator}
            />
          )}

          <CreatorPostCard
            creator={creator}
            post={post}
            session={session}
            status={status}
            user={viewingUser as User}
            users={users}
            purchases={purchases}
            handleFollow={handleFollow}
            handleDeletePost={() => handleDeletePost(creator._id, post._id)}
          />
        </>
      ) : (
        <Skeleton />
      )}
    </div>
  );
}

'use client'

import { Session } from "next-auth";
import { Creator, User, Post } from "@/app/types";
import { CreatorPostCard } from "@/components/CreatorPostCard";
import { notFound, useRouter} from "next/navigation";
import { useEffect, useState, useRef } from "react";
import creatorservice from "@/app/services/creatorservice";
import { Skeleton } from "@/components/ui/skeleton";
import SignUpModal from "@/components/SignupModal";

interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
  posts: Post[];
  postId: string;
}

export default function App({ creators, users, session, posts, postId }: AppProps) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'subscriber' | 'follower' | 'none'>('none');
  const [currentUser, setCurrentUser] = useState<User>(session?.user as User);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [postUrl, setPostUrl] = useState<string>("");
  const [blurredUrl, setBlurredUrl] = useState<string>("")
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  //const [signedUrlLoading, setSignedUrlLoading] = useState(true);
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (creator?.avatarKey) {
        try {
          //setImageLoading(true);
  
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
          //setSignedUrlLoading(false);
          //setImageLoading(false);
        }
      } else {
        //setImageLoading(false);
      }

    };
  
    fetchAvatarUrl();
  }, [creator?.avatarKey]);
  useEffect(() => {
    const fetchPostUrls = async () => {
      if (!post?.s3Key) return;
  
      try {
        if (typeof post.s3Key === "object") {
          const { key, blurred_key } = post.s3Key;
  
          // Fetch signed URL for main file
          const resMain = await fetch("/api/media/download-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ s3Key: key }),
          });
          const dataMain = await resMain.json();
  
          if (resMain.ok && dataMain.downloadUrl?.startsWith("https://")) {
            setPostUrl(dataMain.downloadUrl);
          } else {
            console.error("Invalid main download URL:", dataMain.downloadUrl);
          }
  
          // Fetch signed URL for blurred file (if available)
          if (blurred_key) {
            const resBlurred = await fetch("/api/media/download-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ s3Key: blurred_key }),
            });
            const dataBlurred = await resBlurred.json();
  
            if (resBlurred.ok && dataBlurred.downloadUrl?.startsWith("https://")) {
              setBlurredUrl(dataBlurred.downloadUrl);
            } else {
              console.error("Invalid blurred download URL:", dataBlurred.downloadUrl);
            }
          }
        } else {
          console.warn("Unexpected s3Key type (string):", post.s3Key);
        }
      } catch (error) {
        console.error("Error fetching post URLs:", error);
      }
    };
  
    fetchPostUrls();
  }, [post?.s3Key]);
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
      {!loading ? (
        <>
          {joinModalOpen && creator && (
            <SignUpModal
              open={joinModalOpen}
              onClose={() => setJoinModalOpen(false)}
              creator={creator}
              avatarUrl={avatarUrl || ""} // FIXED: replaced undefined avatarUrl
            />
          )}

          <CreatorPostCard
            creator={creator}
            post={post}
            session={session}
            status={status}
            user={viewingUser as User}
            users={users}
            signedUrl={postUrl}
            blurredUrl={blurredUrl}
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

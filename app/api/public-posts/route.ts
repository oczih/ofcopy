import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Post from "@/app/models/postmodel";


export async function GET(request: NextRequest) {
  if(!request) return;
  await connectDB();

  try {
    // Find all posts that are either public or viewable to followers/subs, 
    // but only fully reveal those that are public
    const posts = await Post.find({ viewable: true }).populate("creator");

    const sanitizedPosts = posts.map(post => {
      const isFollowerOrSub = false; // You'd check user subscriptions here if logged in

      // For public posts or if user is follower/sub:
      if (post.accessLevel === "public" || isFollowerOrSub) {
        return {
          id: post._id.toString(),
          caption: post.caption,
          imageUrl: post.imageUrl,
          creator: {
            name: post.creator.name,
            avatarKey: post.creator.avatarKey,
          },
          comments: post.comments,
          // full image shown
          blurred: false,
        };
      }

      // Otherwise, return blurred image version and limited data
      return {
        id: post._id.toString(),
        caption: post.caption,
        imageUrl: post.blurredImageUrl,  // blurred version stored separately
        creator: {
          name: post.creator.name,
          avatarKey: post.creator.avatarKey,
        },
        comments: [],  // Hide comments for restricted posts
        blurred: true,
      };
    });

    return NextResponse.json({ posts: sanitizedPosts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

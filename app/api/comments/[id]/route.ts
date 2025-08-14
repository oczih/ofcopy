import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Post from "@/app/models/postmodel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-client";


export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  const commentId = params.id;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
    }

    const body = await req.json();
    const { postId } = body;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    const post = await Post.findById(postId);
if (!post) {
  return NextResponse.json({ error: "Post not found" }, { status: 404 });
}

const comment = post.comments.id(commentId);
if (!comment) {
  return NextResponse.json({ error: "Comment not found" }, { status: 404 });
}

const isCommentAuthor = comment.userId.toString() === session.user._id;
const isPostOwner = post.creator.toString() === session.user._id;

if (!isCommentAuthor && !isPostOwner) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
    comment.deleteOne();
    await post.save();

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

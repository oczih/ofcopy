import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Post, { PostDocument } from "@/app/models/postmodel";
import Creator from "@/app/models/creatormodel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import mongoose from "mongoose";
import { Session } from "next-auth";

// Extended session type
interface AppSession extends Session {
  user: Session["user"] & {
    id: string;
  };
}

async function canViewPost(post: PostDocument, session: AppSession | null): Promise<boolean> {
  if (!session) return false;

  const isAdmin = session.user.email === process.env.SECEMAIL;
  const isOwner = post.creator?.toString() === session.user.id;

  if (isAdmin || isOwner) return true;

  // Check if viewer is a subscriber of the post's creator
  const creator = await Creator.findById(post.creator).lean<{ subscribers?: mongoose.Types.ObjectId[] }>();
  if (!creator) return false;

  const isSubscriber = creator.subscribers?.some(
    (subId) => subId.toString() === session.user.id
  );

  return Boolean(isSubscriber);
}

async function canEditOrDeletePost(post: PostDocument, session: AppSession | null): Promise<boolean> {
  if (!session) return false;

  const isAdmin = session.user.email === process.env.SECEMAIL;
  const isOwner = post.creator?.toString() === session.user.id;

  return isAdmin || isOwner;
}

export async function GET(request: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  const session = (await getServerSession(authOptions)) as AppSession | null;
  await connectDB();

  try {
    const { id } = params;
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const allowed = await canViewPost(post, session);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  const session = (await getServerSession(authOptions)) as AppSession | null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = params;
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const allowed = await canEditOrDeletePost(post, session);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const update: Partial<Pick<PostDocument, "caption" | "viewableFor" | "likes">> = {};

  if (typeof body.caption === "string") update.caption = body.caption;
  if (typeof body.viewableFor === "string") update.viewableFor = body.viewableFor;
  if (Array.isArray(body.likes)) update.likes = body.likes;

  let updatedPost: PostDocument | null;
  if (body.comment) {
    updatedPost = await Post.findByIdAndUpdate(
      post.id,
      { $push: { comments: body.comment }, ...(Object.keys(update).length > 0 ? update : {}) },
      { new: true }
    );
  } else if (Object.keys(update).length > 0) {
    updatedPost = await Post.findByIdAndUpdate(post.id, update, { new: true });
  } else {
    return NextResponse.json({ error: "No valid update fields" }, { status: 400 });
  }

  return NextResponse.json({ post: updatedPost });
}

export async function DELETE(request: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  const session = (await getServerSession(authOptions)) as AppSession | null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = params;
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const allowed = await canEditOrDeletePost(post, session);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await Post.findByIdAndDelete(post.id);

  return NextResponse.json({ message: "Post deleted successfully" });
}

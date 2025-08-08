import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Post from '@/app/models/postmodel';
import Creator from '@/app/models/creatormodel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-client';
import mongoose from 'mongoose';

async function canViewPost(post: any, session: any) {
  if (!session) return false;

  const isAdmin = session.user.email === process.env.SECEMAIL;
  const isOwner = post.user?.toString() === session.user.id?.toString();

  if (isAdmin || isOwner) return true;

  // Check if viewer is a subscriber of the post's creator
  const creator = await Creator.findOne({ user: post.user });
  if (!creator) return false;

  const isSubscriber = creator.subscribers?.some(
    (subId: mongoose.Types.ObjectId) => subId.toString() === session.user.id?.toString()
  );

  return isSubscriber;
}

async function canEditOrDeletePost(post: any, session: any) {
  if (!session) return false;

  const isAdmin = session.user.email === process.env.SECEMAIL;
  const isOwner = post.user?.toString() === session.user.id?.toString();

  return isAdmin || isOwner;
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  await connectDB();

  try {
    const post = await Post.findById(context.params.id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const allowed = await canViewPost(post, session);
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const post = await Post.findById(context.params.id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const allowed = await canEditOrDeletePost(post, session);
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const update: any = {};

  if (typeof body.caption === 'string') update.caption = body.caption;
  if (typeof body.viewable === 'boolean') update.viewable = body.viewable;
  if (Array.isArray(body.likes)) update.likes = body.likes;

  let updatedPost;
  if (body.comment) {
    updatedPost = await Post.findByIdAndUpdate(
      post.id,
      { $push: { comments: body.comment }, ...(Object.keys(update).length > 0 ? update : {}) },
      { new: true }
    );
  } else if (Object.keys(update).length > 0) {
    updatedPost = await Post.findByIdAndUpdate(post.id, update, { new: true });
  } else {
    return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
  }

  return NextResponse.json({ post: updatedPost });
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const post = await Post.findById(context.params.id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const allowed = await canEditOrDeletePost(post, session);
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await Post.findByIdAndDelete(post.id);

  return NextResponse.json({ message: 'Post deleted successfully' });
}

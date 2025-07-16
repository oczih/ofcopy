import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Post from '@/app/models/postmodel';
import Creator from '@/app/models/creatormodel';

export async function GET(req: NextRequest) {
  await connectDB();
  const username = req.nextUrl.searchParams.get('username');
  if (!username) {
    return NextResponse.json({ error: 'Missing username parameter' }, { status: 400 });
  }
  const creator = await Creator.findOne({ username }).populate('posts');
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }
  // Return posts in reverse chronological order
  const posts = (creator.posts || []).slice().reverse();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { s3Key, caption, creatorId, type } = await req.json();
  if (!s3Key || !caption || !creatorId || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  // Create the post
  const post = await Post.create({
    creator: creatorId,
    s3Key,
    type,
    caption,
    createdAt: new Date(),
  });
  // Add post to creator's posts array
  await Creator.findByIdAndUpdate(creatorId, { $push: { posts: post._id } });
  return NextResponse.json({ post });
} 
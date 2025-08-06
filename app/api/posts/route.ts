import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
// Import WalkRoute first to ensure it's registered
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Creator from '@/app/models/creatormodel';
import Post from '@/app/models/postmodel';
import { auth } from '@/lib/auth-client';
export async function GET() {
  await connectDB();
  
  try {
    // tee tähän populate
    const posts = await Post.find({})
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

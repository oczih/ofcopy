import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
// Import WalkRoute first to ensure it's registered
import Post from '@/app/models/postmodel';

import { verifySystemAccess } from '@/lib/auth';
export async function GET(request: NextRequest) {
  try {
    verifySystemAccess(request);
    // tee tähän populate
    await connectDB();
    const posts = await Post.find({})
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
  }
}

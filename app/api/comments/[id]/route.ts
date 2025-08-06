import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Post from '@/app/models/postmodel';
import mongoose from 'mongoose';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  
  await connectDB();
  const params = await context.params;
  const commentId = params.id;

  if (!commentId || typeof commentId !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid commentId' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { postId } = body;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Missing or invalid postId' }, { status: 400 });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

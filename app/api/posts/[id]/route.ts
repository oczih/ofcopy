import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Post from '@/app/models/postmodel';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();
  try {
    let update: any = {};
    if (typeof body.likes === 'number') {
      update.likes = body.likes;
    }
    let updatedPost;
    if (body.comment) {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $push: { comments: body.comment }, ...(update.likes !== undefined ? { likes: update.likes } : {}) },
        { new: true }
      );
    } else if (update.likes !== undefined) {
      updatedPost = await Post.findByIdAndUpdate(id, { likes: update.likes }, { new: true });
    } else {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }
    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

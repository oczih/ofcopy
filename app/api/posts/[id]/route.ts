import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Post from '@/app/models/postmodel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-client';


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
if (!session || session.user.email !== process.env.SECEMAIL) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
  await connectDB();
  const { id } = params;
  const body = await req.json();

  try {
    let update: any = {};

    // Add support for caption and viewable
    if (typeof body.caption === 'string') {
      update.caption = body.caption;
    }
    if (typeof body.viewable === 'string') {
      update.viewable = body.viewable;
    }
    if (typeof body.likes === 'number') {
      update.likes = body.likes;
    }

    // Handle comment push separately
    let updatedPost;
    if (body.comment) {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $push: { comments: body.comment },
          ...(Object.keys(update).length > 0 ? update : {}),
        },
        { new: true }
      );
    } else if (Object.keys(update).length > 0) {
      updatedPost = await Post.findByIdAndUpdate(id, update, { new: true });
    } else {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
if (!session || session.user.email !== process.env.SECEMAIL) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
  await connectDB();
  const { id } = params;

  try {
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Post deleted successfully', post: deletedPost });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

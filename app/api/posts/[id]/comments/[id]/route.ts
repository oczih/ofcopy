import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Comment from '@/app/models/postmodel';


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
    const { id } = params;
  
    try {
      const deletedComment = await Comment.findByIdAndDelete(id);
      if (!deletedComment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Post deleted successfully', comment: deletedComment });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
  }
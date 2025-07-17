import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

import { connectDB } from '@/lib/mongoose';
import Creator from '@/app/models/creatormodel';

export async function GET(request: NextRequest) {
  await connectDB();
  console.log("req url:",request.url)
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      }

      const creator = await Creator.findOne({}).populate('posts');
      

      if (!creator) {
        return NextResponse.json({ error: 'Creator not found for user' }, { status: 404 });
      }

      return NextResponse.json({ creator });
    } else {
      const creators = await Creator.find({}).populate('posts');
      return NextResponse.json({ creators });
    }
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

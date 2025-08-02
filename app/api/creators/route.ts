import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongoose';
import Creator from '@/app/models/creatormodel';


export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      }

      const creator = await Creator.findOne({ _id: userId }).populate('posts');

      console.log("Creator", creator)

      if (!creator) {
        return NextResponse.json({ error: 'Creator not found for user' }, { status: 404 });
      }

      return NextResponse.json({ creator });
    } else {
      const creators = await Creator.find({}).populate('posts');
        console.log("Creators:", creators) 

      return NextResponse.json({ creators });
    }
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

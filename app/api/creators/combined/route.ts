import { NextResponse } from 'next/server';
import { getAllCreators } from '@/lib/creatorService';
import { getNonPublicCreatorsByUserId } from '@/lib/creatorService';
import { getServerSession } from 'next-auth/next'; // or your auth method
import { authOptions } from '@/lib/auth-client';
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all public creators (public only)
    const publicCreators = await getAllCreators(true); // fullFields = true
    const nonPublicCreators = await getNonPublicCreatorsByUserId(session.user._id, true);
    const combinedCreators = [...publicCreators, ...nonPublicCreators];

    return NextResponse.json({ creators: combinedCreators });
  } catch (error) {
    console.error('Error fetching combined creators:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import CreatorApplication from '@/app/models/creatorapplicationmodel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-client';
import { verifySystemAccess } from '@/lib/auth';
export const config = {
  api: {
    bodyParser: false, // Important: disable Next.js default parser
  },
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  try {
    const data = await req.json(); // <-- Expect JSON from frontend
    const {
      country,
      gender,
      handle,
      email,
      username,
      user,
      displayName,
      bio,
      subscriptionPrice,
      birthDate,
      fullLegalName,
      profilePic,
      idFrontPhoto,
      idBackPhoto,
      selfieWithId,
    } = data;

    // Check required S3 keys
    if (!profilePic?.s3Key || !idFrontPhoto?.s3Key || !idBackPhoto?.s3Key || !selfieWithId?.s3Key) {
      return NextResponse.json({ error: 'Missing required file data' }, { status: 400 });
    }
    if (!profilePic?.s3Key?.key || !idFrontPhoto?.s3Key?.key || !idBackPhoto?.s3Key?.key || !selfieWithId?.s3Key?.key) {
      return NextResponse.json({ error: 'Missing required file keys' }, { status: 400 });
    }
    const application = await CreatorApplication.create({
      country,
      gender,
      handle,
      displayName,
      bio,
      email,
      username,
      user,
      status: 'pending',
      subscriptionPrice,
      birthDate,
      fullLegalName,
    
      profilePic: profilePic?.s3Key?.key,
      idFrontPhoto: idFrontPhoto?.s3Key?.key,
      idBackPhoto: idBackPhoto?.s3Key?.key,
      selfieWithId: selfieWithId?.s3Key?.key,
    });

    return NextResponse.json({ message: 'Application submitted', application }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    verifySystemAccess(req);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query: Partial<{ status: string }> = {};
    if (status && status !== "all") query.status = status;

    const applications = await CreatorApplication.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ applications });
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
  }
}

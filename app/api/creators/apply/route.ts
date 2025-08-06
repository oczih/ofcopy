import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { CreatorApplication } from '@/app/models/creatormodel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-client';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const {
      country, gender, profilePic, handle, displayName, bio,
      subscriptionPrice, idFrontPhoto, idBackPhoto,
      selfieWithId, birthDate, fullLegalName
    } = await req.json();

    if (!handle || !displayName || !bio) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const application = await CreatorApplication.create({
      country, gender, profilePic, handle, displayName, bio,
      subscriptionPrice, idFrontPhoto, idBackPhoto,
      selfieWithId, birthDate, fullLegalName
    });

    return NextResponse.json({ message: 'Application submitted', application }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const query: any = {};
    if (status && status !== "all") query.status = status;

    const applications = await CreatorApplication.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ applications });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

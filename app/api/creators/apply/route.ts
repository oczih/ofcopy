import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { CreatorApplication } from '@/app/models/creatormodel';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, displayName, bio, socialLinks, email, user } = await req.json();
    if (!username || !displayName || !bio || !email || !user) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const application = await CreatorApplication.create({
      username,
      displayName,
      bio,
      socialLinks,
      email,
      user
    });
    return NextResponse.json({ message: 'Application submitted', application }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    let query = {};
    if (status) query = { status };
    const applications = await CreatorApplication.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ applications });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-client';
import { connectDB } from '@/lib/mongoose';
import Creator from '@/app/models/creatormodel';
import OFUser from '@/app/models/usermodel';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
  } catch (error) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if already a creator
  const existingCreator = await Creator.findOne({ email: session.user.email });
  if (existingCreator) {
    return NextResponse.json({ message: 'Already a creator', creator: existingCreator }, { status: 200 });
  }

  // Get user info
  const user = await OFUser.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Create new creator profile
  const newCreator = new Creator({
    name: user.name,
    username: user.username,
    email: user.email,
    password: user.password,
    googleId: user.googleId,
    image: user.image,
    oauthProvider: user.oauthProvider,
    oauthId: user.oauthId,
    lastUsernameChange: user.lastUsernameChange,
    subscribers: 0,
    price: 9.99,
    category: 'General',
  });
  await newCreator.save();

  return NextResponse.json({ message: 'Upgraded to creator', creator: newCreator }, { status: 201 });
} 
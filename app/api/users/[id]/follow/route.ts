import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import User from '@/app/models/usermodel';
import { auth } from '@/lib/auth-client';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, context: unknown) {
  // Cast context as unknown then extract params carefully
  // OR just treat as any but keep the cast local and limited
  const { params } = context as { params: { id: string } };
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const loggedInUserId = session.user?.id;
  const targetUserId = params.id;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return NextResponse.json({ message: 'Invalid target user ID' }, { status: 400 });
  }

  if (loggedInUserId === targetUserId) {
    return NextResponse.json({ message: 'You cannot follow yourself' }, { status: 400 });
  }

  await connectDB();

  try {
    const targetUser = await User.findById(targetUserId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!targetUser || !loggedInUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const alreadyFollowing = loggedInUser.following.some((followingId: string) => followingId.toString() === targetUserId);
    
    if (alreadyFollowing) {
      return NextResponse.json({ message: 'Already following this user' }, { status: 400 });
    }

    // Add targetUser to loggedInUser's following list
    loggedInUser.following.push(targetUser._id);

    // Add loggedInUser to targetUser's followers list
    targetUser.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await targetUser.save();

    return NextResponse.json({ message: `You are now following ${targetUser.username}` });

  } catch (error) {
    console.error('Error in follow endpoint:', error);
    return NextResponse.json({ message: 'Failed to follow user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: unknown) {
  // Cast context as unknown then extract params carefully
  // OR just treat as any but keep the cast local and limited
  const { params } = context as { params: { id: string } };
  // Unfollow logic: Remove follower/following relationship

  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const loggedInUserId = session.user?.id;
  const targetUserId = params.id;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return NextResponse.json({ message: 'Invalid target user ID' }, { status: 400 });
  }

  if (loggedInUserId === targetUserId) {
    return NextResponse.json({ message: 'You cannot unfollow yourself' }, { status: 400 });
  }

  await connectDB();

  try {
    const targetUser = await User.findById(targetUserId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!targetUser || !loggedInUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Remove targetUser from loggedInUser's following list
    loggedInUser.following = loggedInUser.following.filter(
      (id: string) => id.toString() !== targetUserId
    );

    // Remove loggedInUser from targetUser's followers list
    targetUser.followers = targetUser.followers.filter(
      (id: string) => id.toString() !== loggedInUserId
    );

    await loggedInUser.save();
    await targetUser.save();

    return NextResponse.json({ message: `You have unfollowed ${targetUser.username}` });

  } catch (error) {
    console.error('Error in unfollow endpoint:', error);
    return NextResponse.json({ message: 'Failed to unfollow user' }, { status: 500 });
  }
}

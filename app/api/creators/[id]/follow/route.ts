import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from '@/lib/mongoose';
import UserModel from '@/app/models/usermodel'
import Creator from '@/app/models/creatormodel';
import { Follower, Following } from '@/app/types';

export async function POST(request: NextRequest, context: any) {
  // Cast context as unknown then extract params carefully
  // OR just treat as any but keep the cast local and limited
  const params = await context.params;
  const creatorId = params.id;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await UserModel.findById(session.user.id);
  const creator = await Creator.findById(creatorId);

  if (!user || !creator) {
    return NextResponse.json({ message: "User or Creator not found" }, { status: 404 });
  }

  // Check if user already follows creator
  if (user.following.some((f: Following) => f.creatorId.toString() === creatorId)) {
    return NextResponse.json({ message: "Already following" }, { status: 400 });
  }

  // Add creator to user's following
  user.following.push({
    creatorId,
    creatorName: creator.name,
    creatorUsername: creator.username,
    creatorImage: creator.image || '',
    followingDate: new Date(),
  });

  // Add user to creator's followers
  creator.followers.push({
    userId: user.id,
    username: user.username,
    userImage: user.image || '',
    followingDate: new Date(),
  });

  await user.save();
  await creator.save();

  return NextResponse.json({ message: "Followed creator" });
}

export async function DELETE(request: NextRequest, context: any) {
  // Cast context as unknown then extract params carefully
  // OR just treat as any but keep the cast local and limited
  const params = await context.params;
  const creatorId = params.id;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await UserModel.findById(session.user.id);
  const creator = await Creator.findById(creatorId);

  if (!user || !creator) {
    return NextResponse.json({ message: "User or Creator not found" }, { status: 404 });
  }

  // Remove creator from user's following list
  user.following = user.following.filter((f: Following) => f.creatorId.toString() !== creatorId);

  // Remove user from creator's followers list
  creator.followers = creator.followers.filter((f: Follower) => f.userId.toString() !== user.id);

  await user.save();
  await creator.save();

  return NextResponse.json({ message: "Unfollowed creator" });
}
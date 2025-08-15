import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from '@/lib/mongoose';
import UserModel from '@/app/models/usermodel'
import Creator from '@/app/models/creatormodel';
import { Follower, Following } from '@/app/types';
interface Params {
  id: string;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id: creatorId } = await context.params;

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await UserModel.findById(session.user._id);
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
interface Params {
  id: string;
}
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id: creatorId } = await context.params;


  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await UserModel.findById(session.user._id);
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
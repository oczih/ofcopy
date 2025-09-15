import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongoose';
import WalkUser from '@/app/models/usermodel';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import OFUser from '@/app/models/usermodel';
import { verifySystemAccess } from '@/lib/auth';
import Creator from '@/app/models/creatormodel';

export async function GET(request: NextRequest, context: unknown) {
  // Cast context as unknown then extract params carefully
  // OR just treat as any but keep the cast local and limited
  const { params } = context as { params: { id: string } };

  try {
    await connectDB();

  } catch (error) {
    console.error("[API] Database connection failed:", error);
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
  }
  
  // Use NextAuth v5 auth function
  const session = await getServerSession(authOptions);

  
  if (!session) {

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
  }

  const { id } = await params;



  if (session?.user?._id !== id) {

    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (!id || id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Valid MongoDB ObjectId is required' }, { status: 400 });
  }

  try {
    //populate
    verifySystemAccess(request)
    const user = await OFUser.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch{
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
  }
}
  
export async function PUT(request: NextRequest, context: unknown) {
  // Cast context as unknown then extract params carefully
  // OR just treat as any but keep the cast local and limited
  const { params } = context as { params: { id: string } };
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await connectDB();

  const body = await request.json();
  const { name, username, password, email, age, following, avatar, bio } = body;

  // ---------- Try updating as a User ----------
  const user = await OFUser.findById(id);
  if (user) {
    if (user._id.toString() !== session.user._id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Username change restriction
    if (username && username !== user.username) {
      const lastChange = user.lastUsernameChange || new Date(0);
      const now = new Date();
      const diffMs = now.getTime() - lastChange.getTime();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

      if (diffMs < SEVEN_DAYS) {
        return NextResponse.json(
          { error: "Username can only be changed once every 7 days." },
          { status: 403 }
        );
      }
      user.username = username;
      user.lastUsernameChange = now;
    }

    if (name !== undefined) user.name = name;
    if (password !== undefined) user.password = password;
    if (email !== undefined) user.email = email;
    if (age !== undefined) user.age = age;
    if (avatar !== undefined) user.avatar = avatar;
    if (following !== undefined) user.following = following;

    await user.save();
    return NextResponse.json({ user });
  }

  // ---------- Otherwise, update as a Creator ----------
  const creator = await Creator.findById(id);
  if (!creator) {
    return NextResponse.json(
      { error: "No User or Creator found" },
      { status: 404 }
    );
  }

  if (creator.user.toString() !== session.user._id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Username change restriction
  if (username && username !== creator.username) {
    const lastChange = creator.lastUsernameChange || new Date(0);
    const now = new Date();
    const diffMs = now.getTime() - lastChange.getTime();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    if (diffMs < SEVEN_DAYS) {
      return NextResponse.json({
        error: "Creator username can only be changed once every 7 days."
      }, { status: 403 });
    }

    creator.username = username;
    creator.lastUsernameChange = now;
  }

  // Update other fields once
  if (name !== undefined) creator.name = name;
  if (avatar !== undefined) creator.avatar = avatar;
  if (bio !== undefined) creator.bio = bio;
  // add other creator-specific fields here

  await creator.save();
  return NextResponse.json({ creator });
}


export async function DELETE(request: NextRequest, context: unknown) {
  // Cast context as unknown then extract params carefully
  // OR just treat as any but keep the cast local and limited
  const { params } = context as { params: { id: string } };
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    if (session.user?._id !== id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    await connectDB();
  
    try {
      const user = await WalkUser.findByIdAndDelete(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  }
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongoose';
import WalkUser from '@/app/models/usermodel';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import OFUser from '@/app/models/usermodel';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log("[API] GET /api/users/[id] - Starting request");
  
  try {
    await connectDB();
    console.log("[API] Database connected successfully");
  } catch (error) {
    console.error("[API] Database connection failed:", error);
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
  }
  
  // Use NextAuth v5 auth function
  const session = await getServerSession(authOptions);
  console.log("[API] Session from auth():", !!session);
  console.log("[API] Session user ID:", session?.user?.id);
  
  if (!session) {
    console.log("[API] No session found - Unauthorized");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  console.log("[API] Requested user ID:", id);

  console.log("[API] Session user ID:", session?.user?.id, "Requested ID:", id);
  if (session?.user?.id !== id) {
    console.log("[API] Session user ID mismatch - Forbidden");
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (!id || id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Valid MongoDB ObjectId is required' }, { status: 400 });
  }

  try {
    //populate
    const user = await OFUser.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
  
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Extract and validate user ID
  const { id } = await params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }
  console.log("Session user ID:", session.user?.id);
  console.log("Request param ID:", id);
  // Prevent users from updating other users
  if (session.user?.id !== id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
  } catch (err) {
    console.error("[PUT] DB connection failed:", err);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const {
      name,
      username,
      password,
      email,
      age,
      following // Accept following updates from client
    } = body;

    const user = await OFUser.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Username change restriction (only once every 7 days)
    if (username && username !== user.username) {
      const lastChange = user.lastUsernameChange || new Date(0);
      const now = new Date();
      const diffMs = now.getTime() - lastChange.getTime();
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

      if (diffMs < SEVEN_DAYS) {
        return NextResponse.json({
          error: 'Username can only be changed once every 7 days.',
        }, { status: 403 });
      }

      user.username = username;
      user.lastUsernameChange = now;
    }

    // Update other fields conditionally
    if (name !== undefined) user.name = name;
    if (password !== undefined) user.password = password;
    if (email !== undefined) user.email = email;
    if (age !== undefined) user.age = age;

    // Update following array if provided
    if (following !== undefined) {
      user.following = following;
    }

    // Save and return updated user
    try {
      await user.save();
    } catch (err: any) {
      console.error("Mongoose validation failed:", err.message, err.errors);
      return NextResponse.json({ error: 'Validation failed', details: err.message }, { status: 500 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

  export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (session.user?.id !== id) {
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
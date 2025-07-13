import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongoose';
import WalkUser from '@/app/models/usermodel';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mongoose from 'mongoose';
import { auth } from '@/lib/auth-client';
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
  const session = await auth();
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (session.user?.id !== id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  
    try {
      const body = await request.json();
      const {
        name, username, password, email,
        age,
      } = body;
  
      const user = await OFUser.findById(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      // Check if trying to change the username
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
  
      // Update the rest of the fields
      if (name !== undefined) user.name = name;
      if (password !== undefined) user.password = password;
      if (email !== undefined) user.email = email;
      if (age !== undefined) user.age = age;
  
      await user.save();
  
      return NextResponse.json({ user });
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
  }
  

  export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
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
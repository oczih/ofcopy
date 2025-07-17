
import Creator from "@/app/models/creatormodel";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-client';
import { connectDB } from '../../../../lib/mongoose';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    console.log("[API] GET /api/users/[id] - Starting request");
    
    try {
      await connectDB();
      console.log("[API] Database connected successfully");
    } catch (error) {
      console.error("[API] Database connection failed:", error);
      return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
    }
    
    // Use NextAuth v5 getServerSession function
    const session = await getServerSession(authOptions);
    console.log("[API] Session from auth():", !!session);
    console.log("[API] Session user ID:", session?.user?.id);
    
    if (!session) {
      console.log("[API] No session found - Unauthorized");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    let creator;
    try {
      if (userId) {
        // Find creator by user field
        creator = await Creator.findOne({ user: userId }).populate('posts');
        if (!creator) {
          return NextResponse.json({ error: 'Creator not found for user' }, { status: 404 });
        }
      } else {
        // Find creator by creator id
        if (!id || id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
          return NextResponse.json({ error: 'Valid MongoDB ObjectId is required' }, { status: 400 });
        }
        creator = await Creator.findById(id).populate('posts');
        if (!creator) {
          return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }
      }
      return NextResponse.json({ user: creator });
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
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
  
      const user = await Creator.findById(id);
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
      console.error('Error updating creator:', error);
      return NextResponse.json({ error: 'Failed to update creator' }, { status: 500 });
    }
  }

export async function POST(request: NextRequest) {
  try {
    await connectDB();
  } catch (error) {
    console.error("[API] Database connection failed:", error);
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, username, password, email, age } = body;

    // Basic validation
    if (!name || !username || !password || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for existing username/email
    const existingUser = await Creator.findOne({ $or: [ { username }, { email } ] });
    if (existingUser) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
    }

    const newUser = new Creator({
      name,
      username,
      password,
      email,
      age,
      lastUsernameChange: new Date(0), // Set to epoch for new users
    });

    await newUser.save();
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating creator:', error);
    return NextResponse.json({ error: 'Failed to create creator' }, { status: 500 });
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
      const user = await Creator.findByIdAndDelete(id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  }
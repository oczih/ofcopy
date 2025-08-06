
import Creator from "@/app/models/creatormodel";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-client';
import { connectDB } from '../../../../lib/mongoose';
import mongoose from 'mongoose';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Post } from "@/app/types";

const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log("[API] GET /api/creators/[id] - Starting request");

  try {
    await connectDB();
    console.log("[API] Database connected successfully");
  } catch (error) {
    console.error("[API] Database connection failed:", error);
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const userId = new URL(request.url).searchParams.get('userId');

  try {
    let creator;

    if (userId) {
      creator = await Creator.findOne({ user: userId }).populate('posts');
    } else {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Valid MongoDB ObjectId is required' }, { status: 400 });
      }
      creator = await Creator.findById(id).populate('posts');
    }

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json({ creator });
  } catch (error) {
    console.error('Error fetching creator:', error);
    return NextResponse.json({ error: 'Failed to fetch creator' }, { status: 500 });
  }
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    const { id } = await params;
    console.log("sessariL:", session.user)
    console.log("iidee:", id)
    try {
      const body = await request.json();
      const {
        name, username, password, email,
        age, image, gender
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
      if (image !== undefined) user.image = image;
      if (gender !== undefined) user.gender = gender;
      await user.save();
  
      return NextResponse.json({ user });
    } catch (error) {
      console.error('Error updating creator:', error instanceof Error ? error.stack : error);
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
    const { name, username, password, email, age, image } = body;

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
      image,
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
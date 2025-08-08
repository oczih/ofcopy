import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Post from "@/app/models/postmodel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";

export async function GET(request: NextRequest) {
    if(!request) return;
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userEmail = session.user.email;

    // Find creator's posts including restricted ones for followers/subs
    const posts = await Post.find({ creatorEmail: userEmail });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

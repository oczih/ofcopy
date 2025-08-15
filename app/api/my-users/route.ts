import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-client";
import OFUser, { OFUserDocument } from "@/app/models/usermodel";
import mongoose from "mongoose";

async function getCurrentUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) return null;
  return session.user._id;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
    }

    await connectDB();
    const user = await OFUser.findById(userId).lean();
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching my user:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
  }
}


export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const allowedUpdates = ["username", "bio", "avatarKey"] as const;
    type AllowedUpdateFields = typeof allowedUpdates[number];

    type AllowedUpdatesType = Pick<OFUserDocument, AllowedUpdateFields>;

    const updates: Partial<AllowedUpdatesType> = {};
    for (const field of allowedUpdates) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedUser = await OFUser.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating my user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function DELETE() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await connectDB();
    await OFUser.findByIdAndDelete(userId);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting my user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

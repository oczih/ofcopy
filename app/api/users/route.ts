// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-client";
import { getAllUsers } from "@/lib/userService";
import OFUser from "@/app/models/usermodel";
import mongoose from "mongoose";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    throw new Error("Unauthorized");
  }
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();    
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await request.json();
    const user = new OFUser(body);
    const savedUser = await user.save();
    return NextResponse.json({ user: savedUser }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const url = new URL(request.url);
    const userId = url.searchParams.get("id");
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const body = await request.json();
    const updatedUser = await OFUser.findByIdAndUpdate(userId, body, { new: true });
    return NextResponse.json({ user: updatedUser });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const url = new URL(request.url);
    const userId = url.searchParams.get("id");
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await OFUser.findByIdAndDelete(userId);
    return NextResponse.json({ message: "User deleted" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

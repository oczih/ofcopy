

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from '@/lib/mongoose';
import OFUser, { VerificationToken } from "@/app/models/usermodel";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
    }

    await connectDB();

    const storedToken = await VerificationToken.findOne({ token, type: "password_reset" });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const user = await OFUser.findOne({ email: storedToken.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    await VerificationToken.deleteOne({ _id: storedToken._id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

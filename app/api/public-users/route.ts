// app/api/public-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getPublicUsers } from "@/lib/userService";
import { verifySystemAccess } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    verifySystemAccess(request);
    const users = await getPublicUsers();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
  }
}

// app/api/public-users/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getPublicUsers } from "@/lib/userService";

export async function GET() {
  try {
    await connectDB();
    const users = await getPublicUsers();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

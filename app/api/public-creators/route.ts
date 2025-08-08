import { NextResponse } from "next/server";
import { getAllCreators } from "@/lib/creatorService";

export async function GET() {
  try {
    const creators = await getAllCreators(false);
    return NextResponse.json({ creators });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

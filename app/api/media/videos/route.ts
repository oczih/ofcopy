
import { NextRequest, NextResponse } from "next/server";

export const config = { api: { bodyParser: false } };



export async function POST(req: NextRequest) {
  try {
    console.log(req)
    return NextResponse.json({ message: "Video compression started" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Video compression failed" }, { status: 500 });
  }
};
 
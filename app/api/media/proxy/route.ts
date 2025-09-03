import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // optional, for edge functions

export async function POST(req: NextRequest) {
  try {
    const { s3Key } = await req.json();
    if (!s3Key) return NextResponse.json({ error: "Missing s3Key" }, { status: 400 });

    const response = await fetch(s3Key); // fetch the CloudFront URL
    const blob = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    return new Response(blob, {
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
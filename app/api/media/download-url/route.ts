  import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
  import { NextRequest, NextResponse } from "next/server";

  const urlCache: Record<string, { url: string; expiresAt: number }> = {};

export async function POST(req: NextRequest) {


  try {
    const body = await req.json();
    const { s3Key } = body;

    if (!s3Key) {
      return NextResponse.json({ error: "Missing s3Key" }, { status: 400 });
    }

    const cleanedKey = s3Key.toString().replace(/^\/+/, "");
    const cfDomain = process.env.CF_DOMAIN?.replace(/\/$/, "");
    if (!cfDomain) {
      return NextResponse.json({ error: "CF_DOMAIN not configured" }, { status: 500 });
    }
    // ✅ Check cache first
    const cached = urlCache[cleanedKey];
    if (cached && cached.expiresAt > Date.now()) {

      return NextResponse.json({
        downloadUrl: cached.url,
        expiresAt: new Date(cached.expiresAt).toISOString(),
        cached: true,
      });
    }

    // ✅ Generate new signed URL if no valid cache
    const privateKey = process.env.CF_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!privateKey || !process.env.CF_KEY_PAIR_ID) {
      return NextResponse.json({ error: "CloudFront signing not configured" }, { status: 500 });
    }

    const fullUrl = `${cfDomain}/${cleanedKey}`;
    const expirationTime = new Date(Date.now() + 3600 * 1000); // 1 hour
    const signedUrl = getSignedUrl({
      url: fullUrl,
      keyPairId: process.env.CF_KEY_PAIR_ID,
      privateKey,
      dateLessThan: expirationTime,
    });

    // ✅ Save in cache
    urlCache[cleanedKey] = {
      url: signedUrl,
      expiresAt: expirationTime.getTime(),
    };

    return NextResponse.json({
      downloadUrl: signedUrl,
      expiresAt: expirationTime.toISOString(),
      cached: false,
    });

  } catch (error) {
    console.error("Error in download-url API:", error);
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "download-url",
    cacheSize: Object.keys(urlCache).length,
  });
}
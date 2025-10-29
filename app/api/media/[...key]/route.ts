import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const urlCache: Record<string, { url: string; expiresAt: number }> = {};

export async function GET(req: NextRequest, { params }: { params: { key: string[] } }) {
  try {
    // 1️⃣ Get the requested S3/CloudFront key
    const key = await params.key.join("/");
    const cleanedKey = key.replace(/^\/+/, "");
    const now = Date.now();

    // 2️⃣ Check cache first
    const cached = urlCache[cleanedKey];
    if (cached && cached.expiresAt > now) {
      return NextResponse.redirect(cached.url, 302);
    }

    // 3️⃣ Load CloudFront config
    const cfDomain = process.env.CF_DOMAIN?.replace(/\/$/, "");
    const privateKey = process.env.CF_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const keyPairId = process.env.CF_KEY_PAIR_ID;

    if (!cfDomain || !privateKey || !keyPairId) {
      console.error("❌ CloudFront not configured");
      return NextResponse.json({ error: "CloudFront not configured" }, { status: 500 });
    }

    // 4️⃣ Sign the URL
    const expiresAt = new Date(now + CACHE_TTL);
    const fullUrl = `${cfDomain}/${cleanedKey}`;
    const signedUrl = getSignedUrl({
      url: fullUrl,
      keyPairId,
      privateKey,
      dateLessThan: expiresAt,
    });

    // 5️⃣ Cache and redirect
    urlCache[cleanedKey] = { url: signedUrl, expiresAt: expiresAt.getTime() };
    return NextResponse.redirect(signedUrl, 302);
  } catch (err) {
    console.error("Error signing media URL:", err);
    return NextResponse.json({ error: "Failed to sign media" }, { status: 500 });
  }
}

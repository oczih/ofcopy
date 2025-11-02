import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const CACHE_TTL = 60 * 60 * 1000;
const urlCache: Record<string, { url: string; expiresAt: number }> = {};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> } // ✅ only params is Promise
) {
  const { key } = await context.params; // ✅ correct await location
  try {
    const cleanedKey = key.join("/").replace(/^\/+/, "");
    const now = Date.now();

    const cached = urlCache[cleanedKey];
    if (cached && cached.expiresAt > now) {
      return NextResponse.redirect(cached.url, 302);
    }

    const cfDomain = process.env.CF_DOMAIN?.replace(/\/$/, "");
    const privateKey = process.env.CF_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const keyPairId = process.env.CF_KEY_PAIR_ID;

    if (!cfDomain || !privateKey || !keyPairId) {
      console.error("❌ CloudFront not configured");
      return NextResponse.json({ error: "CloudFront not configured" }, { status: 500 });
    }

    const expiresAt = new Date(now + CACHE_TTL);
    const fullUrl = `${cfDomain}/${cleanedKey}`;
    const signedUrl = getSignedUrl({
      url: fullUrl,
      keyPairId,
      privateKey,
      dateLessThan: expiresAt,
    });

    urlCache[cleanedKey] = { url: signedUrl, expiresAt: expiresAt.getTime() };
    return NextResponse.redirect(signedUrl, 302);
  } catch (err) {
    console.error("Error signing media URL:", err);
    return NextResponse.json({ error: "Failed to sign media" }, { status: 500 });
  }
}

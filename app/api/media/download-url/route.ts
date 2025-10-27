import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { NextRequest, NextResponse } from "next/server";

// In-memory cache with cleanup
const urlCache: Record<string, { url: string; expiresAt: number }> = {};
const CACHE_CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
const CACHE_TTL = 3600 * 1000; // 1 hour TTL for signed URLs

// Helper: Signs one key
function signUrl(cfDomain: string, keyPairId: string, privateKey: string, key: string) {
  const cleanedKey = key.replace(/^\/+/, "");
  const fullUrl = `${cfDomain}/${cleanedKey}`;
  const expirationTime = new Date(Date.now() + CACHE_TTL);
  const signedUrl = getSignedUrl({
    url: fullUrl,
    keyPairId,
    privateKey,
    dateLessThan: expirationTime,
  });

  // Cache result
  urlCache[cleanedKey] = {
    url: signedUrl,
    expiresAt: expirationTime.getTime(),
  };

  return { key: cleanedKey, url: signedUrl, expiresAt: expirationTime };
}

// Periodic cache cleanup
function cleanupCache() {
  const now = Date.now();
  for (const key of Object.keys(urlCache)) {
    if (urlCache[key].expiresAt <= now) {
      delete urlCache[key];
    }
  }
}

// Run cleanup periodically
setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL);

// POST: Batch or single signing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Normalize input to an array and deduplicate
    const keys: string[] = Array.from(
      new Set(
        Array.isArray(body.s3Keys)
          ? body.s3Keys
          : typeof body.s3Key === "string"
          ? [body.s3Key]
          : []
      )
    );

    if (keys.length === 0) {
      return NextResponse.json({ error: "Missing s3Key or s3Keys" }, { status: 400 });
    }

    const cfDomain = process.env.CF_DOMAIN?.replace(/\/$/, "");
    const privateKey = process.env.CF_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const keyPairId = process.env.CF_KEY_PAIR_ID;

    if (!cfDomain || !privateKey || !keyPairId) {
      console.error("CloudFront configuration missing", {
        cfDomain: !!cfDomain,
        privateKey: !!privateKey,
        keyPairId: !!keyPairId,
      });
      return NextResponse.json({ error: "CloudFront not configured" }, { status: 500 });
    }

    const now = Date.now();
    const results: Record<
      string,
      { downloadUrl: string; expiresAt: string; cached: boolean }
    > = {};

    // Process only uncached or expired keys
    const keysToSign = keys.filter(
      key => !key || typeof key !== "string" || !urlCache[key.replace(/^\/+/, "")] || urlCache[key.replace(/^\/+/, "")].expiresAt <= now
    );

    for (const key of keys) {
      if (!key || typeof key !== "string") continue;

      const cleanedKey = key.replace(/^\/+/, "");
      const cached = urlCache[cleanedKey];

      if (cached && cached.expiresAt > now) {
        results[cleanedKey] = {
          downloadUrl: cached.url,
          expiresAt: new Date(cached.expiresAt).toISOString(),
          cached: true,
        };
        continue;
      }

      if (keysToSign.includes(key)) {
        const { url, expiresAt } = signUrl(cfDomain, keyPairId, privateKey, cleanedKey);
        results[cleanedKey] = {
          downloadUrl: url,
          expiresAt: expiresAt.toISOString(),
          cached: false,
        };
      }
    }

    // Standardized response for both single and batch requests
    return NextResponse.json({
      urls: results,
      count: Object.keys(results).length,
      cacheSize: Object.keys(urlCache).length,
    });
  } catch (err) {
    console.error("Error in /api/media/download-url:", err);
    return NextResponse.json({ error: "Failed to generate signed URLs" }, { status: 500 });
  }
}

// GET: Health check
export async function GET() {
  cleanupCache(); // Clean cache on health check
  return NextResponse.json({
    status: "ok",
    service: "download-url",
    cacheSize: Object.keys(urlCache).length,
  });
}
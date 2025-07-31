
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const { s3Key } = await req.json();

    if (!s3Key) {
      return NextResponse.json({ error: "Missing s3Key" }, { status: 400 });
    }

    const signedUrl = getSignedUrl({
      url: `https://${process.env.CF_DOMAIN}/${s3Key}`,
      keyPairId: process.env.CF_KEY_PAIR_ID!,
      privateKey: process.env.CF_PRIVATE_KEY!,
      dateLessThan: Math.floor(Date.now() / 1000) + 300, // Expires in 5 minutes
    });

    return NextResponse.json({ downloadUrl: signedUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
}

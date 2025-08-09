
import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-client";


export async function GET(req: NextRequest) {
  if(!req) return;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


}


export async function POST(req: NextRequest) {
  const { s3Key } = await req.json();


  const signedUrl = getCloudFrontSignedUrl({
    url: `${process.env.CF_DOMAIN}/${s3Key}`,
    keyPairId: process.env.CF_KEY_PAIR_ID!,
    privateKey: process.env.CF_PRIVATE_KEY!,
    dateLessThan: Math.floor(Date.now() / 1000) + 300,
  });

  return NextResponse.json({ url: signedUrl, key: s3Key });
} 
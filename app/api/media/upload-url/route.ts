import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { s3Key, contentType } = await req.json();

    if (!s3Key || !contentType) {
      return NextResponse.json({ error: "Missing s3Key or contentType" }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Return both uploadUrl and the key back
    return NextResponse.json({ uploadUrl, key: s3Key });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}


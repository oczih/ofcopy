import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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
    const { s3Key } = await req.json();

    if (!s3Key) {
      return NextResponse.json({ error: "Missing s3Key" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
}

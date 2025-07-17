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
    const { fileName, fileType } = await req.json();

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `uploads/${fileName}`,
      ContentType: fileType,
    });
    console.log(fileName)
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return NextResponse.json({ url, key: `uploads/${fileName}` });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}

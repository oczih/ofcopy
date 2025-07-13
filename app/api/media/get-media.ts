
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3 = new S3Client({ region: "us-east-1", credentials: { accessKeyId: process.env.AWS_ACCESS_KEY!, secretAccessKey: process.env.AWS_SECRET_KEY! } });

export default async function handler(req: NextRequest, res: NextResponse) {
  const { key } = req.query;

  // You should validate if the user has access to this content here.

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  res.status(200).json({ url: signedUrl });
}

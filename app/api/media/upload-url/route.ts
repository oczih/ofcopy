import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer";
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

    // Generate a presigned PUT URL to upload directly to S3
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 3600 });

    // Generate a signed CloudFront GET URL
    const fileUrl = `${process.env.CF_DOMAIN}/${s3Key}`;
    const signedDownloadUrl = getCloudFrontSignedUrl({
      url: fileUrl,
      dateLessThan: new Date(Date.now() + 3600 * 1000).toISOString(),
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });

    return NextResponse.json({
      uploadUrl,         // for uploading the file
      signedDownloadUrl, // for accessing it securely via CloudFront
      key: s3Key,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate URLs" }, { status: 500 });
  }
}

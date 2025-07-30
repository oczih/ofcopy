import creatorservice from "@/app/services/creatorservice";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-client";
import { Creator } from "@/app/types";
const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});



export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creators: Creator[] = await creatorservice.get();

  const creatorsWithSignedPosts = await Promise.all(
    creators.map(async (creator) => {
      if (!creator.posts || creator.posts.length === 0) return creator;

      const postsWithSignedUrls = await Promise.all(
        creator.posts.map(async (post) => {
          if (!post.s3Key) {
            console.warn(`Missing s3Key for post ID: ${post._id}`);
            return post;
          }

          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: post.s3Key,
          });

          const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

          return {
            ...post,
            signedUrl, // Add signed URL here
          };
        })
      );

      return {
        ...creator,
        posts: postsWithSignedUrls,
      };
    })
  );

  return NextResponse.json(creatorsWithSignedPosts);
}


export async function POST(req: NextRequest) {
  const { s3Key, fileType } = await req.json();

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: s3Key,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  return NextResponse.json({ url: signedUrl, key: s3Key });
}
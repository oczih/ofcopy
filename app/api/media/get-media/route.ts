import creatorservice from "@/app/services/creatorservice";
import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-client";
import { Creator } from "@/app/types";



export async function GET(req: NextRequest) {
  if(!req) return;
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

          const signedUrl = getSignedUrl({
            url: `${process.env.CF_DOMAIN}/${post.s3Key}`,
            dateLessThan: Math.floor(Date.now() / 1000) + 3600,
            keyPairId: process.env.CF_KEY_PAIR_ID!,
            privateKey: process.env.CF_PRIVATE_KEY!.replace(/\\n/g, '\n'),
          });

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
  const { s3Key } = await req.json();


  const signedUrl = getCloudFrontSignedUrl({
    url: `${process.env.CF_DOMAIN}/${s3Key}`,
    keyPairId: process.env.CF_KEY_PAIR_ID!,
    privateKey: process.env.CF_PRIVATE_KEY!,
    dateLessThan: Math.floor(Date.now() / 1000) + 300,
  });

  return NextResponse.json({ url: signedUrl, key: s3Key });
}
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongoose';
import Creator from '@/app/models/creatormodel';

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from '@/lib/s3Client'; // your configured S3 client
import { Post } from '@/app/types';
async function addSignedUrlsToPosts(posts: Post) {
  return Promise.all(posts.map(async (post: Post) => {  
    if (!post.s3Key) return post;
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: post.s3Key,
      });
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
      return {
        ...post.toObject(),
        signedUrl,
      };
    } catch (err) {
      console.error("Failed to get signed URL for post:", post._id, err);
      return post.toObject();
    }
  }));
}

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      }

      const creator = await Creator.findOne({ _id: userId }).populate('posts');
      if (!creator) {
        return NextResponse.json({ error: 'Creator not found for user' }, { status: 404 });
      }

      // Add signed URLs to posts
      const postsWithSignedUrls = await addSignedUrlsToPosts(creator.posts);
      const creatorObj = creator.toObject();
      creatorObj.posts = postsWithSignedUrls;

      return NextResponse.json({ creator: creatorObj });
    } else {
      const creators = await Creator.find({}).populate('posts');

      // Add signed URLs for all creators' posts
      const creatorsWithSignedUrls = await Promise.all(
        creators.map(async (creator) => {
          const postsWithSignedUrls = await addSignedUrlsToPosts(creator.posts || []);
          const creatorObj = creator.toObject();
          creatorObj.posts = postsWithSignedUrls;
          return creatorObj;
        })
      );

      return NextResponse.json({ creators: creatorsWithSignedUrls });
    }
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import PostModel from '@/app/models/postmodel';
import Creator from '@/app/models/creatormodel';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-client';
import { Post } from '@/app/types';

const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_SECRET_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY1!,
  },
});

export async function GET(req: NextRequest) {
  await connectDB();
  const username = req.nextUrl.searchParams.get('username');
  if (!username) {
    return NextResponse.json({ error: 'Missing username parameter' }, { status: 400 });
  }
  const creator = await Creator.findOne({ username }).populate('posts');
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  // Generate signed URLs for each post:
  const postsWithSignedUrls = await Promise.all(
    (creator.posts || []).map(async (post: Post) => {
      if (!post.s3Key) return post;
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: typeof post.s3Key === 'string'
          ? post.s3Key
          : post.s3Key?.key,
        });
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
        return {
          ...post,
          signedUrl,
        };
      } catch (err) {
        console.error("Failed to get signed URL for post:", post._id, err);
        return post; // fallback: return without signed URL
      }
    })
  );

  // Return posts with signed URLs in reverse chronological order:
  return NextResponse.json({ posts: postsWithSignedUrls.slice().reverse() });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { s3Key, caption, creatorId, type, width, height, viewable, price, originalContentId, isRepost } = await req.json();
  if ((!s3Key && !caption) || !creatorId) {
    return NextResponse.json({ error: 'Post must have either a file or a caption' }, { status: 400 });
  }
  // Ensure creatorId is the Creator's _id
  let creator = await Creator.findById(creatorId);
  if (!creator) {
    // Try to find by user field if not found by _id
    creator = await Creator.findOne({ user: creatorId });
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found for given id' }, { status: 404 });
    }
  }
  if (!s3Key?.key || !s3Key?.blurred_key) {
    return NextResponse.json({ error: 's3Key must contain both key and blurred_key' }, { status: 400 });
  }

  // Create the post
  const post = await PostModel.create({
    creator: creator._id,
    s3Key,
    type: type || null,
    caption: caption || '',
    createdAt: new Date(),
    width: width || null,
    height: height || null,
    price: price || 0,
    viewableFor: viewable || 'followers',
    likes: [],
    originalContentId: originalContentId || null,
    isRepost: isRepost || false
  });
  // Add post to creator's posts array
  await Creator.findByIdAndUpdate(creator._id, { $push: { posts: post._id } });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const username = req.nextUrl.searchParams.get('username');
  const { postId, liker, comment, unlike } = await req.json();

  if (!username || !postId) {
    return NextResponse.json({ error: 'Missing username or postId' }, { status: 400 });
  }

  if (liker && !liker.userId) {
    return NextResponse.json({ error: 'Missing userId in liker' }, { status: 400 });
  }

  const creator = await Creator.findOne({ username }).populate('posts');
  if (!creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  }

  try {
    let updatedPost;

    // Ensure userId is a valid ObjectId
    const userObjectId = liker?.userId ? new mongoose.Types.ObjectId(liker.userId) : null;

    if (comment) {
      updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $push: { comments: comment } },
        { new: true }
      );
    } else if (liker) {
      if (unlike) {
        // REMOVE like
        updatedPost = await PostModel.findByIdAndUpdate(
          postId,
          { $pull: { likes: { userId: userObjectId } } },
          { new: true }
        );
      } else {
        // ADD like if not already liked
        updatedPost = await PostModel.findOneAndUpdate(
          { _id: postId, 'likes.userId': { $ne: userObjectId } },
          { $push: { likes: { userId: userObjectId } } },
          { new: true }
        );

        if (!updatedPost) {
          // Already liked — just return the existing post
          updatedPost = await PostModel.findById(postId);
        }
      }
    } else {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }

    // Re-fetch creator’s posts with signed URLs
    const freshCreator = await Creator.findOne({ username }).populate('posts');
    const postsWithSignedUrls = await Promise.all(
      (freshCreator.posts || []).map(async (post: Post) => {
        if (!post.s3Key) return post;
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: typeof post.s3Key === 'string'
            ? post.s3Key
            : post.s3Key?.key,
          });
          const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

          return {
            ...post,
            signedUrl,
            ...(post._id.toString() === postId ? updatedPost.toObject() : {}),
          };
        } catch (err) {
          console.error('Failed to get signed URL for post:', post._id, err);
          return post;
        }
      })
    );

    return NextResponse.json({ posts: postsWithSignedUrls.slice().reverse() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
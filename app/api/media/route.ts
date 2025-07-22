import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Post from '@/app/models/postmodel';
import Creator from '@/app/models/creatormodel';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
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
    (creator.posts || []).map(async (post: any) => {
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
        return post.toObject(); // fallback: return without signed URL
      }
    })
  );

  // Return posts with signed URLs in reverse chronological order:
  return NextResponse.json({ posts: postsWithSignedUrls.slice().reverse() });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { s3Key, caption, creatorId, type, width, height, viewable, price } = await req.json();
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
  // Create the post
  const post = await Post.create({
    creator: creator._id,
    s3Key: s3Key || null,
    type: type || null,
    caption: caption || '',
    createdAt: new Date(),
    width: width || null,
    height: height || null,
    price: price || 0,
    viewableFor: viewable || 'followers',
    likes: []
  });
  // Add post to creator's posts array
  await Creator.findByIdAndUpdate(creator._id, { $push: { posts: post._id } });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest) {
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

if (comment) {
  updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: comment } },
    { new: true }
  );
} else if (liker) {
      if (unlike) {
        // Remove like
        updatedPost = await Post.findByIdAndUpdate(
          postId,
          { $pull: { likes: { userId: liker.userId } } },
          { new: true }
        );
      } else {
        // Add like if not exists
        updatedPost = await Post.findOneAndUpdate(
          { _id: postId, 'likes.userId': { $ne: liker.userId } },
          { $push: { likes: { userId: liker.userId } } },
          { new: true }
        );
        if (!updatedPost) {
          // User already liked, return existing post
          updatedPost = await Post.findById(postId);
        }
      }
    } else {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }

    // Re-fetch creator's posts with signed URLs
    const postsWithSignedUrls = await Promise.all(
      (creator.posts || []).map(async (post: any) => {
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
            ...(post._id.toString() === postId ? updatedPost.toObject() : {}),
          };
        } catch (err) {
          console.error("Failed to get signed URL for post:", post._id, err);
          return post.toObject();
        }
      })
    );
    return NextResponse.json({ posts: postsWithSignedUrls.slice().reverse() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
} 
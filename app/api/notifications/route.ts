// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Notification from '@/app/models/notificationmodel';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-client';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const body = await req.json();
    const { type, forUsers, by, postId, creatorId } = body;

    if (!type || !forUsers || !by || !Array.isArray(forUsers) || forUsers.length === 0) {
      return NextResponse.json({ message: '`type`, `by`, and non-empty `forUsers` array are required' }, { status: 400 });
    }

    const validTypes = ['newsub', 'resub', 'tip', 'subcancel', 'comment', 'like', 'newfollower', 'promotion', 'purchase'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ message: 'Invalid notification type' }, { status: 400 });
    }

    // Convert `by` to ObjectId
    const byId = (typeof by === 'string' && by.match(/^[0-9a-fA-F]{24}$/))
      ? new mongoose.Types.ObjectId(by)
      : null;

    if (!byId) return NextResponse.json({ message: 'Invalid `by` field' }, { status: 400 });

    // Convert `forUsers` to ObjectId array
    const forUserIds = forUsers.map(user => {
      if (!user.model || !user.id) throw new Error('Invalid `forUsers` entry');
      if (typeof user.id === 'string' && user.id.match(/^[0-9a-fA-F]{24}$/)) {
        return { model: user.model, id: new mongoose.Types.ObjectId(user.id) };
      }
      throw new Error(`Invalid ObjectId string in forUsers: ${user.id}`);
    });

    // Convert optional postId and creatorId
    const postObjectId = postId && postId.match(/^[0-9a-fA-F]{24}$/) ? new mongoose.Types.ObjectId(postId) : undefined;
    const creatorObjectId = creatorId && creatorId.match(/^[0-9a-fA-F]{24}$/) ? new mongoose.Types.ObjectId(creatorId) : undefined;

    for (const userId of forUserIds) {
      const query: Record<string, unknown> = { type, by: byId, for: userId };
      
      if (postObjectId) query.postId = postObjectId;
      if (creatorObjectId) query.creatorId = creatorObjectId;

      const exists = await Notification.exists(query);
      if (!exists) {
        await Notification.create({
          type,
          by: byId,
          for: [userId],
          date: new Date(),
          seen: false,
          postId: postObjectId,
          creatorId: creatorObjectId,
        });
      }
    }

    return NextResponse.json({ message: 'Notification(s) created if not duplicate' }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

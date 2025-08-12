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
    const { type, forUsers, by } = body;
    console.log('Received body:', body);
  console.log('Creating notification for:', forUsers);
    if (!type || !forUsers || !by ||!Array.isArray(forUsers) || forUsers.length === 0) {
      return NextResponse.json({ message: '`type` and non-empty `forUsers` array are required' }, { status: 400 });
    }

    const validTypes = ['newsub', 'resub', 'tip', 'subcancel', 'comment', 'like', 'newfollower', 'promotion'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ message: 'Invalid notification type' }, { status: 400 });
    }
    const forUserIds = forUsers.map(id => {
      if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
        return new mongoose.Types.ObjectId(id);
      }
      throw new Error(`Invalid ObjectId string: ${id}`);
    });
     
     const byId = (typeof by === 'string' && by.match(/^[0-9a-fA-F]{24}$/))
  ? new mongoose.Types.ObjectId(by)
  : null;

if (!byId) {
  return NextResponse.json({ message: 'Invalid `by` field' }, { status: 400 });
}

    const newNotification = new Notification({
      type,
      by: byId,
      date: new Date(),
      seen: false,
      for: forUserIds,
    });

    await newNotification.save();

    return NextResponse.json({ message: 'Notification created', notification: newNotification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


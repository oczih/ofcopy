import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import Message, { MessageDocument } from "@/app/models/chatmodel"; // ✅ named import
import { FilterQuery } from "mongoose";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Optional peerId to filter one-to-one chats
  const { searchParams } = new URL(req.url);
  const peerId = searchParams.get("peerId");

  // Only fetch messages where logged-in user is sender or receiver
  const query: FilterQuery<MessageDocument> = {
    $or: [
      { senderId: session.user._id },
      { receiverId: session.user._id },
    ],
  };

  if (peerId) {
    query.$or = [
      { senderId: session.user._id, receiverId: peerId },
      { senderId: peerId, receiverId: session.user._id },
    ];
  }

  // Fetch messages sorted by creation time
  const messages = await Message.find(query).sort({ createdAt: 1 }).lean();

  // Optional: sanitize ObjectId / Date to string
  const sanitized = messages.map(msg => ({
    ...msg,
    _id: msg._id,
    createdAt: msg.createdAt.toISOString(),
  }));

  return NextResponse.json({ messages: sanitized });
}

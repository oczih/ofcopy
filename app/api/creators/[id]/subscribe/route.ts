import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import UserModel from "@/app/models/usermodel"
import CreatorModel from "@/app/models/creatormodel"; // if you need to validate creator
import { Subscription } from "@/app/types";
interface Params {
  id: string;
}
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id: creatorId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const user = await UserModel.findById(session.user._id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // OPTIONAL: ensure creator exists
  const creator = await CreatorModel.findById(creatorId);
  if (!creator) {
    return NextResponse.json({ message: "Creator not found" }, { status: 404 });
  }

  // ✅ Find active subscription for this creator
  const subscriptionIndex = user.subscriptions.findIndex(
    (s: Subscription) =>
      s.creatorId.toString() === creatorId && s.status === "active"
  );

  if (subscriptionIndex === -1) {
    return NextResponse.json(
      { message: "No active subscription found" },
      { status: 404 }
    );
  }

  // ✅ Mark subscription as cancelled (do NOT remove it, to keep history)
  user.subscriptions[subscriptionIndex].status = "cancelled";
  user.subscriptions[subscriptionIndex].autoRenew = false;
  user.subscriptions[subscriptionIndex].cancellationDate = new Date();

  await user.save();

  return NextResponse.json({ message: "Subscription cancelled successfully" });
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { userId, creatorId, amount, type } = await req.json();
    if (!userId || !creatorId || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const user = await OFUser.findById(userId);
    const creator = await CreatorModel.findById(creatorId);

    if (!user || !creator)
      return NextResponse.json({ success: false, error: "User or creator not found" }, { status: 404 });

    if (user.wallet.balance < amount)
      return NextResponse.json({ success: false, error: "Insufficient wallet balance" }, { status: 400 });

    // Deduct balance
    user.wallet.balance -= amount;

    // Handle subscription payment
    if (type === "subscription") {
      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);

      // Add to user's subscriptions
      user.subscriptions.push({
        creatorId: new mongoose.Types.ObjectId(creatorId),
        username: creator.username,
        avatarKey: creator.avatarKey,
        subscribedAt: new Date(),
        price: amount,
        status: "active",
        creatorUsername: creator.username,
        creatorName: creator.name,
        nextBillingDate,
        autoRenew: false,
        paymentMethod: 'credits'
      });

      // Add to creator's subscribers
      creator.subscribers.push({
        userId: user._id,
        username: user.username,
        avatarKey: user.avatarKey,
        subscribedAt: new Date(),
        subscriptionPrice: amount,
        status: "active",
        nextBillingDate,
        autoRenew: false,
      });

      await creator.save();
    }

    await user.save();

    return NextResponse.json({ success: true, message: "Credit payment processed" });
  } catch (err) {
    console.error("Wallet charge error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

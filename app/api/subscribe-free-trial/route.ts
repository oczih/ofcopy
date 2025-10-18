import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import { Promotion, Subscription } from "@/app/types";

export async function POST(req: NextRequest) {
  try {
    const { creatorId, userId } = await req.json();

    if (!creatorId || !userId) {
      return NextResponse.json({ success: false, error: "Missing creatorId or userId" }, { status: 400 });
    }

    await connectDB();

    const creator = await CreatorModel.findById(creatorId);
    if (!creator) {
      return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });
    }

    // Check if user already has an active subscription
    const user = await OFUser.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const alreadySubscribed = user.subscriptions?.some(
      (s: Subscription) => s.creatorId.toString() === creatorId && s.status === "active"
    );

    if (alreadySubscribed) {
      return NextResponse.json({ success: false, error: "Already subscribed" }, { status: 400 });
    }

    // Determine free trial duration
    const trialDays = creator.promotions?.find((p: Promotion) => p.type === "freeTrial")?.trialDays || 7;

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + trialDays);

    // Push free trial subscription to user
    user.subscriptions = user.subscriptions || [];
    user.subscriptions.push({
      creatorId: new mongoose.Types.ObjectId(creatorId),
      username: creator.username,
      avatarKey: creator.avatarKey,
      subscribedAt: new Date(),
      subscriptionPrice: 0,
      status: "active",
      price: 0,
      creatorUsername: creator.username,
      creatorName: creator.name,
      nextBillingDate: subscriptionEndDate,
      autoRenew: false, // Free trial doesn't auto-renew
      paymentMethod: 'none'
    });

    await user.save();
    creator.subscribers.push({
        userId: user._id,
        username: user.username,
        avatarKey: user.avatarKey,
        subscribedAt: new Date(),
        subscriptionPrice: 0,
        status: "active",
        autoRenew: false,
      });
  
      await creator.save();    
    return NextResponse.json({ success: true, message: "Free trial activated", trialEnds: subscriptionEndDate });
  } catch (err) {
    console.error("Free trial subscription error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

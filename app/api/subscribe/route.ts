import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import { Subscription } from "@/app/types";

export async function POST(req: NextRequest) {
  try {
    const { creatorId, userId, price } = await req.json();

    if (!creatorId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing creatorId or userId" },
        { status: 400 }
      );
    }

    await connectDB();

    const [creator, user] = await Promise.all([
      CreatorModel.findById(creatorId),
      OFUser.findById(userId),
    ]);

    if (!creator)
      return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });
    if (!user)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);


    if (!Array.isArray(user.subscriptions)) {
      user.subscriptions = [];
    }
    
    user.subscriptions.push({
      creatorId: new mongoose.Types.ObjectId(creatorId.toString()),
      creatorName: creator.name,
      creatorUsername: creator.username,
      creatorImage: creator.avatarKey || "",
      subscriptionDate: new Date(),
      price: typeof price === "number" ? price : (creator.subscriptionPrice || 0),
      status: "active",
      nextBillingDate,
      autoRenew: true,
      paymentMethod: "stripe", // ✅ directly set
    });
    
    await user.save();

    creator.subscribers.push({
      userId: user._id,
      username: user.username,
      avatarKey: user.avatarKey,
      subscribedAt: new Date(),
      subscriptionPrice: price || creator.subscriptionPrice || 0, // <--- add this
      status: "active",
      nextBillingDate, // optional, but good to include
      autoRenew: true,
    });
    await creator.save();

    return NextResponse.json({
      success: true,
      message: "Subscription successful",
      nextBillingDate,
    });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

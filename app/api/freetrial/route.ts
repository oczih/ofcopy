import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import mongoose from "mongoose";

export async function POST(req: Request) {
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

    // ✅ Calculate subscription end date (1 month from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    // ✅ Push subscription to user
    await OFUser.updateOne(
      { _id: userId },
      {
        $push: {
          subscriptions: {
            creatorId: new mongoose.Types.ObjectId(String(creatorId)),
            creatorName: creator.name,
            creatorUsername: creator.username,
            creatorImage: creator.avatarKey,
            subscriptionDate: new Date(),
            price: 0, // free trial
            status: "active",
            nextBillingDate: subscriptionEndDate,
            autoRenew: false
          }
        }
      }
    );
    await creator.updateOne()
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Free trial subscription error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

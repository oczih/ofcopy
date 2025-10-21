import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongoose";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import { Subscriber, Subscription } from "@/app/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, localId } = await req.json();

    if (!subscriptionId && !localId) {
      return NextResponse.json({ error: "Missing subscription identifier" }, { status: 400 });
    }

    await connectDB();

    let nextBillingDate: Date | null = null;
    let successMessage = "";

    // 🧾 STRIPE SUBSCRIPTION LOGIC
    if (subscriptionId) {
      const stripeSub: Stripe.Subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      // Use your preferred property (items.data[0].current_period_end)
      const currentPeriodEnd =
        stripeSub.items?.data?.[0]?.current_period_end || null;

      nextBillingDate = currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : new Date();

      successMessage = "Stripe subscription set to cancel at period end";

      // Update user + creator records
      const user = await OFUser.findOne({ "subscriptions.subscriptionId": subscriptionId });
      const creator = await CreatorModel.findOne({ "subscribers.subscriptionId": subscriptionId });

      if (user) {
        const sub = user.subscriptions.find((s: Subscription) => s.subscriptionId === subscriptionId);
        if (sub) {
          sub.status = "cancelled";
          sub.autoRenew = false;
          sub.nextBillingDate = nextBillingDate;
          await user.save();
        }
      }

      if (creator) {
        const sub = creator.subscribers.find((s: Subscriber) => s.subscriptionId === subscriptionId);
        if (sub) {
          sub.status = "cancelled";
          sub.autoRenew = false;
          sub.nextBillingDate = nextBillingDate;
          await creator.save();
        }
      }
    }

    // 💳 CREDIT-BASED SUBSCRIPTION LOGIC
    else if (localId) {
      // Find user subscription by _id
      const user = await OFUser.findOne({ "subscriptions._id": localId });
      if (!user) {
        return NextResponse.json({ error: "Credit-based subscription not found" }, { status: 404 });
      }
    
      const sub = user.subscriptions.find((s: Subscription) => String(s._id) === String(localId));
      if (!sub) {
        return NextResponse.json({ error: "Credit-based subscription not found" }, { status: 404 });
      }
    
      // Find the corresponding creator
      const creator = await CreatorModel.findById(sub.creatorId);
      if (!creator) {
        return NextResponse.json({ error: "Creator for this subscription not found" }, { status: 404 });
      }
    
      // Match creator subscriber by userId AND subscription date
      const creatorSub = creator.subscribers.find(
        (s: Subscriber) =>
          String(s.userId) === String(user._id) &&
          s.subscribedAt.getTime() === new Date(sub.subscriptionDate).getTime()
      );
    
      if (!creatorSub) {
        return NextResponse.json({ error: "Subscriber record not found on creator" }, { status: 404 });
      }
    
      // Keep existing nextBillingDate
      const nextBillingDate = sub.nextBillingDate ?? new Date();
    
      // Update user subscription
      sub.status = "cancelled";
      sub.autoRenew = false;
      await user.save();
    
      // Update creator subscriber
      creatorSub.status = "cancelled";
      creatorSub.autoRenew = false;
      creatorSub.nextBillingDate = nextBillingDate;
      await creator.save();
    
      return NextResponse.json({
        success: true,
        message: "Credit-based subscription cancelled — will remain active until expiry.",
        nextBillingDate,
      });
    }
    

    return NextResponse.json({
      success: true,
      message: successMessage,
      nextBillingDate,
    });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

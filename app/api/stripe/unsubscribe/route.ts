import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongoose";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import { Subscriber, Subscription } from "@/app/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_TEST!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
    }

    await connectDB();

    // ✅ Properly typed Stripe subscription
    const stripeSub: Stripe.Subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      
      // Ensure the subscription object is valid
      if (!stripeSub || !stripeSub.items || !stripeSub.items.data || !stripeSub.items.data[0]) {
        return NextResponse.json({ 
          error: "Invalid subscription returned from Stripe" 
        }, { status: 500 });
      }
      
      // Get current_period_end safely
      const currentPeriodEnd = stripeSub.items.data[0].current_period_end;
      if (!currentPeriodEnd) {
        return NextResponse.json({ 
          error: "Stripe subscription missing current_period_end" 
        }, { status: 500 });
      }
      
      const nextBillingDate = new Date(currentPeriodEnd * 1000);

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

    return NextResponse.json({
      success: true,
      message: "Subscription set to cancel at period end",
      nextBillingDate,
    });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

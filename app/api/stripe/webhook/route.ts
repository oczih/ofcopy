import { NextResponse } from "next/server";
import Stripe from "stripe";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import { connectDB } from "@/lib/mongoose";
import { Subscriber, Subscription } from "@/app/types";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: Request) {
  await connectDB();

  // Get raw body buffer for Stripe validation
  const rawBody = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const data = event.data.object as Stripe.Subscription;
  const subscriptionId = data.id;

  const user = await OFUser.findOne({ "subscriptions.subscriptionId": subscriptionId });
  const creator = await CreatorModel.findOne({ "subscribers.subscriptionId": subscriptionId });

  const currentPeriodEnd =
    data.items?.data?.[0]?.current_period_end
      ? new Date(data.items.data[0].current_period_end * 1000)
      : null;

  switch (event.type) {
    case "invoice.payment_failed":
      if (user) {
        const sub = user.subscriptions.find((s: Subscription) => s.subscriptionId === subscriptionId);
        if (sub) sub.status = "payment_failed";
        await user.save();
      }
      if (creator) {
        const sub = creator.subscribers.find((s: Subscriber) => s.subscriptionId === subscriptionId);
        if (sub) sub.status = "payment_failed";
        await creator.save();
      }
      break;

    case "customer.subscription.deleted":
    case "customer.subscription.updated":
      if (user) {
        const sub = user.subscriptions.find((s: Subscription) => s.subscriptionId === subscriptionId);
        if (sub) {
          sub.status = "cancelled";
          sub.nextBillingDate = currentPeriodEnd ?? sub.nextBillingDate;
          sub.autoRenew = false;
        }
        await user.save();
      }
      if (creator) {
        const sub = creator.subscribers.find((s: Subscriber) => s.subscriptionId === subscriptionId);
        if (sub) {
          sub.status = "cancelled";
          sub.nextBillingDate = currentPeriodEnd ?? sub.nextBillingDate;
          sub.autoRenew = false;
        }
        await creator.save();
      }
      break;
  }

  return NextResponse.json({ received: true });
}

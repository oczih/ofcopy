// /api/stripe/webhook.ts
import { buffer } from "micro";
import Stripe from "stripe";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import { connectDB } from "@/lib/mongoose";
import { Subscriber, Subscription } from "@/app/types";
import { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.STRIPE_SECRET_TEST!, { apiVersion: "2025-09-30.clover" });

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return res.status(400).end();
  }

  const data = event.data.object as Stripe.Subscription;
  const subscriptionId = data.id;

  const user = await OFUser.findOne({ "subscriptions.subscriptionId": subscriptionId });
  const creator = await CreatorModel.findOne({ "subscribers.subscriptionId": subscriptionId });

  // Use items.data[0].current_period_end instead of root property
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

  res.json({ received: true });
}

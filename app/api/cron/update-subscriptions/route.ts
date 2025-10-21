import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import { Subscriber } from "@/app/types";

export async function GET(req: Request) {
  // ✅ Verify secret
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();

  // Find users with active subscriptions past nextBillingDate
  const users = await OFUser.find({
    "subscriptions.nextBillingDate": { $lt: now },
    "subscriptions.status": "active",
  });

  for (const user of users) {
    for (const sub of user.subscriptions) {
      if (sub.nextBillingDate && sub.nextBillingDate < now && sub.status === "active") {
        sub.status = "expired";
        await user.save();

        // Update creator subscriber status
        const creator = await CreatorModel.findById(sub.creatorId);
        if (creator) {
          const creatorSub = creator.subscribers.find(
            (s: Subscriber) =>
              String(s.userId) === String(user._id) &&
              s.subscribedAt.getTime() === new Date(sub.subscriptionDate).getTime()
          );
          if (creatorSub) {
            creatorSub.status = "expired";
            await creator.save();
          }
        }
      }
    }
  }

  console.log("Subscriptions updated", new Date());
  return NextResponse.json({ success: true });
}

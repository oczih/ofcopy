import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Transaction from "@/app/models/transactionmodel";
import PaymentIntent from "@/app/models/paymentintent";
import Purchase from "@/app/models/purchasemodel";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import mongoose from "mongoose";
import { supabase } from "@/lib/supabase"; // 👈 import your supabase client

const PLISIO_API_KEY = process.env.PLISIO_SECRET;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload || payload.token !== PLISIO_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      order_id,
      status, // e.g. "paid"
      pay_amount,
      pay_currency,
      crypto_currency,
      txid,
    } = payload;

    // ✅ Only act on successful payments
    if (status !== "paid") {
      return NextResponse.json({ success: false, message: "Payment not completed yet" });
    }

    await connectDB();

    // 🧾 Update transaction record
    await Transaction.findOneAndUpdate(
      { order_id },
      {
        status: "completed",
        crypto_currency,
        amount_paid: pay_amount,
        currency: pay_currency,
        txid,
        paidAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // 🔎 Find corresponding payment intent
    const intent = await PaymentIntent.findOne({ orderId: order_id });
    if (!intent) {
      console.warn("PaymentIntent not found for order_id:", order_id);
      return NextResponse.json({ success: true, message: "Transaction recorded, no intent found" });
    }

    intent.status = "completed";
    intent.txid = txid;
    await intent.save();

    // ⚙️ Process based on intent type
    if (intent.type === "purchase" && intent.mediaId) {
      await Purchase.create({
        userId: intent.userId,
        creatorId: intent.creatorId,
        mediaId: intent.mediaId,
        amount: intent.amount,
      });
    }

    if (intent.type === "topup") {
      await OFUser.updateOne(
        { _id: intent.userId },
        { $inc: { balance: intent.amount } }
      );
    }

    if (intent.type === "post" && intent.mediaId) {
      await Purchase.create({
        userId: intent.userId,
        creatorId: intent.creatorId,
        mediaId: intent.mediaId,
        amount: intent.amount,
      });
    }

    if (intent.type === "subscription" && intent.creatorId) {
      const creator = await CreatorModel.findById(intent.creatorId);
      if (creator) {
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        await OFUser.updateOne(
          { _id: intent.userId },
          {
            $push: {
              subscriptions: {
                creatorId: new mongoose.Types.ObjectId(String(intent.creatorId)),
                creatorName: creator.name,
                creatorUsername: creator.username,
                creatorImage: creator.avatarKey,
                subscriptionDate: new Date(),
                price: intent.amount,
                status: "active",
                nextBillingDate: subscriptionEndDate,
                autoRenew: true,
              },
            },
          }
        );
      }
    }

    // 📨 NEW: Handle paid message unlock
    if (intent.type === "message" && intent.mediaId) {
      const { data: msg, error: fetchErr } = await supabase
        .from("messages")
        .select("purchased")
        .eq("id", intent.mediaId)
        .single();

      if (fetchErr) {
        console.error("Supabase fetch error:", fetchErr);
      } else if (msg) {
        const newPurchased = Array.isArray(msg.purchased)
          ? Array.from(new Set([...msg.purchased, String(intent.userId)]))
          : [String(intent.userId)];

        const { error: updateErr } = await supabase
          .from("messages")
          .update({ purchased: newPurchased })
          .eq("id", intent.mediaId);

        if (updateErr) console.error("Supabase update error:", updateErr);
      }
    }

    return NextResponse.json({ success: true, txid });
  } catch (err) {
    console.error("Plisio callback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

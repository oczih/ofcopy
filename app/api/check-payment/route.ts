import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import PaymentIntent from "@/app/models/paymentintent";
import Purchase from "@/app/models/purchasemodel";
import OFUser from "@/app/models/usermodel";
import CreatorModel from "@/app/models/creatormodel";
import mongoose from "mongoose";

const BLOCKCYPHER_API_URL = "https://api.blockcypher.com/v1/btc/test3";
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN!;
const MIN_CONFIRMATIONS = 1;

export async function POST(req: Request) {
  try {
    const { intentId } = await req.json();
    await connectDB();

    const intent = await PaymentIntent.findById(intentId);
    if (!intent) {
      return NextResponse.json({ confirmed: false, error: "Payment intent not found" }, { status: 404 });
    }

    if (intent.status === "completed") {
      return NextResponse.json({ confirmed: true, txid: intent.txid });
    }

    // Query blockchain
    let url = `${BLOCKCYPHER_API_URL}/addrs/${intent.address}/full`;
    if (BLOCKCYPHER_TOKEN) url += `?token=${BLOCKCYPHER_TOKEN}`;

    const res = await fetch(url);
    type BlockCypherTx = {
      hash: string;
      total: number; // in satoshis
      confirmations: number;
    };
    const data: { txs?: BlockCypherTx[]; error?: string } = await res.json();
    if (data.error) {
      return NextResponse.json({ confirmed: false, error: data.error }, { status: 500 });
    }
    
    const tx = (data.txs || []).find(
      (t) => t.total / 1e8 >= intent.amount && t.confirmations >= MIN_CONFIRMATIONS
    );

    if (!tx) {
      return NextResponse.json({ confirmed: false });
    }

    // ✅ Mark as completed and process the purchase
    intent.status = "completed";
    intent.txid = tx.hash;
    await intent.save();

    // Create purchase/subscription/topup depending on type
    if (intent.type === "purchase" && intent.mediaId) {
      await Purchase.create({
        userId: intent.userId,
        creatorId: intent.creatorId,
        mediaId: intent.mediaId,
        amount: intent.amount
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
        amount: intent.amount
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
                autoRenew: true
              }
            }
          }
        );
      }
    }

    return NextResponse.json({ confirmed: true, txid: tx.hash });
  } catch (err) {
    console.error("Check-payment error:", err);
    return NextResponse.json({ confirmed: false, error: "Server error" }, { status: 500 });
  }
}

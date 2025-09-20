// app/api/plisio/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Transaction from "@/app/models/transactionmodel";// your Payment schema

const PLISIO_API_KEY = process.env.PLISIO_SECRET; // same as used for invoice creation

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Plisio sends a 'token' to validate the webhook
    if (!payload || payload.token !== PLISIO_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract useful info
    const {
      order_id,
      status, // e.g., "paid", "pending", "cancelled"
      pay_amount,
      pay_currency,
      crypto_currency,
      txid,
    } = payload;

    // Only handle successful payments
    if (status === "paid") {
      await connectDB();

      // Update your Payment collection
      // Assumes you have a Payment model storing order_id
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
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Plisio callback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

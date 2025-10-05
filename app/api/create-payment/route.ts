import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import PaymentIntent from "@/app/models/paymentintent";


export async function POST(req: Request) {
  try {
    const { userId, creatorId, mediaId, type, amount } = await req.json();
    await connectDB();

    // Request a unique LTC address from BlockCypher (testnet)
    const addrRes = await fetch(`https://api.blockcypher.com/v1/btc/test3/addrs`, {
      method: "POST"
    });
    const newAddress = await addrRes.json();
    if (!newAddress?.address) {
      return NextResponse.json({ error: "Failed to create blockchain address" }, { status: 500 });
    }
    const WALLET_ADDRESS = process.env.NEXT_PUBLIC_LTCWALLETADDRESS!;
    const intent = await PaymentIntent.create({
      userId,
      creatorId,
      mediaId,
      type,
      amount,
      address: WALLET_ADDRESS,
      status: "pending",
      createdAt: new Date()
    });

    return NextResponse.json({
      intentId: intent._id.toString(),
      address: intent.address,
      amount: intent.amount
    });
  } catch (err) {
    console.error("Create-payment error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

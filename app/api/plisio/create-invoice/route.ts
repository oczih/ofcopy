import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Transaction from "@/app/models/transactionmodel";

const PLISIO_API_KEY = process.env.PLISIO_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { amount, type,  postId, userId } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Missing amount or crypto currency" }, { status: 400 });
    }

    await connectDB();

    // Create a unique order number to tie Plisio <-> your DB
    const orderNumber = `fanslio-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    // Save a pending transaction FIRST
    await Transaction.create({
      userId,
      amount,
      paymentMethod: "plisio", 
      postId: postId || undefined,
      type,
      status: "pending",          // pending until Plisio confirms
      order_id: orderNumber,      // add this field to your schema (see below)
    });

    // Build Plisio invoice URL
    const url = new URL("https://api.plisio.net/api/v1/invoices/new");
    url.searchParams.set("source_currency", "USD");
    url.searchParams.set("source_amount", amount.toString());
    url.searchParams.set("order_number", orderNumber);
    url.searchParams.set("order_name", type); // could be "subscription", "tip", etc.
    url.searchParams.set("callback_url", `${process.env.NEXT_PUBLIC_BASE_URL}/api/plisio/callback`);
    url.searchParams.set("success_callback_url", `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`);
    url.searchParams.set("fail_callback_url", `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancel`);
    url.searchParams.set("api_key", PLISIO_API_KEY);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "success") {
      console.error("Plisio API error:", data);
      return NextResponse.json(
        { error: data.data?.message || "Failed to create invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.data.invoice_url });
  } catch (err) {
    console.error("Error creating Plisio invoice:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

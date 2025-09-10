// /app/api/luxfin/charge/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Forward to LuxFin
    const response = await fetch("https://api.luxfin.io/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.LUXFIN_API_KEY!,
        "x-api-secret": process.env.LUXFIN_SECRET!,
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency,
        country: body.country,
        payment_method: body.paymentMethod, // e.g. "card" or "paypal"
        card: body.card, // only if card is selected
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("LuxFin error:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}

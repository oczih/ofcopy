import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(req: NextRequest) {
  const { priceId, mode, amount, productName } = await req.json();

  try {
    let session;

    if (mode === "subscription") {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.nextUrl.origin}/redirect?status=success&type=subscription`,
        cancel_url: `${req.nextUrl.origin}/redirect?status=cancel&type=subscription`,
      });
    } else if (mode === "payment" && priceId) {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.nextUrl.origin}/redirect?status=success&type=topup`,
        cancel_url: `${req.nextUrl.origin}/redirect?status=cancel&type=topup`,
      });
    } else if (mode === "payment" && amount) {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: productName || "Top-up Balance" },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${req.nextUrl.origin}/redirect?status=success&type=topup`,
        cancel_url: `${req.nextUrl.origin}/redirect?status=cancel&type=topup`,
      });
    } else {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // 👇 Return redirect URL to 10ksteps.vercel.app
    return NextResponse.json({
      url: `https://10ksteps.vercel.app/redirect/${session.id}?return=${encodeURIComponent(req.nextUrl.origin + "/wallet")}`,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

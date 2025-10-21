import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(req: NextRequest) {
  const { priceId, mode, amount, productName, email, userId, creatorId } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: mode === "subscription" ? "subscription" : "payment",
      customer_email: email,
      line_items: [
        {
          price: priceId || undefined,
          quantity: 1,
          price_data: priceId ? undefined : {
            currency: "usd",
            product_data: { name: productName || "Top-up Balance" },
            unit_amount: Math.round(amount * 100),
          },
        },
      ],
      metadata: {
        userId: userId!,
        email: email!,
        amount: amount?.toString() || "",
  ...(mode === "subscription" && creatorId ? { creatorId: creatorId } : {}),
      },
      success_url: `${req.nextUrl.origin}/redirect?status=success&type=${
        mode === "subscription" ? "subscription" : "topup"
      }&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/redirect?status=cancel&type=${
        mode === "subscription" ? "subscription" : "topup"
      }`,
    })

    return NextResponse.json({
      url: `https://10ksteps.vercel.app/redirect/${session.id}?return=${encodeURIComponent(
        req.nextUrl.origin + "/wallet"
      )}`,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

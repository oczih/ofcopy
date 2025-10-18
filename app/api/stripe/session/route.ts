import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_TEST!, {
  apiVersion: "2025-09-30.clover",
});

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId)
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json(session);
  } catch (err) {
    console.error("Stripe session error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}

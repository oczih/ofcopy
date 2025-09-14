import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Verify the webhook signature
function verifySignature(secret: string, body: Buffer, signature: string) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const digest = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("x-luxfintech-signature") || "";

    // Get raw body as Buffer (important for HMAC)
    const rawBody = Buffer.from(await req.arrayBuffer());

    if (!verifySignature(process.env.LUXFIN_API_SECRET!, rawBody, sig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Parse JSON after verifying signature
    const payload = JSON.parse(rawBody.toString());

    console.log("✅ Valid webhook received:", payload);

    // Example: Update DB with payment status
    // await db.payment.update({
    //   where: { id: payload.payment_id },
    //   data: { status: payload.status },
    // });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

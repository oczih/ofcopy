import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { method, amount, customer, product, redirect_url } = await req.json();

    if (!method || !amount || !customer || !product) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const apiKey = process.env.LUXFIN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "LuxFin API key missing" }, { status: 500 });
    }

    // Map method to LuxFin endpoint if needed
    let endpoint = "https://luxfin.org/payment/paypal"; // default PayPal
    if (method === "venmo") endpoint = "https://luxfin.org/payment/venmo";
    if (method === "applepay") endpoint = "https://luxfin.org/payment/applepay";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount,
        currency: "USD",
        customer,
        product,
        redirect_url: redirect_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "LuxFin API error", details: errText }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({ redirectUrl: data.order_url });
  } catch (err) {
    console.error("LuxFin wallet error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

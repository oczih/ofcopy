import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { method, amount, customer, currency, product, redirect_url } = await req.json();

    if (!method || !amount || !customer || !product) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const apiKey = process.env.LUXFIN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "LuxFin API key missing" }, { status: 500 });
    }
    console.log(currency)
    // Map method to LuxFin endpoint if needed
    let endpoint = "https://luxfin.org/payment/paypal"; // default PayPal
    if (method === "venmo") endpoint = "https://luxfin.org/payment/order";
    if (method === "applepay") endpoint = "https://luxfin.org/payment/applepay";
    if (method === "card") endpoint = "https://luxfin.org/card"

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount,
        currency: method === "card" ? currency : "USD",
        customer,
        product,
        redirect_url: redirect_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      }),
    });
    const bodyText = await res.text(); // read the body as text first
      console.log("LuxFin response body:", bodyText);

      let data;
      try {
      data = JSON.parse(bodyText); // parse JSON if possible
      } catch (e) {
      console.error("Failed to parse LuxFin response as JSON", e);
      return NextResponse.json({ error: "Invalid response from LuxFin", details: bodyText }, { status: 500 });
      }

      if (!res.ok) {
      return NextResponse.json({ error: "LuxFin API error", details: bodyText }, { status: res.status });
      }

    
          console.log("Parsed LuxFin data:", data);

return NextResponse.json({ redirectUrl: data.order_url });
  } catch (err) {
    console.error("LuxFin wallet error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

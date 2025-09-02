import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "8.8.8.8"; // fallback for dev

  // Use a free geolocation service (ipapi.co, ipregistry, etc.)
  const res = await fetch(`https://ipapi.co/${ip}/json/`);
  const data = await res.json();

  return NextResponse.json({ country: data.country_code || "FI" });
}
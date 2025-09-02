import { NextRequest, NextResponse } from "next/server";

type VatRateItem = {
  name: string;
  rates: number[];
};

type VatApiResponse = {
  rates: VatRateItem[];
  disclaimer: string;
};

type Params = { country: string };

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { country } = await context.params;

  try {
    const res = await fetch(`http://api.vatlookup.eu/rates/${country}/`);
    if (!res.ok) {
      throw new Error("VAT API error");
    }

    const data: VatApiResponse = await res.json();

    // Extract the "Standard" VAT rate
    const standard = data.rates.find((r) => r.name === "Standard");
    const vatRate = standard?.rates[0] ?? 0;

    return NextResponse.json({ vatRate });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ vatRate: 0 }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

// Type for route parameters
type Params = { country: string };

// Fake GET route that does nothing meaningful
export async function GET(
  req: NextRequest,
  context: { params: Params } // NOTE: not a Promise
) {
  const { country } = context.params;

  // Dummy response
  const vatRate = 0;

  return NextResponse.json({ country, vatRate });
}

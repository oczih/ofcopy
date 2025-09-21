import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";       // 👈 server-side FormData
import fetch from "node-fetch";         // Needed on Vercel Edge/Node runtime

export const runtime = "nodejs";

const PHOTO_DNA_ENDPOINT = "https://api.microsoftmoderator.com/photodna/v1.0/Match";
const PHOTO_DNA_KEY = process.env.PHOTODNA_PRIMARY!;

interface PhotoDNAResponse {
  Status: {
    Code: number;
    Description: string;
  };
  IsMatch: boolean;
  MatchDetails?: {
    MatchFlags?: Array<{
      Source: string;
      Violations: string[];
      MatchDistance: number;
    }>;
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert Next.js File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Build multipart/form-data request for PhotoDNA
    const form = new FormData();
    form.append("file", buffer, { filename: file.name, contentType: file.type });

    const response = await fetch(PHOTO_DNA_ENDPOINT, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": PHOTO_DNA_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("PhotoDNA scan failed:", errText);
      return NextResponse.json(
        { error: "PhotoDNA scan failed", details: errText },
        { status: 500 }
      );
    }

    const result = (await response.json()) as PhotoDNAResponse;

    if (result.IsMatch) {
      // ✅ The image matched known illegal content
      return NextResponse.json(
        {
          error: "Image flagged by PhotoDNA",
          matchDetails: result.MatchDetails,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, details: result });
  } catch (err) {
    console.error("PhotoDNA scan unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

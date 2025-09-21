import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";   // <-- adjust path to your dbConnect
import Creator from "@/app/models/creatormodel"; // <-- adjust path to your Creator model

// 🟢 GET: Get all promotions for a creator
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const creator = await Creator.findById(params.id).select("promotions");
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }
    return NextResponse.json({ promotions: creator.promotions });
  } catch (err) {
    console.error("GET promotions error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟢 POST: Add a new promotion
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();

    const { title, description, discountPercent, startDate, endDate, active } =
      body;

    if (!title || discountPercent === undefined || !startDate) {
      return NextResponse.json(
        { error: "title, discountPercent and startDate are required" },
        { status: 400 }
      );
    }

    const creator = await Creator.findById(params.id);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const newPromotion = {
      title,
      description: description || "",
      discountPercent,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      active: active !== undefined ? active : true,
    };

    creator.promotions.push(newPromotion);
    await creator.save();

    return NextResponse.json({
      message: "Promotion added",
      promotion: creator.promotions[creator.promotions.length - 1],
    });
  } catch (err) {
    console.error("POST promotion error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟡 PATCH: Update an existing promotion
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const promoId = searchParams.get("promoId"); // pass ?promoId=xxxx
    if (!promoId) {
      return NextResponse.json({ error: "promoId query required" }, { status: 400 });
    }

    const updates = await req.json();
    const creator = await Creator.findOneAndUpdate(
      { _id: params.id, "promotions._id": promoId },
      {
        $set: Object.fromEntries(
          Object.entries(updates).map(([k, v]) => [`promotions.$.${k}`, v])
        ),
      },
      { new: true }
    );

    if (!creator) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    const updatedPromo = creator.promotions.id(promoId);
    return NextResponse.json({ message: "Promotion updated", promotion: updatedPromo });
  } catch (err) {
    console.error("PATCH promotion error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🔴 DELETE: Remove a promotion
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const promoId = searchParams.get("promoId");
    if (!promoId) {
      return NextResponse.json({ error: "promoId query required" }, { status: 400 });
    }

    const creator = await Creator.findById(params.id);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const promo = creator.promotions.id(promoId);
    if (!promo) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    promo.deleteOne();
    await creator.save();

    return NextResponse.json({ message: "Promotion deleted" });
  } catch (err) {
    console.error("DELETE promotion error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

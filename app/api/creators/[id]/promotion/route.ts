import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";   // <-- adjust path to your dbConnect
import Creator from "@/app/models/creatormodel"; // <-- adjust path to your Creator model

// 🟢 GET: Get all promotions for a creator
export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  try {
    await connectDB();
    const creator = await Creator.findById(id).select("promotions");
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }
    return NextResponse.json({ promotions: creator.promotions });
  } catch (err) {
    console.error("GET promotions error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
interface Params {
  id: string;
}
// 🟢 POST: Add a new promotion
export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  try {
    await connectDB();
    const body = await req.json();

    const { message, type, discountPercent, startDate, endDate, active, audience, peopleLimit } = body;
    if (!audience || !startDate) {
      return NextResponse.json(
        { error: "audience and startDate are required" },
        { status: 400 }
      );
    }
    
    if (type === "discount" && !discountPercent) {
      return NextResponse.json(
        { error: "discountPercent is required for discount promotions" },
        { status: 400 }
      );
    }

    const creator = await Creator.findById(id);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const newPromotion = {
      type,
      audience,
      message,
      discountPercent,
      peopleLimit,
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
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const promoId = searchParams.get("promoId"); // pass ?promoId=xxxx
    if (!promoId) {
      return NextResponse.json({ error: "promoId query required" }, { status: 400 });
    }

    const updates = await req.json();
    const creator = await Creator.findOneAndUpdate(
      { _id: id, "promotions._id": promoId },
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
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const promoId = searchParams.get("promoId");
    if (!promoId) {
      return NextResponse.json({ error: "promoId query required" }, { status: 400 });
    }

    const creator = await Creator.findById(id);
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

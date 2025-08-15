import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import CreatorModel from "@/app/models/creatormodel";
import { getUserIdFromRequest } from "@/lib/auth";
import { getCreatorsByUser } from "@/lib/creatorService";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const creators = await getCreatorsByUser(userId, true);
    return NextResponse.json({ creators });
  } catch {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const newCreator = new CreatorModel({ ...body, user: userId });
    await newCreator.save();
    return NextResponse.json({ creator: newCreator }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    const creatorId = url.searchParams.get("id");
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const creator = await CreatorModel.findById(creatorId);
    if (!creator || creator.user.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    Object.assign(creator, body);
    await creator.save();
    return NextResponse.json({ creator });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    const creatorId = url.searchParams.get("id");
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const creator = await CreatorModel.findById(creatorId);
    if (!creator || creator.user.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await CreatorModel.findByIdAndDelete(creatorId);
    return NextResponse.json({ message: "Creator deleted" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

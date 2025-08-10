import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import CreatorModel from "@/app/models/creatormodel";
import { verifySystemAccess } from "@/lib/auth";
import { getAllCreators } from "@/lib/creatorService";

export async function GET(request: NextRequest) {
  try {
    const creators = await CreatorModel.find({})
    return NextResponse.json({ creators });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    verifySystemAccess(request);
    const body = await request.json();
    const newCreator = new CreatorModel(body);
    await newCreator.save();
    return NextResponse.json({ creator: newCreator }, { status: 201 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    verifySystemAccess(request);
    const url = new URL(request.url);
    const creatorId = url.searchParams.get("id");
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const body = await request.json();
    const updated = await CreatorModel.findByIdAndUpdate(creatorId, body, { new: true });
    return NextResponse.json({ creator: updated });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    verifySystemAccess(request);
    const url = new URL(request.url);
    const creatorId = url.searchParams.get("id");
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await CreatorModel.findByIdAndDelete(creatorId);
    return NextResponse.json({ message: "Creator deleted" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

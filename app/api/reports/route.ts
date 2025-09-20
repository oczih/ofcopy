import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-client";
import { connectDB } from "@/lib/mongoose";
import { verifySystemAccess } from "@/lib/auth";
import Report from "@/app/models/reportmodel";

// 🚀 Create a new report
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  try {
    const data = await req.json();
    const { creator, post, reason, details } = data;

    if (!reason || typeof reason !== "string") {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    const report = await Report.create({
      reporter: session.user._id, // user filing the report
      creator: creator || null,
      post: post || null,
      reason,
      details: details || "",
      status: "pending",
    });

    return NextResponse.json({ message: "Report submitted", report }, { status: 201 });
  } catch (err) {
    console.error("Report POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// 🚀 Get list of reports (admin/system only)
export async function GET(req: NextRequest) {
  try {
    verifySystemAccess(req); // Ensure only internal/system/admin can fetch
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Partial<{ status: string }> = {};
    if (status && status !== "all") query.status = status;

    const reports = await Report.find(query)
      .populate("reporter", "username email")
      .populate("creator", "name username")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("Report GET error:", err);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`);
  }
}
export async function DELETE() {
  try {
    await connectDB();

    const result = await Report.deleteMany({});

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount ?? 0,
    });
  } catch (err) {
    console.error("DELETE /api/reports error:", err);
    return NextResponse.json(
      { error: "Failed to delete all reports" },
      { status: 500 }
    );
  }
}
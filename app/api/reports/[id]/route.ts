// app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Report from "@/app/models/reportmodel";

// ✅ Update report status
export async function POST(request: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    await connectDB();

    const { status } = await request.json();

    if (!["pending", "reviewed", "action_taken", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await Report.findByIdAndUpdate(params.id, { status }, { new: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/reports/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
type Params = { id: string };
// ✅ Delete report
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id: reportId } = await context.params;
  try {
    await connectDB();

    const deleted = await Report.findByIdAndDelete(reportId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/reports/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}

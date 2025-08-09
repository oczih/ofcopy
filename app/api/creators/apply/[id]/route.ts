import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Creator from "@/app/models/creatormodel";
import CreatorApplication from "@/app/models/creatorapplicationmodel";
import OFUser from "@/app/models/usermodel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import mongoose from "mongoose";

export async function POST(request: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    // ✅ Only system/admin can approve or reject
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const { action } = await request.json();
    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const application = await CreatorApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (action === "accept") {
      application.status = "approved";
      await application.save();

      const user = await OFUser.findOneAndUpdate(
        { email: application.email },
        { $set: { creator: true } },
        { new: true }
      );

      if (user) {
        const existingCreator = await Creator.findOne({ email: user.email });

        if (!existingCreator) {
          await Creator.create({
            name: user.name,
            username: user.username,
            email: user.email,
            password: user.password, // ⚠ consider removing from here if not needed in Creator
            googleId: user.googleId,
            image: user.image,
            oauthProvider: user.oauthProvider,
            oauthId: user.oauthId,
            lastUsernameChange: user.lastUsernameChange,
            subscribers: 0,
            price: 9.99,
            category: "General",
            user: user.id, // link back to original OFUser
          });
        }
      }

      return NextResponse.json({ message: "Application approved" });
    }

    if (action === "reject") {
      application.status = "rejected";
      await application.save();
      return NextResponse.json({ message: "Application rejected" });
    }

    // Fallback shouldn't be reached
    return NextResponse.json({ error: "Unhandled action" }, { status: 400 });

  } catch (err) {
    console.error("Failed to update application:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Creator from "@/app/models/creatormodel";
import CreatorApplication from "@/app/models/creatorapplicationmodel";
import OFUser from "@/app/models/usermodel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";
import mongoose from "mongoose";
import { sendAcceptanceEmail, sendRejectionEmail } from "@/lib/email";

export async function POST(request: NextRequest, context: unknown) {
  const { params } = context as { params: { id: string } };
  try {
    // ✅ Only system/admin can approve or reject
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const { action, rejectionReason } = await request.json();
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
    
      // Update OFUser to mark them as creator
      const user = await OFUser.findOneAndUpdate(
        { email: application.email },        // find user by email
        { 
          $set: { 
            creator: true,                  // mark as creator
            username: application.username  // update username to application username
          } 
        },
        { new: true }                        // return the updated document
      );
    
      if (user) {
        const existingCreator = await Creator.findOne({ email: user.email });
        if (!existingCreator) {
          await Creator.create({
            username: application.handle,
            name: application.username,
            email: application.email,
            password: user.password,        // keep only if login depends on it
            bio: application.bio,
            googleId: user.googleId || null,
            avatarKey: application.profilePic || undefined,
            oauthProvider: user.oauthProvider,
            creatorCreatedAt: new Date(),    // set creation date to now
            oauthId: user.oauthId || undefined,
            gender: application.gender,    // make sure your application has this field
            lastUsernameChange: user.lastUsernameChange || undefined,
            price: application.price || 9.99,
            category: application.category || "General",
            subscriptions: [],
            followers: [],
            user: user._id,
            totalEarnings: 0,
            currentBalance: 0,
            country: application.country
          });
        }
      }
      await sendAcceptanceEmail(application.email)
      return NextResponse.json({ message: "Application approved" });
    }

    if (action === "reject") {
      application.status = "rejected";
      application.rejectionReason = rejectionReason; // Save reason in DB
      await application.save();

      await sendRejectionEmail(application.email, rejectionReason); // Make sure function accepts reason
      return NextResponse.json({ message: "Application rejected" });
    }

    return NextResponse.json({ error: "Unhandled action" }, { status: 400 });
  } catch (err) {
    console.error("Failed to update application:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/mongoose';
import OFUser, { VerificationToken } from "@/app/models/usermodel";
import { createVerificationToken } from '@/lib/auth-utils';
import { sendPasswordResetEmail, sendPasswordAddConfirmationEmail } from '@/lib/email';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-client";

const MIN_RESEND_INTERVAL = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const user = await OFUser.findOne({ email });
    if (!user) {
      // Return generic response to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Determine if this is adding a password or resetting
    const isAddingPassword = !user.password || user.password === '';
    const tokenType = isAddingPassword ? 'password_add' : 'password_reset';

    // 🔒 Cooldown check
    if (
      user.lastPasswordResetSentAt &&
      Date.now() - user.lastPasswordResetSentAt.getTime() < MIN_RESEND_INTERVAL
    ) {
      return NextResponse.json(
        { error: 'Please wait before requesting another email.' },
        { status: 429 }
      );
    }

    // 🧹 Remove old tokens of this type
    await VerificationToken.deleteMany({ email, type: tokenType });

    const token = await createVerificationToken(user.id, email, tokenType, 15 * 60 * 1000);
    
    // Send appropriate email based on action type
    if (isAddingPassword) {
      await sendPasswordAddConfirmationEmail(email, token); // link: /add-password?token=abc
    } else {
      await sendPasswordResetEmail(email, token); // link: /reset-password?token=abc
    }

    // ⏱️ Save timestamp
    user.lastPasswordResetSentAt = new Date();
    await user.save();

    return NextResponse.json({ 
      success: true, 
      isAddingPassword,
      message: isAddingPassword ? 'Password setup email sent!' : 'Password reset email sent!'
    });

  } catch (error) {
    console.error('Password action request failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
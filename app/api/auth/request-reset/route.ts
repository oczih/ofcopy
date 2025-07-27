// File: /app/api/auth/request-reset/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/mongoose';
import OFUser, { VerificationToken } from "@/app/models/usermodel";
import { createVerificationToken } from '@/lib/auth-utils';
import { sendPasswordResetEmail } from '@/lib/email'; // Tee tämä funktio erikseen

const MIN_RESEND_INTERVAL = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const user = await OFUser.findOne({ email });
    if (!user) {
      // Neutraali vastaus
      return NextResponse.json({ success: true });
    }

    if (
      user.lastVerificationEmailSentAt &&
      Date.now() - user.lastVerificationEmailSentAt.getTime() < MIN_RESEND_INTERVAL
    ) {
      return NextResponse.json(
        { error: 'Please wait before requesting another reset email.' },
        { status: 429 }
      );
    }

    // Poista vanhat tokenit
    await VerificationToken.deleteMany({ email, type: 'password_reset' });

    const token = await createVerificationToken(email, 'password_reset');

    await sendPasswordResetEmail(email, token); // tämä lähettää linkin, esim. `/reset-password?token=abc`

    user.lastVerificationEmailSentAt = new Date();
    await user.save();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Password reset request failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

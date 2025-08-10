import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import OFUser, { VerificationToken } from '@/app/models/usermodel';
import { createVerificationToken } from '@/lib/auth-utils';
import { sendVerificationEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-client';

const MIN_RESEND_INTERVAL = 5 * 60 * 1000;


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions); // <-- no `request` param in App Router
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await OFUser.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }
    if (
      user.lastVerificationEmailSentAt &&
      Date.now() - user.lastVerificationEmailSentAt.getTime() < MIN_RESEND_INTERVAL
    ) {
      return NextResponse.json(
        { error: 'Please wait before requesting another verification email.' },
        { status: 429 }
      );
    }
    // Delete any existing verification tokens for this email
    await VerificationToken.deleteMany({ email, type: 'email_verification' });

    // Create new verification token
    const verificationToken = await createVerificationToken(
      user._id.toString(),  // or user._id (mongoose should accept both)
      email,
      'email_verification'
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    user.lastVerificationEmailSentAt = new Date();
    await user.save()
    return NextResponse.json({
      message: 'Verification email sent successfully!'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
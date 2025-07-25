import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import OFUser, { VerificationToken } from '@/app/models/usermodel';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=invalid-verification-link`);
    }

    await connectDB();

    // Find verification token
    const verificationRecord = await VerificationToken.findOne({
      email,
      token,
      type: 'email_verification',
      expires: { $gt: new Date() }
    });

    if (!verificationRecord) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=invalid-or-expired-token`);
    }

    // Update user as verified
    const user = await OFUser.findOneAndUpdate(
      { email },
      { 
        emailVerified: true,
        $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 }
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=user-not-found`);
    }

    // Delete verification token
    await VerificationToken.deleteOne({ _id: verificationRecord._id });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?verified=true`);

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=verification-failed`);
  }
}
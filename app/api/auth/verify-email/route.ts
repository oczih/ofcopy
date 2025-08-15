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

    const verificationRecord = await VerificationToken.findOne({
      token,
      expiresAt: { $gt: new Date() } // token not expired
    });

    if (!verificationRecord) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=invalid-or-expired-token`);
    }

    const user = await OFUser.findByIdAndUpdate(
      verificationRecord.userId,
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=user-not-found`);
    }

    await VerificationToken.deleteOne({ _id: verificationRecord._id });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?verified=true`);

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=verification-failed`);
  }
}

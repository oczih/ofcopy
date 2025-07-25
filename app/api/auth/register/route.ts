import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import OFUser from '@/app/models/usermodel';
import { hashPassword, createVerificationToken } from '@/lib/auth-utils';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, name } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await OFUser.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (not verified yet)
    const user = await OFUser.create({
      email,
      password: hashedPassword,
      username,
      name,
      emailVerified: false,
      oauthProvider: 'credentials'
    });

    // Create verification token
    const verificationToken = await createVerificationToken(email, 'email_verification');

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}   
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import OFUser, { VerificationToken } from '@/app/models/usermodel';
import { hashPassword, createVerificationToken } from '@/lib/auth-utils';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Email, username and password are required' }, { status: 400 });
    }

    await connectDB();
    const normalizedEmail = email.trim().toLowerCase();

    // 1️⃣ Check if a verified user already exists
    const existingUser = await OFUser.findOne({ $or: [{ email: normalizedEmail }, { username }] });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 409 });
    }

    // 2️⃣ Check if a pending verification already exists
    const pending = await VerificationToken.findOne({ email: normalizedEmail });
    if (pending) {
      await sendVerificationEmail(email, pending.token);
      return NextResponse.json({
        message: 'A verification email has already been sent. Please check your inbox.'
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await hashPassword(password);

    // 4️⃣ Create verification token and save pending signup info in one step
    const verificationToken = await createVerificationToken(
      null,
      normalizedEmail,
      'email_verification',
      24 * 60 * 60 * 1000
    );

    // Create the actual user
    const user = await OFUser.create({
      email: normalizedEmail,
      username,
      password: hashedPassword,
      emailVerified: false,
      oauthProvider: 'credentials',
      name: username
    });
    if(!user){
      return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
    }
    // 5️⃣ Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      message: 'Registration initiated! Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

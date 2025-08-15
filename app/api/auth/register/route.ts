import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import OFUser from '@/app/models/usermodel';
import { hashPassword, createVerificationToken } from '@/lib/auth-utils';
import { sendVerificationEmail } from '@/lib/email';


export async function POST(request: NextRequest) {
  console.log("bvoddy:", request.body)
  try {
    const { email, password, username } = await request.json();
    console.log('Received username:', username);
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await OFUser.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

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
      email: normalizedEmail,
      password: hashedPassword,
      username,
      name: username,
      emailVerified: false,
      oauthProvider: 'credentials'
    });
    
    // Create verification token
    const verificationToken = await createVerificationToken(user.id, email, 'email_verification', 24 * 60 * 60 * 1000);

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
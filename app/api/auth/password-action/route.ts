import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/mongoose';
import OFUser, { VerificationToken } from "@/app/models/usermodel";
import { createVerificationToken } from '@/lib/auth-utils';
import { sendPasswordResetEmail, sendPasswordAddConfirmationEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-client';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    try {
      const { email, password } = await request.json();
    console.log("email", email)
    console.log("password", password)
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }
  
      await connectDB();
  
      const user = await OFUser.findOne({ email });
      console.log("here's user:", user)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      const isAddingPassword = !user.password || user.password === '';
  
      // Prevent adding password if already exists
      if (isAddingPassword && user.password && user.password !== '') {
        return NextResponse.json({ error: 'User already has a password set' }, { status: 400 });
      }
  
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // Create a token for password confirmation
      const confirmationToken = await createVerificationToken(
        email, 
        'password_confirm',
        15 * 60 * 1000 // 15 minutes
      );
  
      await VerificationToken.findByIdAndUpdate(confirmationToken, {
        tempPassword: hashedPassword,
        originalAction: isAddingPassword ? 'add' : 'reset',
        expiresAt: {
            Date
        }
      });
  
      // Send appropriate email
      if (isAddingPassword) {
        await sendPasswordAddConfirmationEmail(email, confirmationToken);
      } else {
        await sendPasswordResetEmail(email, confirmationToken);
      }
  
      return NextResponse.json({
        success: true,
        isAddingPassword,
        message: isAddingPassword
          ? 'Verification email sent. Please confirm to complete password setup.'
          : 'Verification email sent. Please confirm to complete password reset.',
      });
  
    } catch (error) {
      console.error('Password action failed:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  

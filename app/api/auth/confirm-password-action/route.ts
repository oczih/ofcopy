import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/mongoose';
import OFUser, { VerificationToken } from "@/app/models/usermodel";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await connectDB();

    // Find the confirmation token
    const confirmToken = await VerificationToken.findOne({ 
      token, 
      type: 'password_confirm',
      expiresAt: { $gt: new Date() }
    });

    if (!confirmToken || !confirmToken.tempPassword) {
      return NextResponse.json({ error: 'Invalid or expired confirmation token' }, { status: 400 });
    }

    const user = await OFUser.findOne({ email: confirmToken.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAddingPassword = confirmToken.originalAction === 'add';

    // Additional validation for adding password
    if (isAddingPassword && user.password && user.password !== '') {
      return NextResponse.json({ error: 'User already has a password set' }, { status: 400 });
    }

    // Update the user's password with the stored hashed password
    user.password = confirmToken.tempPassword;
    user.lastPasswordResetSentAt = undefined; // Clear reset timestamp
    
    // If this was adding a password for the first time, mark email as verified
    if (isAddingPassword && !user.emailVerified) {
      user.emailVerified = true;
    }
    
    await user.save();

    // Remove the confirmation token
    await VerificationToken.findByIdAndDelete(confirmToken._id);

    // Also clean up any remaining tokens for this email
    await VerificationToken.deleteMany({ 
      email: confirmToken.email, 
      type: { $in: ['password_reset', 'password_add', 'password_confirm'] }
    });

    const successMessage = isAddingPassword ? 
      'Password setup completed successfully!' : 
      'Password reset confirmed successfully!';

    return NextResponse.json({ 
      success: true, 
      isAddingPassword,
      message: successMessage
    });

  } catch (error) {
    console.error('Password confirmation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
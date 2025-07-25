import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { VerificationToken } from '@/app/models/usermodel';

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createVerificationToken(email: string, type: 'email_verification' | 'password_reset') {
  const token = generateVerificationToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await VerificationToken.create({
    email,
    token,
    expires,
    type
  });

  return token;
}
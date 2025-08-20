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

export async function createVerificationToken(
  userId: string | null,
  email: string,
  type: 'email_verification' | 'password_reset' | 'password_confirm' | 'password_add',
  expiresInMs: number = 24 * 60 * 60 * 1000
) {
  let token: string;
  let exists: string | null;

  // Loop until we find a token that doesn't exist in the DB
  do {
    token = crypto.randomBytes(32).toString('hex');
    exists = await VerificationToken.findOne({ token });
  } while (exists);

  const expiresAt = new Date(Date.now() + expiresInMs);

  await VerificationToken.create({
    userId,
    email,
    token,
    expiresAt,
    type
  });

  return token;
}
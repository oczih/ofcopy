import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
// Import WalkRoute first to ensure it's registered
import OFUser from '@/app/models/usermodel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-client';
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  
  try {
    // tee tähän populate
    const users = await OFUser.find({})
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();

  try {
    const body = await request.json();
    const user = new OFUser(body);
    const savedUser = await user.save();
    return NextResponse.json({ user: savedUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
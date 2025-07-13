import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongoose';
import Creator from '@/app/models/creatormodel';
import { auth } from '@/lib/auth-client';

export async function GET() {
  await connectDB();
  
  /* const session = await auth();
   if (!session) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  } */
  try {
    const creators = await Creator.find({});
    return NextResponse.json(creators);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


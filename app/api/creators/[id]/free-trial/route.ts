// app/api/creators/[id]/free-trial/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Creator from '@/app/models/creatormodel'; // adjust path if needed
import { connectDB } from '@/lib/mongoose';  // your db connection helper

interface Params {
    id: string;
  }
  // 🟢 POST: Add a new promotion
  export async function PUT(
    req: NextRequest,
    context: { params: Promise<Params> }
  ) {
    const { id } = await context.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid creator ID' }, { status: 400 });
    }
  
    await connectDB();
  
    try {
      const body = await req.json();
      const { allowFreeTrial } = body;
  
      if (typeof allowFreeTrial !== 'boolean') {
        return NextResponse.json({ message: 'allowFreeTrial must be a boolean' }, { status: 400 });
      }
  
      const updatedCreator = await Creator.findByIdAndUpdate(
        id,
        { freeTrial: allowFreeTrial },
        { new: true }
      );
  
      if (!updatedCreator) {
        return NextResponse.json({ message: 'Creator not found' }, { status: 404 });
      }
  
      return NextResponse.json({
        message: 'Free trial updated',
        freeTrial: updatedCreator.freeTrial,
      });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }

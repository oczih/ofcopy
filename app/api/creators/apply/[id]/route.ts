import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { CreatorApplication } from '@/app/models/creatormodel';
import OFUser from '@/app/models/usermodel';

export async function POST(req: NextRequest, { params }) {
  try {
    await connectDB();
    const { action } = await req.json();
    const { id } = params;
    const application = await CreatorApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (action === 'accept') {
      application.status = 'approved';
      await application.save();
      // Set user creator status to true
      await OFUser.findOneAndUpdate(
        { email: application.email },
        { $set: { creator: true } }
      );
      return NextResponse.json({ message: 'Application approved' });
    } else if (action === 'reject') {
      application.status = 'rejected';
      await application.save();
      return NextResponse.json({ message: 'Application rejected' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
} 
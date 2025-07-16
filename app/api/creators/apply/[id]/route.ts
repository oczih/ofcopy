import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { CreatorApplication } from '@/app/models/creatormodel';
import OFUser from '@/app/models/usermodel';
import Creator from '@/app/models/creatormodel';

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
      const user = await OFUser.findOneAndUpdate(
        { email: application.email },
        { $set: { creator: true } },
        { new: true }
      );
      // Create a Creator document if it doesn't exist
      if (user) {
        const existingCreator = await Creator.findOne({ email: user.email });
        if (!existingCreator) {
          await Creator.create({
            name: user.name,
            username: user.username,
            email: user.email,
            password: user.password,
            googleId: user.googleId,
            image: user.image,
            oauthProvider: user.oauthProvider,
            oauthId: user.oauthId,
            lastUsernameChange: user.lastUsernameChange,
            subscribers: 0,
            price: 9.99,
            category: 'General',
          });
        }
      }
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
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Creator, { CreatorApplication } from '@/app/models/creatormodel';
import OFUser from '@/app/models/usermodel';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { action } = await req.json();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Missing application ID' }, { status: 400 });
    }

    const application = await CreatorApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (action === 'accept') {
      application.status = 'approved';
      await application.save();

      const user = await OFUser.findOneAndUpdate(
        { email: application.email },
        { $set: { creator: true } },
        { new: true }
      );

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
            user: user._id, // Ensure this field is populated if required by the schema
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
    console.error('Failed to update application:', err);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

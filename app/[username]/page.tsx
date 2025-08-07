import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-client';
import UserModel from '@/app/models/usermodel';
import PurchaseModel from '@/app/models/purchasemodel';
import AppWrapper from '@/components/AppWrapper';
import ProfileContent from '@/components/ProfileContent';
import CreatorModel from '@/app/models/creatormodel'; // Assuming this is your creator model
import { Purchase, Subscription, User } from '../types';

const RESERVED_ROUTES = [
  'discover', 'messages', 'settings', 'subscriptions', 'notifications', 'api', 'components',
  'models', 'services', 'context', 'favicon.ico',
  'globals.css', 'layout.tsx', 'page.tsx', 'public',
  'lib', 'ui', 'auth', 'creators', 'stats', 'media',
  'users', 'upload',
];
interface Params {
  username: string;
}
export default async function UserProfilePage({ params }: { params: Promise<Params>}) {
  const resolvedParams = await params;
  const username = resolvedParams.username.toLowerCase();
  await connectDB();
  const session = await getServerSession(authOptions);
 
  if (RESERVED_ROUTES.includes(username)) notFound();

  const user = await UserModel.findOne({ username });
  if (!user) notFound();
  console.log("useri: ",user)
  const isOwnProfile = session?.user?.username === user.username;

  let relationshipStatus: 'subscriber' | 'follower' | 'none' = 'none';
  let totalSpent = 0;
  let purchasedContent = [];
  let creator = null;

  if (user.creator) {
    creator = await CreatorModel.findOne({ user: user._id });
  
    const viewerId = session?.user?.id;
  
    // Determine relationship regardless of whose profile it is
    if (creator && viewerId) {
      const isSubscriber = Array.isArray(creator.subscriptions) &&
        creator.subscriptions.some((sub: Subscription) => sub.toString() === viewerId);
  
      const isFollower = Array.isArray(creator.followers) &&
        creator.followers.some((fol: User) => fol.id.toString() === viewerId);
  
      if (isSubscriber) {
        relationshipStatus = 'subscriber';
      } else if (isFollower) {
        relationshipStatus = 'follower';
      }
  
      totalSpent = await getTotalSpentOnCreator(viewerId, creator._id.toString());
    }
  }

  if (session?.user?.id) {
    const purchases = await PurchaseModel.find({ userId: session.user.id }).populate('mediaId');
    purchasedContent = purchases.map((p: Purchase) => p.).filter(Boolean);
  }
  
  return (
    <AppWrapper>
      <ProfileContent
        userViewed={user && JSON.parse(JSON.stringify(user)) || null  }
        viewingUser={session?.user && JSON.parse(JSON.stringify(session?.user)) || null}
        purchasedContent={JSON.parse(JSON.stringify(purchasedContent))}
        totalSpent={totalSpent}
        relationshipStatus={relationshipStatus}
        isOwnProfile={isOwnProfile}
      />
    </AppWrapper>
  );
}

async function getTotalSpentOnCreator(viewerId: string, creatorId: string) {
  const purchases = await Purchase.find({ userId: viewerId, creatorId });
  return purchases.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
}

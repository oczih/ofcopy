// ✅ Server Component
import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongoose';
import Media from '@/app/models/mediamodel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-client';
import User from '@/app/models/usermodel';
import Purchase from '@/app/models/purchasemodel';
import AppWrapper from '@/components/AppWrapper';
import ProfileContent from '@/components/ProfileContent';

const RESERVED_ROUTES = [
  'discover', 'messages', 'settings', 'subscriptions', 'notifications', 'api', 'components',
  'models', 'services', 'context', 'favicon.ico',
  'globals.css', 'layout.tsx', 'page.tsx', 'public',
  'lib', 'ui', 'auth', 'creators', 'stats', 'media',
  'users', 'upload',
];

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  await connectDB();

  const session = await getServerSession(authOptions);
  const username = params.username.toLowerCase();

  if (RESERVED_ROUTES.includes(username)) notFound();

  const user = await User.findOne({ username });
  if (!user) notFound();

  const isOwnProfile = session?.user?.username === user.username;
  if (!session && !user.isCreator) redirect('/signup');

  let posts = [];
  let purchasedContent = [];
  let totalSpent = 0;
  let relationshipStatus = 'none';
  let canViewContent = isOwnProfile;

  if (user.isCreator) {
    posts = await Media.find({ creatorId: user._id }).sort({ createdAt: -1 });

    if (!isOwnProfile && session?.user?.id) {
      relationshipStatus = await getUserRelationshipStatus(session.user.id, user._id.toString());
      totalSpent = await getTotalSpentOnCreator(session.user.id, user._id.toString());
      canViewContent = ['subscriber', 'follower'].includes(relationshipStatus);
    }
  }

  if (session?.user?.id) {
    const purchases = await Purchase.find({ userId: session.user.id }).populate('mediaId');
    purchasedContent = purchases.map((p: any) => p.mediaId).filter(Boolean);
  }

  return (
    <AppWrapper>
      <ProfileContent
        user={JSON.parse(JSON.stringify(user))}
        posts={JSON.parse(JSON.stringify(posts))}
        purchasedContent={JSON.parse(JSON.stringify(purchasedContent))}
        totalSpent={totalSpent}
        relationshipStatus={relationshipStatus}
        isOwnProfile={isOwnProfile}
        canViewContent={canViewContent}
      />
    </AppWrapper>
  );
}

async function getUserRelationshipStatus(viewerId: string, creatorId: string) {
  return 'subscriber'; // replace with your own logic
}

async function getTotalSpentOnCreator(viewerId: string, creatorId: string) {
  const purchases = await Purchase.find({ userId: viewerId, creatorId });
  return purchases.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
}


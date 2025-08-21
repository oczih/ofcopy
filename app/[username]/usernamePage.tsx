import { notFound } from 'next/navigation';
import UserModel from '@/app/models/usermodel';
import PurchaseModel from '@/app/models/purchasemodel';
import ProfileContent from '@/components/ProfileContent';
import CreatorModel from '@/app/models/creatormodel';
import { MediaPost, Subscriber, Purchase, Follower, User, Creator } from '../types';
import { PostDocument } from '../models/postmodel';
import { Session } from 'next-auth';
import { deepSanitize } from '@/lib/fetchDataPage';

const RESERVED_ROUTES = [
  'discover', 'messages', 'settings', 'subscriptions', 'notifications', 'api', 'components',
  'models', 'services', 'context', 'favicon.ico', 'globals.css', 'layout.tsx', 'page.tsx', 'public',
  'lib', 'ui', 'auth', 'creators', 'stats', 'media', 'users', 'upload','uploads', 'tos', 'child-policy',
];

interface AppProps {
  creators: Creator[];
  users: User[];
  session: Session | null;
  username: string;
}

export default async function App({ creators, users, session, username }: AppProps) {
  if (RESERVED_ROUTES.some(route => route.toLowerCase() === username.toLowerCase())) notFound();

  const user = await UserModel.findOne({ username: username.toLowerCase() });
  let creator: Creator | null = null;

  if (!user) {
    creator = await CreatorModel.findOne({ username: username.toLowerCase() });
    if (!creator) notFound();
  } else if (user.creator) {
    creator = await CreatorModel.findOne({ user: user._id });
  }

  const isOwnProfile = (() => {
    if (!session?.user) return false;
  
    const sessionUsername = session?.user?.username?.toLowerCase();
  
    if (creator?.user) {
      if (String(session.user._id) === String(creator.user)) {
        return true;
      }
    }
  
    if (user?.username) {
      return sessionUsername === user.username.toLowerCase();
    }
  
    return false;
  })();
  console.log(creator && creator.username)
  console.log(session?.user._id)
  console.log(creator)
  let relationshipStatus: 'subscriber' | 'follower' | 'none' = 'none';
  let totalSpent = 0;
  let purchasedContent: MediaPost[] = [];

  if (creator && session?.user?._id) {
    const viewerId = session.user._id.toString();

    const isSubscriber = Array.isArray(creator.subscribers) &&
      creator.subscribers.some((sub: Subscriber) => sub.userId.toString() === viewerId);

    const isFollower = Array.isArray(creator.followers) &&
      creator.followers.some((fol: Follower) => fol.userId.toString() === viewerId);

    if (isSubscriber) relationshipStatus = 'subscriber';
    else if (isFollower) relationshipStatus = 'follower';

    totalSpent = await getTotalSpentOnCreator(viewerId, creator._id.toString());
  }

  if (session?.user?._id) {
    const purchases = await PurchaseModel.find({ userId: session.user._id }).populate('postId') as Purchase<PostDocument>[];

    purchasedContent = purchases
      .map(p => p.postId)
      .filter((post): post is PostDocument => post && typeof post === 'object' && '_id' in post)
      .map(post => ({
        ...post.toObject(),
        _id: post._id,
      }));
  }
  const sanitizedCreator = creator ? deepSanitize(JSON.parse(JSON.stringify(creator))) : null;
  return (
    <ProfileContent
      userViewed={JSON.parse(JSON.stringify(user || creator))}
      viewingUser={session?.user ? JSON.parse(JSON.stringify(session.user)) : null}
      purchasedContent={purchasedContent}
      totalSpent={totalSpent}
      relationshipStatus={relationshipStatus}
      isOwnProfile={!!isOwnProfile}
      users={users}
      creators={creators}
      session={session}
      creator={sanitizedCreator}
    />
  );
}

async function getTotalSpentOnCreator(viewerId: string, creatorId: string) {
  const purchases = await PurchaseModel.find({ userId: viewerId, creatorId });
  return purchases.reduce((sum: number, p: { price: number }) => sum + (p.price || 0), 0);
}

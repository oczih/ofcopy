import { notFound } from 'next/navigation';
import UserModel from '@/app/models/usermodel';
import PurchaseModel from '@/app/models/purchasemodel';
import ProfileContent from '@/components/ProfileContent';
import CreatorModel from '@/app/models/creatormodel';
import { MediaPost, Subscriber, Purchase, Follower, User, Creator } from '../types';
import { PostDocument } from '../models/postmodel';
import { Session } from 'next-auth';


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

export default async function App({ creators, users, session, username}: AppProps) {
  if (RESERVED_ROUTES.some(route => route.toLowerCase() === username.toLowerCase())) notFound();

  let creator: Creator | null = await CreatorModel
    .findOne({ username })
    .populate("posts")
    .lean<Creator>();

  let user: User | null = null;
  if (!creator) {
    // Person viewed is a normal user
    user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) notFound();
    
    // Optionally, load linked creator if exists
    if (user.creator) {
      creator = await CreatorModel.findOne({ user: user._id });
    }
  } else {
    // Person viewed is a creator
    if (creator.user) {
      user = await UserModel.findById(creator.user);
    }
  }
  const isOwnProfile = (() => {
    if (!session?.user) return false;
    const sessionUsername = session.user.username?.toLowerCase();

    if (creator?.user && String(session.user._id) === String(creator.user)) return true;
    if (user?.username && sessionUsername === user.username.toLowerCase()) return true;
    return false;
  })();

  let relationshipStatus: 'subscriber' | 'follower' | 'none' = 'none';
  const totalSpent = 0;
  let purchasedContent: MediaPost[] = [];
  const creatorId = creators.find((c: Creator) => String(c.user) === String(session?.user?._id));
  if (creator) {
    // Person being viewed is a creator → check if viewingUser is a follower/subscriber
    const viewerId = session?.user?._id;
    if (viewerId) {
      const isSubscriber = creator.subscribers && creator?.subscribers?.some(
        (sub: Subscriber) => String(sub.userId) === String(viewerId)
      );
      const isFollower = creator?.followers?.some(
        (fol: Follower) => String(fol.userId) === String(viewerId)
      );
      if (isSubscriber) relationshipStatus = 'subscriber';
      else if (isFollower) relationshipStatus = 'follower';
    }
  } else if (user && session?.user?.creator) {
    // Person being viewed is a normal user and viewer is a creator → check if user is following viewer's creator profile
    const viewingCreator = creators.find(
      (c: Creator) => c.user === session.user._id
    );
    if (viewingCreator) {
      const isSubscriber = viewingCreator?.subscribers && viewingCreator?.subscribers?.some(
        (sub: Subscriber) => String(sub.userId) === String(user._id)
      );
      const isFollower = viewingCreator.followers?.some(
        fol => String(fol.userId) === String(user._id)
      );
      if (isSubscriber) relationshipStatus = 'subscriber';
      else if (isFollower) relationshipStatus = 'follower';
    }
  }

    
  if (session?.user?._id) {
    const purchases = await PurchaseModel.find({ userId: session.user._id }).populate('postId') as Purchase<PostDocument>[];
    purchasedContent = purchases
      .map(p => p.postId)
      .filter((post): post is PostDocument => post && typeof post === 'object' && '_id' in post)
      .map(post => ({ ...post.toObject(), _id: post._id }));
  }

  const sanitizedCreator = creator ? JSON.parse(JSON.stringify(creator)) : null;


  return (
    <ProfileContent
      userViewed={JSON.parse(JSON.stringify(user || creator))}
      viewingUser={session?.user.creator ? creatorId : session?.user ? JSON.parse(JSON.stringify(session?.user)) : null}
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



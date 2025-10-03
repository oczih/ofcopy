import { notFound } from 'next/navigation';
import UserModel from '@/app/models/usermodel';
import ProfileContent from '@/components/ProfileContent';
import CreatorModel from '@/app/models/creatormodel';
import { Subscriber, Purchase, Follower, User, Creator} from '../types';
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
  purchases: Purchase[]
}

export default async function App({ creators, users, session, username, purchases}: AppProps) {
  if (RESERVED_ROUTES.some(route => route.toLowerCase() === username.toLowerCase())) notFound();
  function normalizeId<T extends { _id?: string; id?: string }>(doc: T | null): T | null {
    if (!doc) return null;
    if (doc.id && !doc._id) {
      doc._id = doc.id;
    }
    delete doc.id;
    return doc;
  }
  
  let creator: Creator | null = await CreatorModel
    .findOne({ username })
    .populate("posts")
    .lean<Creator>();

  let user: User | null = null;
  if (!creator) {
    // Person viewed is a normal user
    user = normalizeId(
      await UserModel.findOne({ username: username.toLowerCase() }).lean<User>()
    );
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

  

  // Sanitize user or creator
  const safeUserOrCreator = JSON.parse(JSON.stringify(user || creator));
  if (safeUserOrCreator.id && !safeUserOrCreator._id) {
    safeUserOrCreator._id = safeUserOrCreator.id;
  }
  const safeSessionUser   = session?.user ? JSON.parse(JSON.stringify(session.user)) : null;
  const safeCreator       = creator ? JSON.parse(JSON.stringify(creator)) : null;
  
  return (
    <ProfileContent
      userViewed={safeUserOrCreator}
      viewingUser={session?.user?.creator ? creatorId : safeSessionUser}
      totalSpent={totalSpent}
      relationshipStatus={relationshipStatus}
      isOwnProfile={!!isOwnProfile}
      users={JSON.parse(JSON.stringify(users))}
      creators={JSON.parse(JSON.stringify(creators))}
      session={JSON.parse(JSON.stringify(session))}
      purchases={JSON.parse(JSON.stringify(purchases))}
      creator={safeCreator}
    />
  );
}



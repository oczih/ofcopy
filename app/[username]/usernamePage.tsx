import { notFound } from 'next/navigation';
import UserModel from '@/app/models/usermodel';
import PurchaseModel from '@/app/models/purchasemodel';
import ProfileContent from '@/components/ProfileContent';
import CreatorModel from '@/app/models/creatormodel'; // Assuming this is your creator model
import { MediaPost,Subscriber, Purchase, Follower, User, Creator } from '../types';
import { PostDocument } from '../models/postmodel';
import { Session } from 'next-auth';

const RESERVED_ROUTES = [
  'discover', 'messages', 'settings', 'subscriptions', 'notifications', 'api', 'components',
  'models', 'services', 'context', 'favicon.ico',
  'globals.css', 'layout.tsx', 'page.tsx', 'public',
  'lib', 'ui', 'auth', 'creators', 'stats', 'media',
  'users', 'upload','uploads'
];
interface AppProps {
    creators: Creator[];
    users: User[];
    session: Session | null;
    username: string;
  }
export default async function App({ creators, users, session, username }: AppProps) {
    if (RESERVED_ROUTES.includes(username)) notFound();
  
    const user = await UserModel.findOne({ username });
    if (!user) notFound();
  
    const isOwnProfile = session?.user?.username === user.username;
  
    let relationshipStatus: 'subscriber' | 'follower' | 'none' = 'none';
    let totalSpent = 0;
    let purchasedContent: MediaPost[] = [];
    let creator = null;
  
    if (user.creator) {
      creator = await CreatorModel.findOne({ user: user._id });
  
      const viewerId = session?.user?.id;
  
      if (creator && viewerId) {
        const isSubscriber = Array.isArray(creator.subscribers) &&
  creator.subscribers.some((sub: Subscriber) => sub.userId.toString() === viewerId);

const isFollower = creator.followers &&
  creator.followers.some((fol: Follower) => fol.userId.toString() === viewerId);
        console.log("isfollower:", isFollower)
        if (isSubscriber) {
          relationshipStatus = 'subscriber';
        } else if (isFollower) {
          relationshipStatus = 'follower';
        }
  
        totalSpent = await getTotalSpentOnCreator(viewerId, creator._id.toString());
      }
    }
  
    function isPostDocument(post: PostDocument): post is PostDocument {
      return post && typeof post === 'object' && '_id' in post;
    }
  
    function transformPostDocumentToMediaPost(postDoc: PostDocument): MediaPost {
      const postObject = postDoc.toObject ? postDoc.toObject() : postDoc;
      return {
        ...postObject,
        _id: postObject._id.toString(),
      };
    }
  
    if (session?.user?.id) {
      // Tell TS that purchases have populated postId as PostDocument or string
      const purchases = await PurchaseModel.find({ userId: session.user.id }).populate('postId') as Purchase<PostDocument>[];
  
      purchasedContent = purchases
        .map(p => p.postId)
        .filter(isPostDocument)
        .map(transformPostDocumentToMediaPost);
    }
  
    return (
        <ProfileContent
          userViewed={user && JSON.parse(JSON.stringify(user)) || null}
          viewingUser={session?.user && JSON.parse(JSON.stringify(session?.user)) || null}
          purchasedContent={purchasedContent}
          totalSpent={totalSpent}
          relationshipStatus={relationshipStatus}
          isOwnProfile={isOwnProfile}
          users={users}
          creators={creators}
          session={session}
        />
    );
  }
  
  async function getTotalSpentOnCreator(viewerId: string, creatorId: string) {
    const purchases = await PurchaseModel.find({ userId: viewerId, creatorId });
    return purchases.reduce((sum: number, p: { price: number }) => sum + p.price, 0);
  }
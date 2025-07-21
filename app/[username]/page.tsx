
import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongoose';
import Media from '../models/mediamodel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-client';
import User from '../models/usermodel';
import Purchase from '@/app/models/purchasemodel';
import Link from 'next/link';
import AppWrapper from "../components/AppWrapper";
const RESERVED_ROUTES = [
  'discover', 'messages', 'settings', 'subscriptions', 'notifications', 'api', 'components',
  'models', 'services', 'context', 'favicon.ico',
  'globals.css', 'layout.tsx', 'page.tsx', 'public',
  'lib', 'ui', 'auth', 'creators', 'stats', 'media',
  'users', 'upload',
];

// Define a type for Media posts
interface MediaPost {
  _id: string;
  title: string;
  s3Key: string;
  type?: string;
  createdAt?: Date;
}
export default async function UserProfilePage({ params }: { params: { username: string } }) {
  return (
    <AppWrapper>
      {await UserProfile({ params: Promise.resolve(params) })}
    </AppWrapper>
  );
}

async function UserProfile({ params: paramsPromise }: { params: Promise<{ username: string }> })  {
  const params = await paramsPromise;
  const session = await getServerSession(authOptions);
  await connectDB();

  const username = params.username.toLowerCase();

  if (RESERVED_ROUTES.includes(username)) {
    notFound();
  }

  const user = await User.findOne({ username });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.username === user.username;

  // If not logged in and viewing a normal user (not creator), redirect to signup
  if (!session && !user.isCreator) {
    redirect('/signup');
  }

  let posts: MediaPost[] = [];
  let totalSpent = 0;
  let relationshipStatus = 'none';

  if (user.isCreator) {
    posts = await Media.find({ creatorId: user._id }).sort({ createdAt: -1 });
    if (!isOwnProfile && session?.user?.id) {
      relationshipStatus = await getUserRelationshipStatus();
      totalSpent = await getTotalSpentOnCreator(session.user.id, user._id.toString());
    }
  }

  return (
    <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8 relative z-10">
      <main className="flex-1">
        <div className="max-w-2xl mx-auto text-white">
            <div className="bg-white/10 rounded-2xl p-8 shadow-xl flex flex-col items-center mb-8">
              <img
                src={user.image || '/default-avatar.png'}
                alt={user.name || user.username}
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-pink-400"
              />
              <h1 className="text-3xl font-bold mb-2">{user.name || user.username}</h1>
              <p className="text-lg text-gray-300 mb-2">@{user.username}</p>

              {isOwnProfile ? (
                <>
                  <Link href="/myprofile/edit" className="bg-pink-500 text-white px-4 py-2 rounded-lg mb-4">Edit Profile</Link>
                  <UserContentToggles />
                </>
              ) : user.isCreator ? (
                <>
                  <span className="inline-block bg-pink-500/20 text-pink-300 px-4 py-1 rounded-full mb-2">Creator</span>
                  <div className="text-sm text-gray-300 mb-2">Status: {relationshipStatus}</div>
                  <div className="text-sm text-gray-300 mb-4">Total Spent: ${totalSpent.toFixed(2)}</div>
                </>
              ) : (
                <>
                  <div className="text-gray-400">This is a regular user.</div>
                </>
              )}
            </div>

            {user.isCreator && (
              <div className="space-y-8">
                {posts.length === 0 ? (
                  <div className="text-center text-gray-400">No posts yet.</div>
                ) : (
                  posts.map((post) => (
                    <PostDisplay key={post._id} post={post} isLoggedIn={!!session} />
                  ))
                )}
              </div>
            )}
          </div>
        </main>
    </div>
  );
}

// Relationship status logic placeholder
async function getUserRelationshipStatus() {
  // TODO: Implement actual logic for follower/subscriber/none
  return 'subscriber';
}

async function getTotalSpentOnCreator(viewerId: string, creatorId: string) {
  const purchases = await Purchase.find({ userId: viewerId, creatorId });
  return purchases.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
}

// Post component rendering image/video
function PostDisplay({ post, isLoggedIn }: { post: MediaPost, isLoggedIn: boolean }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center">
      <div className="w-full flex justify-center">
        {post.type?.startsWith('image') ? (
          <img
            src={isLoggedIn ? `/api/media/get-media?key=${encodeURIComponent(post.s3Key)}` : '/blurred.png'}
            alt={post.title}
            className={`max-w-md max-h-96 rounded-lg shadow-lg ${!isLoggedIn ? 'blur-lg' : ''}`}
          />
        ) : post.type?.startsWith('video') ? (
          <video
            src={isLoggedIn ? `/api/media/get-media?key=${encodeURIComponent(post.s3Key)}` : ''}
            controls={isLoggedIn}
            className={`max-w-md max-h-96 rounded-lg shadow-lg ${!isLoggedIn ? 'blur-lg' : ''}`}
          />
        ) : null}
      </div>
      <div className="mt-4 text-white text-lg text-center font-semibold">
        {isLoggedIn ? post.title : <span className="blur-sm select-none">{post.title}</span>}
      </div>
    </div>
  );
}

// Toggle between purchased content and likes (only for own profile)
function UserContentToggles() {
  return (
    <div className="flex gap-4 mb-4">
      <button className="bg-purple-600 px-3 py-1 rounded">Purchased Content</button>
      <button className="bg-purple-600 px-3 py-1 rounded">Likes</button>
    </div>
  );
}

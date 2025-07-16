import { notFound } from 'next/navigation';
import Creator from '../models/creatormodel';
import { connectDB } from '@/lib/mongoose';
import Media from '../models/mediamodel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-client';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

const RESERVED_ROUTES = [
  'discover', 'messages', 'settings', 'subscriptions', 'notifications', 'api', 'components', 
  'models', 'services', 'context', 'favicon.ico', 
  'globals.css', 'layout.tsx', 'page.tsx', 'public', 
  'lib', 'ui', 'auth', 'creators', 'stats', 'media', 
  'users', 'upload'
];

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const username = params.username;
  if (!username || RESERVED_ROUTES.includes(username.toLowerCase())) {
    notFound();
  }

  await connectDB();
  // Only allow creator usernames
  const creator = await Creator.findOne({ username });
  if (!creator) {
    notFound();
  }

  // Fetch posts for this creator
  const posts = await Media.find({ creatorId: creator._id }).sort({ createdAt: -1 });

  // Get session to determine if user is logged in
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      <Header />
      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8 relative z-10">
        <Sidebar />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 rounded-2xl p-8 shadow-xl flex flex-col items-center mb-8">
              <img
                src={creator.image || '/default-avatar.png'}
                alt={creator.name || creator.username}
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-pink-400"
              />
              <h1 className="text-3xl font-bold text-white mb-2">{creator.name || creator.username}</h1>
              <p className="text-lg text-gray-300 mb-2">@{creator.username}</p>
              <span className="inline-block bg-pink-500/20 text-pink-300 px-4 py-1 rounded-full mb-2">Creator</span>
            </div>
            {/* User Feed */}
            <div className="space-y-8">
              {posts.length === 0 ? (
                <div className="text-center text-gray-400">No posts yet.</div>
              ) : (
                posts.map((post: any) => (
                  <div key={post._id} className="bg-white/10 rounded-2xl p-6 shadow-lg flex flex-col items-center">
                    <div className="w-full flex justify-center">
                      {post.type && post.type.startsWith('image') ? (
                        <img
                          src={isLoggedIn ? `/api/media/get-media?key=${encodeURIComponent(post.s3Key)}` : '/blurred.png'}
                          alt={post.title}
                          className={`max-w-md max-h-96 rounded-lg shadow-lg ${!isLoggedIn ? 'blur-lg' : ''}`}
                        />
                      ) : post.type && post.type.startsWith('video') ? (
                        <video
                          src={isLoggedIn ? `/api/media/get-media?key=${encodeURIComponent(post.s3Key)}` : ''}
                          controls={isLoggedIn}
                          className={`max-w-md max-h-96 rounded-lg shadow-lg ${!isLoggedIn ? 'blur-lg' : ''}`}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : null}
                    </div>
                    <div className="mt-4 text-white text-lg text-center font-semibold">
                      {isLoggedIn ? post.title : <span className="blur-sm select-none">{post.title}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import Creator from '../models/creatormodel';
import { connectDB } from '@/lib/mongoose';

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

  // Render a simple creator profile (customize as needed)
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white/10 rounded-2xl p-8 shadow-xl flex flex-col items-center">
        <img
          src={creator.image || '/default-avatar.png'}
          alt={creator.name || creator.username}
          className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-pink-400"
        />
        <h1 className="text-3xl font-bold text-white mb-2">{creator.name || creator.username}</h1>
        <p className="text-lg text-gray-300 mb-2">@{creator.username}</p>
        <span className="inline-block bg-pink-500/20 text-pink-300 px-4 py-1 rounded-full mb-2">Creator</span>
        <p className="text-gray-400">{creator.email}</p>
        {/* Add more profile info here as needed */}
      </div>
    </div>
  );
}

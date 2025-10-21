'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import creatorservice from '@/app/services/creatorservice';
import { Creator, User } from '@/app/types';
import { ArrowLeft, Check, UserCog, AlertTriangle } from 'lucide-react';
import { Session } from 'next-auth';

interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}

const socialMediaFields = [
  { field: 'instagram', label: 'Instagram', gradient: 'from-pink-500 to-yellow-500' },
  { field: 'twitter',   label: 'Twitter/X', gradient: 'from-sky-400 to-blue-600' },
  { field: 'youtube',   label: 'YouTube',   gradient: 'from-red-500 to-orange-600' },
  { field: 'tiktok',    label: 'TikTok',    gradient: 'from-gray-700 to-gray-900' },
  { field: 'facebook',  label: 'Facebook',  gradient: 'from-blue-500 to-blue-700' },
  { field: 'bluesky',   label: 'Bluesky',   gradient: 'from-blue-300 to-cyan-500' },
];

// ✅ Allowed hostnames
const allowedHosts: Record<string, RegExp> = {
  instagram: /^((www|m)\.)?instagram\.com$/i,
  twitter:   /^((www|mobile)\.)?(twitter\.com|x\.com)$/i,
  youtube:   /^((www|m)\.)?youtube\.com$/i,
  tiktok:    /^((www|m)\.)?tiktok\.com$/i,
  facebook:  /^((www|m)\.)?facebook\.com$/i,
  bluesky:   /^((www|m)\.)?bsky\.app$/i,
};

export default function App({ creators, session }: AppProps) {
  const { status } = useSession();
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // 🔴 Error message
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);
  useEffect(() => {
    if (status !== 'loading') return;
  }, [status]);

  useEffect(() => {
    const fetchData = () => {
      const rightCreator = creators.find((c) => c.user.toString() === session?.user._id.toString());
      if (rightCreator) {
        setCreator(rightCreator);
        setSocials({
          instagram: rightCreator.instagram || '',
          twitter:   rightCreator.twitter || '',
          youtube:   rightCreator.youtube || '',
          tiktok:    rightCreator.tiktok || '',
          facebook:  rightCreator.facebook || '',
          bluesky:   rightCreator.bluesky || '',
        });
      }
    };
    if (session?.user?._id) fetchData();
  }, [session?.user?._id, creators]);

  const handleChange = (field: string, value: string) => {
    setSocials((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ URL validation
  const isValidUrl = (field: string, url: string) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return allowedHosts[field]?.test(parsed.hostname);
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!creator) return;

    for (const [field, link] of Object.entries(socials)) {
      if (link && !isValidUrl(field, link)) {
        // 🔴 Set error and clear after 5 seconds
        setError(`Invalid ${field} link. Please enter a valid ${field} URL.`);
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    setSaving(true);
    try {
      await creatorservice.update(creator._id, { ...creator, ...socials });
      router.push('/myprofile/edit');
    } catch (err) {
      console.error('Error saving social media: ', err);
      setError('Something went wrong while saving.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!session?.user.creator) {
      notFound();
    }
  }, [session]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Social Media Profiles</h1>

      {/* 🔴 Error Message */}
      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 rounded-xl bg-red-600/20 border border-red-500 text-red-300">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-3 hover:bg-white/10 cursor-pointer rounded-xl transition-colors duration-200 text-white group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-200" />
            </button>
            <p className="text-gray-400 text-sm">Add or update your social links</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Save
              </>
            )}
          </button>
        </div>

        {/* Social Inputs */}
        <div className="space-y-4">
          {socialMediaFields.map((sm) => (
            <div
              key={sm.field}
              className="w-full relative overflow-hidden rounded-2xl border-2 border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${sm.gradient} opacity-10`}></div>
              <div className="relative p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10">
                    <UserCog className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{sm.label}</h3>
                </div>
                <input
                  type="url"
                  placeholder={`Enter your ${sm.label} URL`}
                  value={socials[sm.field] || ''}
                  onChange={(e) => handleChange(sm.field, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

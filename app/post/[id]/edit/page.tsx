'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import postservice from '@/app/services/postservice';
import AppWrapper from '@/components/AppWrapper';
import { resolveImageUrl } from '@/components/resolveImageUrl';
import { Post } from '@/app/types';
export default function EditPostPage() {
  return (
    <AppWrapper>
  <EditPost />
  </AppWrapper>
);
}

function EditPost() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params.id;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [caption, setCaption] = useState('');
  const [viewable, setViewable] = useState('followers');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [postUrl, setPostUrl] = useState<string | null>(null);
  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setError('');
      try {
        const fetchedPostResponse = await postservice.getPrivatePostById(postId);
        const fetchedPost = fetchedPostResponse.post;
        if (fetchedPost.s3Key) {
          const res = await fetch('/api/media/download-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ s3Key: fetchedPost.s3Key }),
          });
          const { downloadUrl } = await res.json();
          setPostUrl(downloadUrl);
        }
        setPost(fetchedPost);
        setCaption(fetchedPost.caption || '');
        setViewable(fetchedPost.viewableFor || 'followers');
      } catch (err) {
        console.error(err)
        setError('Failed to load post.');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-white/10 p-8 rounded-xl text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-300">{error || 'Post not found.'}</p>
          <Link href="/" className="text-pink-400 underline mt-4 block">Go back home</Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    try {
      await postservice.updatePrivatePost(postId, { caption, viewableFor: viewable });
      setSaveMessage('Post updated!');
      setTimeout(() => setSaveMessage(''), 2000);
      router.push("/home")
    } catch (err) {
      console.error(err)
      setSaveMessage('Failed to update post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="flex max-w-5xl mx-auto px-4 py-12 gap-8">
        <main className="flex-1 flex flex-col items-center">
          <div className="bg-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center w-full max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-6">Edit Post</h1>
            {/* Image preview */}
            <div className="w-full mb-10">
                <label className="block text-white font-semibold mb-2">Who can view this post?</label>
                <select
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-pink-500"
                  value={viewable}
                  onChange={e => setViewable(e.target.value)}
                >
                  <option value="followers">Followers and Subscribers</option>
                  <option value="subscribers">Subscribers Only</option>
                </select>
              </div>
            <div className="w-full flex justify-center mb-6">
              <div className="relative w-72 h-72 bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden">
                {postUrl ? (
                  <Image
                    src={resolveImageUrl(postUrl) || ""}
                    alt={caption || 'Post image'}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 600px) 100vw, 600px"
                    className="rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>
            </div>
            {/* Edit form */}
            <form onSubmit={handleSave} className="flex flex-col items-center gap-4 w-full max-w-md">
              <div className="w-full">
                <label className="block text-white font-semibold mb-2">Caption</label>
                <textarea
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-pink-500 resize-none"
                  rows={4}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  required
                  maxLength={300}
                />
              </div>
              {saveMessage && <div className={`text-sm ${saveMessage.includes('updated') ? 'text-green-400' : 'text-red-400'}`}>{saveMessage}</div>}
              <div className="flex gap-3 justify-end w-full">
              <Button 
  type="submit" 
  className={`bg-white duration-500 ease-in-out hover:bg-gradient-to-r from-pink-500 to-purple-600 text-gray-900 w-full flex items-center justify-center transition-colors`} 
  disabled={saving}
>
  {saving ? (
    <span className="flex items-center justify-center gap-2 text-white transition-colors">
      <span className="animate-spin inline-block w-5 h-5 border-[3px] border-t-transparent border-white rounded-full"></span>
      Saving...
    </span>
  ) : (
    <span className="transition-colors">Save</span>
  )}
</Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

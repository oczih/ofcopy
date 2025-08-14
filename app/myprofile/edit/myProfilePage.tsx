'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Cropper, { Area } from 'react-easy-crop';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import getCroppedImg from '@/lib/utils'
import userservice from '@/app/services/userservice';
import { uploadContent } from '@/app/services/uploadmediaservice';
import { Skeleton } from "@/components/ui/skeleton";
import { Creator, User } from '@/app/types';
import { Session } from 'next-auth';
interface AppProps {
    creators: Creator[];
    session: Session | null;
    users: User[];
  }
  
export default function App({creators, session}: AppProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null)
  useEffect(() => {
    const fetchCreator = async () => {
      if (!session?.user) return;
      const creator = creators.find((c: Creator) => c.user === session.user._id)
      if(creator) setCreator(creator)
      if(!creator) setCreator(null)
      const avatarKey =
        session.user.creator
          ? creators.find((c: Creator) => c.user === session.user._id)?.avatarKey
          : session.user.avatarKey;
      
      if (!avatarKey) {
        setAvatarUrl(null);
        return;
      }
  
      try {
        setImageLoading(true);
        const key = avatarKey.replace(/^\/+/, ''); // Remove leading slash
        const res = await fetch("/api/media/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: key }),
        });
  
        const data = await res.json();
  
        if (res.ok && data.downloadUrl?.startsWith("https://")) {
          setImageLoading(true);
          setAvatarUrl(data.downloadUrl);
        } else {
          console.error("Invalid download URL:", data.downloadUrl);
        }
      } catch (error) {
        console.error("Error fetching avatar URL:", error);
      } finally {
        setImageLoading(false);
      }
    };
  
    fetchCreator();
  }, [creators, session?.user,
    session?.user?._id,
    session?.user?.creator,
    session?.user?.avatarKey,
    // only changes if a creator's key changes
  ]);
  
  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      setSelectedImage(file)
      setImageLoading(true);
    } else {
      setAvatarUrl(null);
      setImageLoading(false);
    }
  };
  const links = [
    {
      title: 'Profile Info',
      description: 'Edit your name, username, and bio.',
      href: '/myprofile/edit/profile-info',
    },
    {
      title: 'Gender',
      description: 'Set your gender identity.',
      href: '/myprofile/edit/gender',
    },
    {
      title: 'Social Media',
      description: 'Link your social accounts.',
      href: '/myprofile/edit/social-media',
    },
  ];

  return (
    <div>
      <div className="flex max-w-5xl mx-auto px-4 py-12 gap-8">

        <main className="flex-1 flex flex-col items-center gap-8">
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            
          <label htmlFor="profilePicUpload" className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500 shadow-lg mb-3 cursor-pointer">
            <input
              id="profilePicUpload"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("profilePic", e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="relative w-full h-full">
              {avatarUrl && !imageLoading && (
                <Image
                  src={avatarUrl}
                  alt="Profile Picture"
                  fill
                  className="object-cover rounded-full z-10"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              )}
              {imageLoading && (
                <Skeleton className="w-full h-full rounded-none bg-gray-200 dark:bg-gray-700"></Skeleton>
              )}
              {!imageLoading && !avatarUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-white text-3xl rounded-full z-10">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
          </label>

              
            
            <span className="text-gray-300 text-sm">Click icon to change photo</span>
          </div>

          {/* Edit Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {links.map(link => (
              <Card
                key={link.title}
                className="bg-white/10 text-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
              >
                <CardContent className="p-6 flex flex-col gap-3">
                  <h2 className="text-xl font-semibold">{link.title}</h2>
                  <p className="text-sm text-gray-300">{link.description}</p>
                  <Link href={link.href}>
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white mt-2 cursor-pointer">
                      Edit {link.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          {cropModalOpen && selectedImage && (
      <>
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Crop Your Photo</h3>
            <p className="text-gray-300 text-sm">Adjust your profile picture</p>
          </div>
          <button
            onClick={() => setCropModalOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-80 rounded-xl overflow-hidden mb-6 bg-black/20 border border-white/10">
          <Cropper
            image={URL.createObjectURL(selectedImage)}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Zoom</span>
            <span className="text-sm text-white font-medium">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            className="flex-1 px-6 py-3 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            onClick={() => setCropModalOpen(false)}
          >
            Cancel
          </button>
          <button
              className="flex-1 px-6 py-3 rounded-xl cursor-pointer text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
              onClick={async () => {
                try {
                  if (!session?.user?._id) throw new Error("User ID not found");

                  // 1. Get cropped image as a Blob
                  if (!croppedAreaPixels) {
                    console.error("Please select an area to crop.");
                    return;
                  }
                  
                  const croppedBlob = await getCroppedImg(
                    URL.createObjectURL(selectedImage),
                    croppedAreaPixels
                  );

                  // 2. Convert Blob to File (to reuse existing uploadContent logic)
                  const croppedFile = new File([croppedBlob], `${session.user._id}_avatar.jpg`, { type: "image/jpeg" });

                  // 3. Upload to S3
                  const s3Key = await uploadContent(croppedFile);

                  // 4. Construct public S3 URL (via your backend or using known format)
                  

                  // 5. Save avatar URL to user profile
                  await userservice.update(session.user._id, {
                    avatarKey: s3Key,
                  });
                  // 6. Update frontend state
                  const key = creator?.avatarKey?.replace(/^\/+/, ''); // Remove leading slash
                  const res = await fetch("/api/media/download-url", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ s3Key: key }),
                  });
          
                  const data = await res.json();
          
                  if (res.ok && data.downloadUrl && data.downloadUrl.startsWith("https://")) {
                    setAvatarUrl(data.downloadUrl);
                  } else {
                    console.error("Invalid download URL:", data.downloadUrl);
                  }
                  setCropModalOpen(false);
                } catch (err) {
                  console.error("Failed to update user avatar:", err);
                }
              }}
            >
              Apply Changes
            </button>
                    </div>
                  </div>
                </div>
              </>
            )}

        </main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { Sidebar } from '@/app/components/Sidebar';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import AppWrapper from '@/app/components/AppWrapper';

export default function EditProfilePage() {
    return (
        <AppWrapper>
            <EditProfile/>
        </AppWrapper>
    )
}

function EditProfile() {
  const [profilePic, setProfilePic] = useState('/default-profile.png'); // Placeholder image
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewURL = URL.createObjectURL(file);
      setProfilePic(previewURL);
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="flex max-w-5xl mx-auto px-4 py-12 gap-8">
        <Sidebar />

        <main className="flex-1 flex flex-col items-center gap-8">
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500 shadow-lg mb-3">
              <Image
                src={profilePic}
                alt="Profile Picture"
                fill
                className="object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-pink-500 p-1 rounded-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-5 h-5"
                >
                  <path d="M5 20h14a1 1 0 0 0 1-1v-8h-3.586l-2.707-2.707a1 1 0 0 0-1.414 0L9.586 11H5v8a1 1 0 0 0 1 1zm14-12h-3.586l-2.707-2.707a1 1 0 0 0-1.414 0L9.586 8H5V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v4z" />
                </svg>
              </label>
            </div>
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
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white mt-2">
                      Edit {link.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

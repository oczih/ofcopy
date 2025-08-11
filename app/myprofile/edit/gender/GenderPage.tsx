'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import creatorservice from '@/app/services/creatorservice';
import { Creator, User } from '@/app/types';
import { Gender } from '@/app/types';
import { ArrowLeft } from 'lucide-react';
import { Session } from 'next-auth';

interface AppProps {
    creators: Creator[];
    session: Session | null;
    users: User[];
  }
  
export default function App({creators, session}: AppProps) {
    const { status } = useSession()
    const router = useRouter()
    const [creator, setCreator] = useState<Creator | null>(null);
    const [selectedGender, setSelectedGender] = useState<Gender>(creator?.gender || Gender.PreferNotToSay);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status !== 'loading') {
        }
    }, [status]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const rightCreator = creators.find((c: Creator) => c._id === session?.user.id)

                setCreator(rightCreator ?? null);
                if (rightCreator?.gender) {
                    setSelectedGender(rightCreator.gender);
                }
            } catch (error) {
                console.error("Couldn't fetch data: ", error);
                // toast.error("Error fetching data");
            }
        };
        
        if (session?.user?.id) {
            fetchData();
        }
    }, [session?.user?.id, creators]);

    const handleSave = async () => {
        if (!creator) return;
        
        setSaving(true);
        try {
            // Update creator with new gender
            await creatorservice.update(creator._id, { ...creator, gender: selectedGender });
            router.push('/myprofile/edit');
        } catch (error) {
            console.error("Error saving gender: ", error);
            // toast.error("Error saving gender");
        } finally {
            setSaving(false);
        }
    };

    if (!session) {
        // Show a fallback or redirect or login prompt if session not passed
        return <div>Please log in.</div>;
      }

    if (!session?.user) {
        if (typeof window !== "undefined") {
            router.push("/login");
        }
        return null;
    }

    if (!session?.user.creator) {
        if (typeof window !== "undefined") {
            router.push("/home");
        }
        return null;
    }

    const genderOptions = [
        { value: Gender.Male, label: 'Male' },
        { value: Gender.Female, label: 'Female' },
        { value: Gender.Other, label: 'Other' },
        { value: Gender.PreferNotToSay, label: 'Prefer Not To Say' },
    ];

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Gender</h1>
            <div className="flex items-center justify-between gap-4 pb-10">
  <div className="flex items-center gap-3 text-white font-medium">
    <Link href="/myprofile/edit">
            <div className="p-1 hover:bg-white/10 rounded-xl">
            <ArrowLeft />
        </div>
    </Link>
    <h1>Edit Profile</h1>
  </div>

  <button
    onClick={handleSave}
    disabled={saving}
    className="inline-block py-0.5 px-3 text-white rounded-xl font-medium hover:bg-white/10 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
  >
    {saving ? 'Saving...' : 'Save'}
  </button>
</div>

            <div className="space-y-3 mb-8">
                {genderOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setSelectedGender(option.value)}
                        className={`w-full p-4 text-left hover:outline hover:outline-white rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            selectedGender === option.value
                                ? 'outline outline-[#251945] text-white'
                                : 'bg-[#200940] text-white'
                        }`}
                        style={selectedGender === option.value ? { backgroundColor: '#251945' } : {}}
                    >
                        <span className="font-medium">{option.label}</span>
                    </button>
                ))}
            </div>

            
        </div>
    );
}
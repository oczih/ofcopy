'use client';

import Link from 'next/link';
import { SessionProvider, useSession } from 'next-auth/react';
import AppWrapper from '@/components/AppWrapper';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import creatorservice from '@/app/services/creatorservice';
import { Creator } from '@/app/types';
import { Gender } from '@/app/types';
import { ArrowLeft } from 'lucide-react';
export default function EditGenderPage() {
    return (
        <AppWrapper>
            <SessionProvider>
                <EditGender />
            </SessionProvider>
        </AppWrapper>
    )
}

function EditGender() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [creator, setCreator] = useState<Creator | null>(null);
    const [selectedGender, setSelectedGender] = useState<Gender>(creator?.gender || Gender.PreferNotToSay);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status !== 'loading') {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedCreators = await creatorservice.get()
                const rightCreator = fetchedCreators.find((c: Creator) => c.id === session?.user.id)
                setCreator(rightCreator)
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
    }, [session?.user?.id]);

    const handleSave = async () => {
        if (!creator) return;
        
        setSaving(true);
        try {
            // Update creator with new gender
            await creatorservice.update(creator.id, { ...creator, gender: selectedGender });
            router.push('/myprofile/edit');
        } catch (error) {
            console.error("Error saving gender: ", error);
            // toast.error("Error saving gender");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <svg
                    className="animate-spin h-8 w-8 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>
            </div>
        );
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
'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import creatorservice from '@/app/services/creatorservice';
import { Creator, User } from '@/app/types';
import { Gender } from '@/app/types';
import { ArrowLeft, Check, UserCog } from 'lucide-react';
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
                
                const rightCreator = creators.find((c: Creator) => c._id === session?.user._id)

                setCreator(rightCreator ?? null);
                if (rightCreator?.gender) {
                    setSelectedGender(rightCreator.gender);
                }
            } catch (error) {
                console.error("Couldn't fetch data: ", error);
                // toast.error("Error fetching data");
            }
        };
        
        if (session?.user?._id) {
            fetchData();
        }
    }, [session?.user?._id, creators]);

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
        { 
          value: Gender.Male, 
          label: 'Male',
          description: 'Identifies as male',
          gradient: 'from-blue-500 to-blue-600'
        },
        { 
          value: Gender.Female, 
          label: 'Female',
          description: 'Identifies as female',
          gradient: 'from-pink-500 to-rose-600'
        },
        { 
          value: Gender.Other, 
          label: 'Other',
          description: 'Non-binary or other identity',
          gradient: 'from-purple-500 to-indigo-600'
        },
        { 
          value: Gender.PreferNotToSay, 
          label: 'Prefer Not To Say',
          description: 'Keep this information private',
          gradient: 'from-gray-500 to-slate-600'
        },
      ];

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Gender</h1>
            <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-3 hover:bg-white/10 cursor-pointer rounded-xl transition-colors duration-200 text-white group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-200" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Gender Identity</h1>
              <p className="text-gray-400 text-sm">Choose how you identify</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {genderOptions.map((option) => {
            const isSelected = selectedGender === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setSelectedGender(option.value)}
                className={`w-full group cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-white/15 border-2 border-white/30 shadow-2xl' 
                    : 'bg-white/5 border-2 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {/* Selection Indicator Gradient */}
                {isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-10`}></div>
                )}
                
                <div className="relative p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isSelected 
                        ? `bg-gradient-to-r ${option.gradient} shadow-lg scale-110` 
                        : 'bg-white/10 group-hover:bg-white/20'
                    }`}>
                      <UserCog className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="text-left">
                      <h3 className={`text-lg font-semibold transition-all duration-300 ${
                        isSelected 
                          ? 'text-white' 
                          : 'text-gray-200 group-hover:text-white'
                      }`}>
                        {option.label}
                      </h3>
                      <p className={`text-sm transition-colors duration-300 ${
                        isSelected 
                          ? 'text-gray-300' 
                          : 'text-gray-400 group-hover:text-gray-300'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isSelected 
                      ? 'border-white bg-white' 
                      : 'border-gray-400 group-hover:border-white'
                  }`}>
                    {isSelected && (
                      <Check className="w-4 h-4 text-slate-800" />
                    )}
                  </div>
                </div>

                {/* Bottom Accent Line */}
                {isSelected && (
                  <div className={`h-1 bg-gradient-to-r ${option.gradient} opacity-100 transition-opacity duration-300`}></div>
                )}
              </button>
            );
          })}
        </div>
            </div>
            
        </div>
    );
}
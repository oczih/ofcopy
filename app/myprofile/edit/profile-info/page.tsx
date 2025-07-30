'use client'

import creatorservice from "@/app/services/creatorservice";
import userservice from "@/app/services/userservice";
import { Creator } from "@/app/types";
import AppWrapper from "@/components/AppWrapper";
import { ArrowLeft } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";




export default function EditProfileInfoPage() {
    return (
        <AppWrapper>
            <SessionProvider>
                <EditProfileInfo />
            </SessionProvider>
        </AppWrapper>
    )
}


function EditProfileInfo() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [creator, setCreator] = useState<Creator | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    
    const [usernameAvailable, setUsernameAvailable] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        handle: "",
        bio: "",
        location: "",
      });
    const [originalFormData, setOriginalFormData] = useState(formData);
    useEffect(() => {
        if (status !== 'loading') {
            setLoading(false);
        }
    }, [status]);
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
          const initialData = {
            name: session.user.name || "",
            handle: session.user.username || "",
            bio: session.user.bio || "",
            location: session.user.location || "",
          };
          setFormData(initialData);
          setOriginalFormData(initialData);
          setLoading(false);
        }
      }, [status, session?.user]);
    useEffect(() => {
        const checkUsername = async () => {
          if (!formData.handle) return;
      
          try {
            const users = await userservice.get();
            console.log(users)
            const userfound = users.users.find((u) => u.username === formData.handle)
            if(userfound.username === formData.handle) return;
            if(userfound){
              setUsernameAvailable(false)
            }
          } catch (error) {
            console.error("Username check failed", error);
          }
        };
      
        checkUsername();
      }, [formData.handle]);

    const handleSave = async () => {
        if (!session?.user?.id) return;
      
        if (!validateForm()) return;
      
        setSaving(true);
        try {
          await userservice.update(session.user.id, {
            name: formData.name,
            username: formData.handle,
            bio: formData.bio,
            location: formData.location,
          });
      
          router.push('/myprofile/edit');
        } catch (err) {
          console.error("Failed to update profile info:", err);
          setError("Failed to save changes.");
        } finally {
          setSaving(false);
        }
      };
      const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError("");
      };
      const validateForm = () => {
        if (!formData.name || formData.name.trim().length < 2) {
          setError("Name must be at least 2 characters long");
          return false;
        }
      
        if (!formData.handle || formData.handle.length < 3) {
          setError("Handle must be at least 3 characters long");
          return false;
        }
      
        if (!usernameAvailable) {
          setError("Handle is already taken");
          return false;
        }
      
        if (!formData.bio || formData.bio.trim().length < 10) {
          setError("Bio must be at least 10 characters long");
          return false;
        }
      
        if (!formData.location || formData.location.trim().length < 2) {
          setError("Please enter a valid location");
          return false;
        }
      
        return true;
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
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);

    function AutoResizeTextarea({
        value,
        onChange,
        ...props
      }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
      
        useEffect(() => {
          const textarea = textareaRef.current;
          if (textarea) {
            textarea.style.height = "auto"; // Reset height
            textarea.style.height = textarea.scrollHeight + "px"; // Adjust to content
          }
        }, [value]);
      
        return (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            {...props}
            className={`resize-none overflow-hidden min-h-50 ${props.className || ""}`}
          />
        );
      }
    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Profile Info</h1>
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
                    disabled={saving || !hasChanged}
                    className="inline-block py-0.5 px-3 text-white rounded-xl font-medium hover:bg-white/10 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
                    >
                    {saving ? "Saving..." : "Save"}
                    </button>
            </div>
            <div className="space-y-6">
              
              <div>
                <label className="block mb-2 text-white font-medium">Name</label>
                <input
                  type="text"
                  name="displayName"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  className="w-full px-4 py-2 text-white bg-[#200940] hover:outline hover:outline-white rounded-md cursor-text placeholder-gray-400 transition text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-white font-medium">Handle (@username)</label>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">@</span>
                  <input
                    value={formData.handle}
                    onChange={(e) =>
                      handleInputChange("handle", e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                    }
                    placeholder="yourhandle"
                    className="w-full pl-8 pr-4 py-2 text-white bg-[#200940] hover:outline hover:outline-white rounded-md cursor-text placeholder-gray-400 transition text-sm"
                  />
                  {!usernameAvailable && (
  <p className="text-sm text-red-500 mt-1">Username is already taken.</p>
)}
                </div>

              </div>
              <div>
                <label className="block mb-2 text-white font-medium">Bio</label>
                <AutoResizeTextarea
                  name="bio"
                  placeholder="Hello, I'm..."
                  value={formData.bio}
                  
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full px-4 py-2 text-white bg-[#200940] hover:outline hover:outline-white rounded-md cursor-text placeholder-gray-400 transition text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-white font-medium">Location</label>
                <input
                    name="location"
                    placeholder="Sydney, Australia"
                    value={formData.location}
                    className="w-full pl-4 pr-4 py-2 text-white bg-[#200940] hover:outline hover:outline-white rounded-md cursor-text placeholder-gray-400 transition text-sm"
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    />
              </div>
            </div>
        </div>
    )
}
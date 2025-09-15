'use client'

import userservice from "@/app/services/userservice";
import { Creator, User } from "@/app/types";
import { ArrowLeft } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";


interface AppProps {
    creators: Creator[];
    session: Session | null;
    users: User[];
  }

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

export default function App({users, session, creators}: AppProps) {
    const { status } = useSession()
    const router = useRouter()
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
        }
    }, [status]);

    useEffect(() => {
      if (status === "authenticated" && session?.user) {
        const rightCreator = creators.find(c => c.user === session.user._id);
        
        if (rightCreator) {
          const initialData = {
            name: rightCreator.name || "",
            handle: rightCreator.username || "",
            bio: rightCreator.bio || "",
            location:
              typeof session.user.location === "string"
                ? session.user.location
                :  "",
          };
          setFormData(initialData);
          setOriginalFormData(initialData);
        } else if (session.user) {  // only fallback if no creator
          const initialData = {
            name: session.user.name || "",
            handle: session.user.username || "",
            bio: session.user.bio || "",
            location:
              typeof session.user.location === "string"
                ? session.user.location
                :  "",
          };
          setFormData(initialData);
          setOriginalFormData(initialData);
        }
      }
    }, [status, session?.user, creators]);
    
    useEffect(() => {
        const checkUsername = async () => {
          if (!formData.handle) return;
      
          try {
            const userfound = users.find((u) => u.username === formData.handle)
            if(userfound?.username === formData.handle) return;
            if(userfound){
              setUsernameAvailable(false)
            }
          } catch (error) {
            console.error("Username check failed", error);
          }
        };
      
        checkUsername();
      }, [formData.handle, users]);
      const handleSave = async () => {
        if (!session?.user?._id) return;
        if (!validateForm()) return;
      
        setSaving(true);
      
        const rightCreator = creators.find(c => c.user === session.user._id);
        interface UpdateProfilePayload {
          name?: string;
          username?: string;
          bio?: string;
          location?: { country: string };
        }
        const payload: UpdateProfilePayload = {
          name: formData.name,
          bio: formData.bio,
          location: { country: formData.location },
        };
      
        // Only include username if it changed
        let usernameChanging = false;
        if (rightCreator) {
          if (formData.handle !== rightCreator.username) {
            usernameChanging = true;
            payload.username = formData.handle;
          }
        } else {
          if (formData.handle !== session.user.username) {
            usernameChanging = true;
            payload.username = formData.handle;
          }
        }
      
        // Frontend 7-day check for creators
        if (usernameChanging && rightCreator) {
          const lastChange = rightCreator.lastUsernameChange || new Date(0);
          const now = new Date();
          const diffMs = now.getTime() - new Date(lastChange).getTime();
          const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        
          if (diffMs < SEVEN_DAYS) {
            toast.error("Username can only be changed once every 7 days.", {
              duration: 5000, // 5 seconds
            });
            setSaving(false);
            return;
          }
        }
      
        try {
          await userservice.update(
            rightCreator ? rightCreator._id : session.user._id,
            payload
          );
          router.push('/myprofile/edit');
        } catch (err) {
          console.error("Failed to update profile info:", err);
          toast.error("Failed to save changes.", { duration: 5000 });
        } finally {
          setSaving(false);
        }
      };

      const handleInputChange = (field: string, value: string) => {
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
      
        return true;
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
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);


    return (
        <div className="max-w-md mx-auto p-6">
      <Toaster
      position="top-center"
      reverseOrder={false}
    />
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
              {error && (
  <div className="fixed top-5 right-5 bg-red-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
    {error}
  </div>
)}
              <div>
                <label className="block mb-2 text-white font-medium">Name</label>
                <input
  type="text"
  name="name"
  placeholder="John Doe"
  value={formData.name}
  onChange={(e) => handleInputChange("name", e.target.value)}
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
                  <label className="text-sm mb-2 text-gray-500 font-medium">Enter your current location, this will be shown on your profile</label>
              </div>
            </div>
        </div>
    )
}
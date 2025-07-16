"use client";
import * as React from 'react';
import { useState } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { uploadContent } from "@/app/services/uploadmediaservice";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
export default function UploadingPage() {
    return (
      <SessionProvider>
        <UploadPage />
      </SessionProvider>
    );
  }


function UploadPage() {
    const { data: session, status } = useSession();
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [caption, setCaption] = useState<string>("");
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [viewable, setViewable] = useState("followers")
    const router = useRouter();
    const [showDim, setShowDim] = useState(false);
  
    if (status === "loading") return null;
    if (!session?.user.creator) {
      if (typeof window !== "undefined") router.replace("/");
      return null;
    }
  
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const selectedFiles = Array.from(e.target.files ?? []);
      // Optionally filter out duplicates
      const newFiles = selectedFiles.filter(
        file => !files.some(f => f.name === file.name && f.size === file.size)
      );
      setFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [
        ...prev,
        ...newFiles.map(file => URL.createObjectURL(file))
      ]);
    }
  
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (files.length === 0) {
        setMessage("Please select at least one file to upload.");
        return;
      }
      if (!caption.trim()) {
        setMessage("Please enter a caption for your post.");
        return;
      }
      if (!session) {
        setMessage("You must be logged in to upload.");
        return;
      }
      try {
        setUploading(true);
        setMessage("Uploading...");
        for (const file of files) {
          const s3Key = await uploadContent(file);
          await fetch("/api/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              s3Key,
              caption,
              creatorId: session.user.id,
              type: file.type,
            }),
          });
        }
        setMessage(`Upload successful! Uploaded ${files.length} file(s).`);
        setFiles([]);
        setPreviews([]);
        setCaption("");
      } catch (err) {
        console.error("Upload failed", err);
        setMessage("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }
    console.log(previews)
    const handleChange = (event: SelectChangeEvent) => {
      setViewable(event.target.value as string);
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {showDim && (
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowDim(false)}
            aria-label="Dim overlay"
          />
        )}
        <Header />
        <div className="flex max-w-5xl mx-auto px-4 py-12 gap-8">
          <Sidebar />
          <main className="flex-1 flex flex-col items-center">
            <div className="bg-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center w-full max-w-2xl">
              <h1 className="text-3xl font-bold text-white mb-6">Create Post</h1>
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-md">
                {/* Visibility select above file input */}
                <div className="w-full mb-2">
                  <label className="block text-white font-semibold mb-2">Who can view this post?</label>
                  <FormControl fullWidth variant="outlined" size="small">
                    <Select
                      id="viewable-select"
                      value={viewable}
                      onChange={handleChange}
                      onOpen={() => setShowDim(true)}
                      onClose={() => setShowDim(false)}
                      sx={{
                        color: 'white',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                        '.MuiSvgIcon-root': { color: 'white' },
                        backgroundColor: 'transparent',
                        borderRadius: 2,
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'rgba(30, 41, 59, 0.98)',
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <MenuItem value={'followers'}>Followers and Subscribers</MenuItem>
                      <MenuItem value={'subscribers'}>Subscribers</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                {/* File input and preview UI */}
                <div className="flex w-full gap-4 items-center justify-center mb-2">
                  {previews.length === 0 ? (
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-white rounded-xl cursor-pointer bg-white/10 text-pink-300 hover:bg-white/20 transition"
                      onClick={() => setShowDim(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-semibold">Upload from device</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                        onFocus={() => setShowDim(true)}
                        onBlur={() => setShowDim(false)}
                      />
                    </label>
                  ) : (
                    <div className="relative flex flex-col items-center w-48 h-48 justify-center">
                      <button
                        type="button"
                        onClick={() => { setFiles([]); setPreviews([]); }}
                        className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center"
                        aria-label="Remove media"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {files[0].type.startsWith("image") ? (
                        <img src={previews[0]} alt="Preview" className="max-w-xs max-h-64 rounded-xl border border-white/20" />
                      ) : (
                        <video src={previews[0]} controls className="max-w-xs max-h-64 rounded-xl border border-white/20" />
                      )}
                    </div>
                  )}
                </div>
                {/* Caption input */}
                <textarea
                  placeholder="Add a caption for your post..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full p-2 rounded bg-white/5 text-white border border-white/10 hover:border-2 hover:border-white transition-all duration-300 resize-none"
                  disabled={uploading}
                  maxLength={200}
                  rows={3}
                />
                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </form>
            
              {message && <p className="mt-4 text-pink-300">{message}</p>}
            </div>
          </main>
        </div>
      </div>
    );
  }
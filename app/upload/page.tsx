"use client";

import { useState } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { uploadContent } from "@/app/services/uploadmediaservice";

export default function SettingsPage() {
    return (
      <SessionProvider>
        <UploadPage />
      </SessionProvider>
    );
  }


function UploadPage() {
    const { data: session, status } = useSession();
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
  
    if (status === "loading") return null;
    if (!session?.user.creator) {
      if (typeof window !== "undefined") router.replace("/");
      return null;
    }
  
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const selectedFile = e.target.files?.[0] ?? null;
      setFile(selectedFile);
      setMessage("");
    }
  
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!file) {
        setMessage("Please select a file to upload.");
        return;
      }
  
      try {
        setUploading(true);
        setMessage("Uploading...");
        const s3Key = await uploadContent(file);
        setMessage(`Upload successful! File saved as: ${s3Key}`);
        console.log("Uploaded to S3 key:", s3Key);
        // Optionally clear file input or reset state here
        setFile(null);
      } catch (err) {
        console.error("Upload failed", err);
        setMessage("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Header />
        <div className="flex max-w-5xl mx-auto px-4 py-12 gap-8">
          <Sidebar />
          <main className="flex-1">
            <div className="bg-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
              <h1 className="text-3xl font-bold text-white mb-6">Upload Media</h1>
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full max-w-md">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  disabled={uploading}
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
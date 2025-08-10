"use client";
import * as React from 'react';
import { useState } from "react";
import { Button } from "../../components/ui/button";
import {useSession } from "next-auth/react";
import {  useRouter } from "next/navigation";
import { uploadContent } from "@/app/services/uploadmediaservice";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useEffect } from 'react';
import { Creator, User } from '../types';
import Image from 'next/image';

interface AppProps {
    creators: Creator[];
    session: any;
    users: User[];
  }

export default function App({creators, session, users}: AppProps) {
    const { status } = useSession();
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [caption, setCaption] = useState<string>("");
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [viewable, setViewable] = useState("followers");
    const [creator, setCreator] = useState<Creator>();
    const [price, setPrice] = useState<number>(0);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [tempPrice, setTempPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [showDim, setShowDim] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    useEffect(() => {
      const fetchCreators = async () => {
        const rightcreator = creators.find(
          (c: Creator) => c.user === session?.user.id
        );
        if (!rightcreator) {
          return (
            <div>Creator not found</div>
          )
        } else {
          setCreator(rightcreator);
        }
      };
      fetchCreators();
    }, [session?.user.id, router, creators]);
    useEffect(() => {
      if (status !== 'loading') {
        setLoading(false);
      }
    }, [status]);
    useEffect(() => {
      return () => {
        previews.forEach((preview) => URL.revokeObjectURL(preview));
      };
    }, [previews]);
    if (status === "loading") return null;

    if (!session?.user.creator) {
      if (typeof window !== "undefined") router.replace("/");
      return null;
    }
    
    if(loading){
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

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const selectedFiles = Array.from(e.target.files ?? []);
      const newFiles = selectedFiles.filter(
        file => !files.some(f => f.name === file.name && f.size === file.size)
      );
      setFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [
        ...prev,
        ...newFiles.map(file => URL.createObjectURL(file))
      ]);
      setShowDim(false)
    }

    function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
      return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) return resolve(null);
        const img = new window.Image();
        img.onload = function () {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = function () {
          resolve(null);
        };
        img.src = URL.createObjectURL(file);
      });
    }

    // Price modal handlers
    const handleSetPrice = () => {
      setTempPrice(price.toString());
      setIsPriceModalOpen(true);
    };

    const handleSavePrice = () => {
        setPrice(parseFloat(tempPrice) || 0);
      setIsPriceModalOpen(false);
    };

    const handleCancelPrice = () => {
      setIsPriceModalOpen(false);
      setTempPrice('');
    };

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!caption.trim()) {
        setMessage("Please enter a caption for your post.");
        return;
      }
      if (!session) {
        setMessage("You must be logged in to upload.");
        return;
      }
      setUploading(true);
      setMessage("Uploading...");
      try {
        if (files.length === 0) {
          // No files - create a post without media
          const response = await fetch(`/api/media?username=${session?.user?.username}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              s3Key: null,
              caption,
              creatorId: creator?.id,
              type: null,
              viewable,
              width: null,
              height: null,
              price: price ? price : 0,
            }),
          });
      
          if (!response.ok) {
            console.error('Post creation without file failed');
            setMessage("Failed to create post without files.");
            return;
          }
      
          setMessage("Post created without files.");
        } else {
          // Upload files
          const uploadPromises = files.map(async (file) => {
            const s3Key = await uploadContent(file);
            if (!s3Key) {
              console.error("Failed to get s3Key for file:", file.name);
              return;
            }
      
            const dims = await getImageDimensions(file);
            const width = dims?.width || null;
            const height = dims?.height || null;
      
            const response = await fetch(`/api/media?username=${session?.user?.username}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                s3Key,
                caption,
                creatorId: creator?.id,
                type: file.type,
                viewable,
                width,
                height,
                price: price ? price : 0,
              }),
            });
      
            if (!response.ok) {
              console.error('Post creation with file failed');
            }
          });
      
          await Promise.all(uploadPromises);
          setMessage(`Upload successful! Uploaded ${files.length} file(s).`);
        }
      
        // Reset state
        setFiles([]);
        setPreviews([]);
        setCaption("");
        setPrice(0);
        router.push("/");
      } catch (err) {
        console.error("Upload failed", err);
        setMessage("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }      
    }

    const handleChange = (event: SelectChangeEvent) => {
      setViewable(event.target.value as string);
    };
    const triggerFileInput = () => {
      setShowDim(true);
      fileInputRef.current?.click();
    };
    
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {(showDim || isPriceModalOpen) && (
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => {
              setShowDim(false);
              if (isPriceModalOpen) handleCancelPrice();
            }}
            aria-label="Dim overlay"
          />
        )}
        
        <div className="flex max-w-5xl mx-auto px-4 py-12 gap-8">
          <main className="flex-1 flex flex-col items-center">
            <div className="bg-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center w-full max-w-2xl">
              <h1 className="text-3xl font-bold text-white mb-6">Create Post</h1>
              <form onSubmit={handleSubmit} className="flex flex-col items-left gap-4 w-full max-w-md">
                
                {/* Visibility select */}
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
                      onClick={triggerFileInput}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-semibold">Upload from device</span>
                      <input
                          ref={fileInputRef}
                          id="file-upload"
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={uploading}
                          onFocus={() => setShowDim(true)}
                          onBlur={() => setShowDim(false)}  // Triggers when file dialog is closed, including cancel
                        />
                    </label>
                  ) : (
                    <div className="relative flex flex-row gap-2 items-start w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 py-2">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = files.filter((_, i) => i !== index);
                                const newPreviews = previews.filter((_, i) => i !== index);
                                setFiles(newFiles);
                                setPreviews(newPreviews);
                              }}
                              className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove media"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            {files[index]?.type.startsWith("image") ? (
                              <Image
                                src={preview}
                                alt={`Preview ${index}`}
                                className="max-w-xs max-h-40 rounded-xl border border-white/20 mb-2"
                              />
                            ) : (
                              <video
                                src={preview}
                                controls
                                className="max-w-xs max-h-64 rounded-xl border border-white/20 mb-2"
                              />
                            )}
                          </div>
                        ))}
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

                {/* Price Setting Button */}
                <div className="w-1/5 items-start relative flex gap-3">
                <Button
                    type="button"
                    onClick={handleSetPrice}
                    disabled={files.length === 0}
                    className={`flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      files.length === 0
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {price ? `$${price}` : (
                      <div className="flex items-center justify-center gap-3 flex-1 min-w-0">
                      <div className="w-5 h-5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <g data-name="pricetags">
                            <path d="M12.87 22a1.84 1.84 0 0 1-1.29-.53l-6.41-6.42a1 1 0 0 1-.29-.61L4 5.09a1 1 0 0 1 .29-.8 1 1 0 0 1 .8-.29l9.35.88a1 1 0 0 1 .61.29l6.42 6.41a1.82 1.82 0 0 1 0 2.57l-7.32 7.32a1.82 1.82 0 0 1-1.28.53zm-6-8.11 6 6 7.05-7.05-6-6-7.81-.73z"></path>
                            <circle cx="10.5" cy="10.5" r="1.5"></circle>
                          </g>
                        </svg>
                      </div>
                      <div>Add Price</div>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Upload Button */}
                <Button
                  type="submit"
                  disabled={uploading || !caption}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {uploading ? "Uploading..." : "Create Post"}
                </Button>

                {message && (
                  <p className={`text-center text-sm ${
                    message.includes('successful') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {message}
                  </p>
                )}
              </form>
            </div>
          </main>
        </div>

        {/* Price Setting Modal */}
        {isPriceModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 w-full max-w-md mx-4 overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-6 py-4 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-6 h-6 text-pink-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <g data-name="pricetags">
                          <path d="M12.87 22a1.84 1.84 0 0 1-1.29-.53l-6.41-6.42a1 1 0 0 1-.29-.61L4 5.09a1 1 0 0 1 .29-.8 1 1 0 0 1 .8-.29l9.35.88a1 1 0 0 1 .61.29l6.42 6.41a1.82 1.82 0 0 1 0 2.57l-7.32 7.32a1.82 1.82 0 0 1-1.28.53zm-6-8.11 6 6 7.05-7.05-6-6-7.81-.73z"></path>
                          <circle cx="10.5" cy="10.5" r="1.5"></circle>
                        </g>
                      </svg>
                    </div>
                    Set Content Price
                  </h2>
                  <button
                    onClick={handleCancelPrice}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Price Type Selection */}
                <div className="space-y-4">
                  <label className="block text-white font-semibold mb-3">Set A Price</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">💰</span>
                        <span className="text-white group-hover:text-yellow-300 transition-colors">Pay per view</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Price Input */}
              
                  <div className="space-y-3">
                    <label className="block text-white font-semibold">Price (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-lg">$</span>
                      </div>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <p className="text-sm text-gray-400">Minimum price is $0.99</p>
                  </div>
              

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-400 mt-0.5">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="text-blue-300 font-medium mb-1">Pricing Info</p>
                      <p className="text-blue-200">
                        Users will need to purchase this content individually to view it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-white/5 border-t border-white/20 flex gap-3">
                <button
                  onClick={handleCancelPrice}
                  className="flex-1 px-4 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrice}
                  disabled={(!tempPrice || parseFloat(tempPrice) < 0.99)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  Set Price
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
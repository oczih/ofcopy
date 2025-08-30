/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from "react";
import { Send, Tag, CloudUpload, Mic } from "lucide-react";
import SetPriceModal from "./SetPriceModal";
import { VoiceRecordingModal } from "./VoiceRecordingModal";

// -------------------- ChatInput --------------------
type ChatInputProps = {
  messageText: string;
  setMessageText: (val: string) => void;
  files: File[];
  setFiles: (val: File[]) => void;
  previews: string[];
  setPreviews: (val: string[]) => void;
  uploading: boolean;
  handleSendMessage: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setActiveImage: (src: string) => void;
  price: number | null;
  setPrice: (val: number | null) => void;
  isPriceModalOpen: boolean;
  setIsPriceModalOpen: (val: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (val: boolean) => void;
  isVoiceFile: (file: File) => boolean;
};

export function ChatInput({
  messageText,
  setMessageText,
  files,
  setFiles,
  previews,
  setPreviews,
  uploading,
  handleSendMessage,
  handleFileChange,
  setActiveImage,
  price,
  setPrice,
  isPriceModalOpen,
  setIsPriceModalOpen,
  isVoiceModalOpen,
  setIsVoiceModalOpen,
  isVoiceFile
}: ChatInputProps) {
  const [tempPrice, setTempPrice] = useState<string>("");

  return (
    <div className="p-6 border-white/20">

      {/* ---------- Media Preview Section ---------- */}
      {price ? (
        <div className="bg-white/30 rounded-2xl p-4 mb-5 shadow-md">
          <p className="text-white font-semibold mb-3">
            Price to view <span className="font-bold">${price}</span>
          </p>

          <div className="relative flex flex-row gap-2 items-center w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {/* Add more files button */}
            {previews?.length > 0 && <label
              htmlFor="file-upload-more"
              className="flex flex-col items-center justify-center w-20 h-25 outline-2 outline-gray-400 hover:outline-3 rounded-xl cursor-pointer bg-gray-50/50 text-white transition shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="w-8 h-8 mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <input
                id="file-upload-more"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
                }
            {previews?.map((preview, index) => {
              const isVoice = isVoiceFile(files[index]);
              const voiceFullWidth = isVoice && previews?.length === 1;

              return (
                <div
                  key={index}
                  className={`relative group cursor-pointer rounded-xl overflow-hidden border ${price ? "border-gray-300" : "border-white/20"
                    } shrink-0 ${voiceFullWidth ? "w-full h-28" : "w-25 h-25"}`}
                  onClick={() => !isVoice && setActiveImage(preview)}
                >
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newFiles = files.filter((_, i) => i !== index);
                      const newPreviews = previews.filter((_, i) => i !== index);
                      setFiles(newFiles);
                      setPreviews(newPreviews);
                    }}
                    className={`absolute top-1 right-1 z-50 bg-black/60 hover:bg-black/80 text-white cursor-pointer rounded-full flex items-center justify-center transition-opacity ${voiceFullWidth ? "p-2 w-9 h-9" : "p-0.5 w-6 h-6 opacity-0 group-hover:opacity-100"}`}
                    aria-label="Remove media"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24" strokeWidth={2}
                      stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Media Preview */}
                  {isVoice ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-500/70 to-pink-500/70">
                      <svg xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 text-white"
                        fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  ) : files[index]?.type.startsWith("image") ? (
                    <>
                      <div className="absolute inset-0 z-0 bg-center bg-cover filter blur-lg scale-110"
                        style={{ backgroundImage: `url(${preview})` }} />
                      <img src={preview} alt={`Preview ${index}`}
                        className="absolute inset-0 z-10 object-contain w-full h-full" />
                    </>
                  ) : (
                    <video src={preview} controls
                      className="absolute inset-0 z-10 object-contain w-full h-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="relative flex flex-row gap-2 mb-5 items-center w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {/* Add more files button */}
          {previews?.length > 0 && <label
              htmlFor="file-upload-more"
              className="flex flex-col items-center justify-center w-20 h-25 outline-2 outline-gray-400 hover:outline-3 rounded-xl cursor-pointer bg-gray-50/50 text-white transition shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="w-8 h-8 mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <input
                id="file-upload-more"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
                }

          {previews?.map((preview, index) => {
            const isVoice = isVoiceFile(files[index]);
            const voiceFullWidth = isVoice && previews.length === 1;

            return (
              <div
                key={index}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border ${price ? "border-gray-300" : "border-white/20"
                  } shrink-0 ${voiceFullWidth ? "w-full h-28" : "w-25 h-25"}`}
                onClick={() => !isVoice && setActiveImage(preview)}
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newFiles = files.filter((_, i) => i !== index);
                    const newPreviews = previews.filter((_, i) => i !== index);
                    setFiles(newFiles);
                    setPreviews(newPreviews);
                  }}
                  className={`absolute top-1 right-1 z-50 bg-black/60 hover:bg-black/80 text-white cursor-pointer rounded-full flex items-center justify-center transition-opacity ${voiceFullWidth ? "p-2 w-9 h-9" : "p-0.5 w-6 h-6 opacity-0 group-hover:opacity-100"}`}
                  aria-label="Remove media"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" strokeWidth={2}
                    stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Media */}
                {isVoice ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-500/70 to-pink-500/70">
                    <svg xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-white"
                      fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : files[index]?.type.startsWith("image") ? (
                  <>
                    <div className="absolute inset-0 z-0 bg-center bg-cover filter blur-lg scale-110"
                      style={{ backgroundImage: `url(${preview})` }} />
                    <img src={preview} alt={`Preview ${index}`}
                      className="absolute inset-0 z-10 object-contain w-full h-full" />
                  </>
                ) : (
                  <video src={preview} controls
                    className="absolute inset-0 z-10 object-contain w-full h-full" />
                )}
              </div>
            );
          })}
        </div>
      )}
      <VoiceRecordingModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSave={() => setIsVoiceModalOpen(false)}
      />
      {/* ---------- Message Input ---------- */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="w-full bg-white/10 text-white placeholder-gray-400 resize-none outline-none p-3 text-sm min-h-[22px] rounded-2xl"
          />
        </div>
        
      </div>

      {/* ---------- Footer actions ---------- */}
      <div className="">
        <div className="justify-between flex flex-row">
        <div className="flex flex-row items-center gap-4 px-4 py-2">
        <button
          onClick={() => setIsPriceModalOpen(true)}
          disabled={files?.length === 0}
          className="p-2 rounded-full disabled:hover:bg-transparent hover:bg-white/10 disabled:cursor-default disabled:text-gray-500 cursor-pointer transition"
        >
          <Tag />
        </button>
        <div className="p-2 rounded-full cursor-pointer hover:bg-white/10 transition">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
            id="chat-image-upload"
            multiple
          />
          <label htmlFor="chat-image-upload">
            <CloudUpload className="w-6 h-6 text-white" />
          </label>
        </div>
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
          disabled={files?.length > 0}
        >
          <Mic />
        </button>
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!messageText?.trim() && files?.length === 0}
          className="px-4 py-2 rounded-full disabled:hover:bg-transparent hover:bg-white/10 disabled:cursor-default disabled:text-gray-500 cursor-pointer transition"
        >
          <Send />
        </button>
        </div>
      </div>

      {/* ---------- Modals ---------- */}
      <SetPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        tempPrice={tempPrice}
        setTempPrice={setTempPrice}
        onSave={(p) => setPrice(p)}
      />
    </div>
  );
}

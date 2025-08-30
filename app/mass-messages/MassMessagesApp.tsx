"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { Globe, Star, Users, X } from "lucide-react";
import { Creator, User } from "../types";
import { sendMessage } from "@/lib/messages"; // helper
import { supabase } from "@/lib/supabase";
import { ChatInput } from "@/components/ChatInput";
import { motion, AnimatePresence } from "framer-motion";
interface AppProps {
  session: Session | null;
  creators: Creator[];
  users: User[];
}

interface MassMessageModalProps {
  onClose: () => void;
  users: User[];
  creators: Creator[];
  senderId: string;
  session: Session | null;
}


export function MassMessageModal({
  onClose,
  users,
  creators,
  session,
  senderId,
  handleSendMassMessage,
  messageText,
  setMessageText,
  files,
  setFiles,
  previews,
  setPreviews,
  price,
  setPrice,
  isPriceModalOpen,
  setIsPriceModalOpen,
  isVoiceModalOpen,
  setIsVoiceModalOpen,
}: MassMessageModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const rightCreator = creators.find(c => c.user === session?.user._id);

  const toggleCategory = (key: string) => {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const categories = [
    {
      key: "all",
      label: "All",
      count: users.length + creators.length,
      icon: <Globe className="w-4 h-4" />,
    },
    {
      key: "followers",
      label: "Followers",
      count: rightCreator?.followers?.length ?? 0,
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: "subscribers",
      label: "Subscribers",
      count: rightCreator?.subscribers?.length ?? 0,
      icon: <Star className="w-4 h-4" />,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-gradient-to-br from-[#2c0144] to-[#4a0d75] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Send Mass Message</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Category Selectors */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => toggleCategory(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategories.includes(cat.key)
                      ? "bg-pink-500 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-80">({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <ChatInput
              messageText={messageText}
              setMessageText={setMessageText}
              files={files}
              setFiles={setFiles}
              previews={previews}
              setPreviews={setPreviews}
              uploading={false}
              handleSendMessage={handleSendMassMessage}
              handleFileChange={() => {}}
              setActiveImage={() => {}}
              price={price}
              setPrice={setPrice}
              isPriceModalOpen={isPriceModalOpen}
              setIsPriceModalOpen={setIsPriceModalOpen}
              isVoiceModalOpen={isVoiceModalOpen}
              setIsVoiceModalOpen={setIsVoiceModalOpen}
              isVoiceFile={(file) => file.type.startsWith("audio")}
            />
          </div>

         
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface AppProps {
  session: Session | null;
  creators: Creator[];
  users: User[];
}

export default function MassMessageApp({ session, users, creators }: AppProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="border-b flex items-center justify-between border-white px-10 py-2">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Mass Messages
                    </h2>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-3 bg-gradient-to-r cursor-pointer from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl w-fit ml-auto"
        >
          New Mass Message
        </button>
      </div>

      {open && (
        <MassMessageModal
          onClose={() => setOpen(false)}
          users={users}
          creators={creators}
          senderId={session?.user._id ?? ""}
          session={session}
        />
      )}
    </div>
  );
}
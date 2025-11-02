
"use client";

import { SetStateAction, Dispatch, useEffect, useState } from "react";
import { Session } from "next-auth";
import { Globe, Star, Users, X } from "lucide-react";
import { Creator, MessageType, User } from "../types";
import { sendMessage } from "@/lib/messages"; // helper
import { supabase } from "@/lib/supabase";
import { ChatInput } from "@/components/ChatInput";
import { motion, AnimatePresence } from "framer-motion";
import uploadmediaservice from "../services/uploadmediaservice";
import { v4 as uuidv4 } from "uuid";
import { MassMessagesTable } from "@/components/MassMessageTable";
import { notFound, useRouter } from "next/navigation";

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
  handleSendMassMessage: () => void,
  messageText: string;
  setMessageText: (val: string) => void;
  files: File[];
  setFiles: (val: File[]) => void;
  previews: string[];
  setPreviews: (val: string[]) => void;
  handleSendMessage: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setActiveImage: (src: string) => void;
  price: number | null;
  setPrice: Dispatch<SetStateAction<number | null>>;
  isPriceModalOpen: boolean;
  setIsPriceModalOpen: (val: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (val: boolean) => void;
  isVoiceFile: (file: File) => boolean;
  selectedCategories: string[]
  setSelectedCategories: Dispatch<SetStateAction<string[]>>;
}


export function MassMessageModal({
  onClose,
  users,
  creators,
  session,
  handleSendMassMessage,
  messageText,
  setMessageText,
  files,
  setFiles,
  previews,
  setPreviews,
  price,
  setPrice,
  isVoiceModalOpen,
  setIsVoiceModalOpen,
  handleFileChange,
  setActiveImage,
  selectedCategories,
  setSelectedCategories
}: MassMessageModalProps) {
  const rightCreator = creators.find(c => c.user === session?.user._id);

  const toggleCategory = (key: string) => {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const categories = [
    {
      key: "allcontacts",
      label: "All Contacts",
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
                  disabled={cat.key !== "allcontacts" && selectedCategories.includes("allcontacts")}
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
              handleFileChange={handleFileChange}
              setActiveImage={setActiveImage}
              price={price}
              setPrice={setPrice}
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
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [messageText, setMessageText] = useState("");
  const [price, setPrice] = useState<number | null>(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [massMessages, setMassMessages] = useState<MessageType[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);
  useEffect(() => {
    if (!session?.user?.creator) {
      notFound();
    }
  }, [session, router]);

  useEffect(() => {
    const fetchMassMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("ismassmessage", true)
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching mass messages:", error);
        return;
      }
  
      setMassMessages(data || []);
    };
  
    fetchMassMessages();
  }, []);
  useEffect(() => {
    setMassMessages(massMessages); // sync if props change
  }, [massMessages]);

  
  async function getChats({
    selectedCategories,
    users,
    creators,
    sessionUserId,
  }: {
    selectedCategories: string[];
    users: User[];
    creators: Creator[];
    sessionUserId: string;
  }): Promise<string[]> {
    let recipients: string[] = [];
  
    // 1. Collect recipients based on selected categories
    if (selectedCategories.includes("allcontacts")) {
      recipients = [
        ...users.map(u => u._id),
        ...creators.map(c => c.user), // c.user is the creator's userId
      ];
    } else {
      if (selectedCategories.includes("followers")) {
        const creator = creators.find(c => c.user === sessionUserId);
        if (creator?.followers) {
          recipients.push(...creator.followers.map(f => f.userId)); // ✅ extract userId
        }
      }
      if (selectedCategories.includes("subscribers")) {
        const creator = creators.find(c => c.user === sessionUserId);
        if (creator?.subscribers) {
          recipients.push(...creator.subscribers.map(s => s.userId.toString())); // ✅ extract userId
        }
      }
    }
  
    // Remove duplicates + yourself
    recipients = [...new Set(recipients)].filter(id => id !== sessionUserId);
  
    const chatIds: string[] = [];
  
    // 2. For each recipient, find or create a chat
    for (const userId of recipients) {
      const { data: existingChats, error } = await supabase
        .from("chats")
        .select("*")
        .contains("participants", [sessionUserId, userId]) // participants array contains both
        .maybeSingle();
  
      if (error) {
        console.error("Error checking chat:", error);
        continue;
      }
  
      let chatId: string;
  
      if (existingChats) {
        chatId = existingChats.id;
      } else {
        const newChat = {
          id: uuidv4(),
          participants: [sessionUserId, userId],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
  
        const { data, error: insertError } = await supabase
          .from("chats")
          .insert(newChat)
          .select()
          .single();
  
        if (insertError) {
          console.error("Error creating chat:", insertError);
          continue;
        }
  
        chatId = data.id;
      }
  
      chatIds.push(chatId);
    }
  
    return chatIds;
  }
  const handleSendMassMessage = async () => {
    if (!messageText.trim() && files.length === 0) return;
  
    try {
      const chatIds = await getChats({
        selectedCategories,
        users,
        creators,
        sessionUserId: session?.user._id ?? "",
      });
  
      for (const chatId of chatIds) {
        let newMessage: MessageType;
  
        if (files.length > 0) {
          const file = files[0];
          const result = await uploadmediaservice.uploadContent(file);
  
          if ("prohibited" in result) {
            console.log("File is prohibited!");
            continue; // skip this file/chat
          }
  
          const { key, blurred_key } = result; // TS now knows these exist
  
          newMessage = await sendMessage({
            chatId,
            senderId: session?.user._id ?? "",
            content: messageText || "",
            price: price ?? undefined,
            ismassmessage: true,
            image_key: file.type.startsWith("image/") ? key : undefined,
            video_key: file.type.startsWith("video/") ? key : undefined,
            voice_key: file.type.startsWith("audio/") ? key : undefined,
            file_key:
              !file.type.startsWith("image/") &&
              !file.type.startsWith("video/") &&
              !file.type.startsWith("audio/")
                ? key
                : undefined,
            blurred_key,
            size: file.size,
          });
        } else {
          newMessage = await sendMessage({
            chatId,
            senderId: session?.user._id ?? "",
            content: messageText,
            ismassmessage: true,
          });
          if (newMessage) return;
        }
      }
  
      // Reset inputs
      setMessageText("");
      setFiles([]);
      setPreviews([]);
      setPrice(0);
      setOpen(false);
    } catch (err) {
      console.error("Error sending mass message:", err);
    }
  };
  
  
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files ?? []);
    
    // Filter out duplicates
    const newFiles = selectedFiles.filter(
      file => !files.some(f => f.name === file.name && f.size === file.size)
    );
  
    // Filter out files over 200MB
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes
    const oversizedFiles = newFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
     
    }
  
    const validFiles = newFiles.filter(file => file.size <= maxSize);
  
    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [
      ...prev,
      ...validFiles.map(file => URL.createObjectURL(file))
    ]);
    
  }
  return (
    <div>
      <div className="border-b flex items-center justify-between border-gray-500 px-10 py-2">
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
        handleSendMassMessage={handleSendMassMessage}
        setPreviews={setPreviews}
        previews={previews}
        files={files}
        setFiles={setFiles}
        handleFileChange={handleFileChange}
        messageText={messageText}
        setMessageText={setMessageText}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        price={price}                // ✅ pass price
        setPrice={setPrice}  
        setActiveImage={() => ({})}   
        isVoiceModalOpen={false}
        setIsVoiceModalOpen={() => {}}
        isVoiceFile={() => false}
        handleSendMessage={() => ({})}
        isPriceModalOpen={false}
        setIsPriceModalOpen={() => {}}
        // ✅ pass setPrice
      />
      )}
      <div className="mass-messages-container space-y-4 p-4">
      <MassMessagesTable 
        massMessages={massMessages}
        setMassMessages={setMassMessages}
      />
</div>
    </div>
  );
} 
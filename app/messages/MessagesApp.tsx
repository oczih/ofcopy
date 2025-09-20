/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { MessageCircle,  Search, Image as MoreVertical, Phone, Video, Info, X, Package, ChevronLeft, Funnel } from "lucide-react";
import { Chat, Creator, User } from "../types";
import { Session } from "next-auth";
import { subscribeToMessages } from "@/lib/realtime";
import { getChats, getMessages, sendMessage } from "@/lib/messages";
import { Skeleton } from "@/components/ui/skeleton";

import { createPortal } from "react-dom";
import uploadmediaservice from "../services/uploadmediaservice";
import {MessageType }from "@/app/types"
import { useRouter } from "next/navigation";
import { ChatInput } from "@/components/ChatInput";
import { Box, Chip } from "@mui/material";
import PaymentForm from "@/components/PaymentForm";
//import SetPriceModal from "@/components/SetPriceModal";
interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}


export default function ChatApp({ session, users, creators }: AppProps) {
  const [currentChatIdentifier, setCurrentChatIdentifier] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentChatIdentifier");
    }
    return null;
  });
  const [chats, setChats] = useState<Chat[]>([]);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, MessageType[]>>({});
  const [messageText, setMessageText] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [urlCache, setUrlCache] = useState<Record<string, { url: string; timestamp: number }>>({});
  const [chatAvatars, setChatAvatars] = useState<Record<string, string | null>>({});
  const [imageLoading, setImageLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [price, setPrice] = useState<number | null>(0);
  const [uploading, setUploading] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const CACHE_TTL = 15 * 60 * 1000;
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [chatsLoading, setChatsLoading] = useState(true)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [payPostOpen, setPaypostOpen] = useState(false)
  const [currentMessagePrice, setCurrentMessagePrice] = useState<number | null>(null);
  const [showClear, setShowClear] = useState(false)
  //const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const messages = messagesByChat[currentChatIdentifier ?? ""] || [];
  const router = useRouter();
  useEffect(() => {
    const result = chats.filter(chat => {
      if (!activeFilter) return true; // no filter = show all
  
      const chatMessages = messagesByChat[chat.id] ?? [];
      const participant = users.find(
        u => chat.participants.includes(u._id) && u._id !== session?.user?._id
      );
      const creator = creators.find(
        (c: Creator) => c.user.toString() === session?.user._id.toString()
      );
  
      switch (activeFilter) {
        case "Not Answered":
          return (
            chatMessages.some(m => m.sender_id !== session?.user._id) &&
            !chatMessages.some(m => m.sender_id === session?.user._id)
          );
        case "Subscribers":
          return participant?.subscriptions?.some(
            s => s.creatorId.toString() === session?.user?._id.toString()
          );
        case "Followers":
          return participant?.following?.some(
            f => f.creatorId.toString() === creator?._id.toString()
          );
        case "Spent more than $25":
          return (participant?.purchases || []).reduce(
            (sum, p) => sum + (p.price || 0),
            0
          ) > 25;
        case "Has Tipped":
          return participant?.purchases?.some(p => p.price > 0);
        case "Long Conversations (Over 25 messages)":
          return chatMessages.length > 25;
        default:
          return true;
      }
    });
  
    setFilteredChats(result);
  }, [chats, messagesByChat, users, session?.user?._id, creators, activeFilter]);
  useEffect(() => {
    const storedIdentifier = localStorage.getItem("currentChatIdentifier");
    if (storedIdentifier) {
      setCurrentChatIdentifier(storedIdentifier);
    }
  }, []);

  useEffect(() => {
    if (!session?.user?._id) return;
  
    const loadChats = async () => {
      try {
        const userChats = await getChats(session.user._id);
        setChats(userChats);
      } catch (err) {
        console.error(err);
      }finally {
        setChatsLoading(false)
      }
    };
  
    void loadChats();
  }, [session?.user?._id]);

  useEffect(() => {
    const loadAllMessages = async () => {
      try {
        const allMessagesByChat: Record<string, MessageType[]> = {};
  
        for (const chat of chats) {
          const rows = await getMessages(chat.id);
          const mapped: MessageType[] = rows.map(row => ({
            id: String(row.id),
            sender_id: row.sender_id,
            content: row.content,
            created_at: row.created_at,
            chat_id: row.chat_id,
            type: row.image_key
              ? "photo"
              : row.video_key
              ? "video"
              : row.voice_key
              ? "voice"
              : row.file_key
              ? "file"
              : "text",
            image_key: row.image_key,
            video_key: row.video_key,
            voice_key: row.voice_key,
            price: row.price,
            fileKey: row.file_key,
            blurred_key: row.blurred_key,
            duration: row.duration,
            size: row.size,
            viewed: row.viewed ?? [],
            purchased: row.purchased ?? [],
          }));
  
          allMessagesByChat[chat.id] = mapped;
        }
  
        setMessagesByChat(allMessagesByChat);
      } catch (err) {
        console.error("Error loading all messages:", err);
      }
    };
  
    if (chats.length > 0) {
      void loadAllMessages();
    }
  }, [chats]);
  const resolveAvatarUrl = useCallback(
    async (avatarKey: string | null | undefined): Promise<string> => {
      if (!avatarKey) return "";
      if (avatarKey.startsWith("http")) {
        return avatarKey;
      }
  
      // Access the cache once directly
      const cached = urlCache[avatarKey];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.url;
      }

      try {
        const res = await fetch("/api/media/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: avatarKey }),
        });
  
        const data = await res.json();
        if (res.ok && data.downloadUrl?.startsWith("https://")) {
          setUrlCache(prev => ({
            ...prev,
            [avatarKey]: { url: data.downloadUrl, timestamp: Date.now() },
          }));
          return data.downloadUrl;
        }
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
  
      return "/default-avatar.png";
    },
    [CACHE_TTL] // ✅ only depends on stable TTL
  );
  
  const [mediaUrlCache, setMediaUrlCache] = useState<Record<string, { url: string; timestamp: number }>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("mediaUrlCache");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [messageMediaUrls, setMessageMediaUrls] = useState<Record<string, string>>({});
  const resolveMediaUrl = useCallback(
    async (key: string | undefined | null): Promise<string | undefined> => {
      if (!key) return undefined;
  
      const cached = mediaUrlCache[key];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.url;
      }
  
      try {
        const res = await fetch("/api/media/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key: key }),
        });
        const data = await res.json();
        if (res.ok && data.downloadUrl?.startsWith("https://")) {
          const updatedCache = {
            ...mediaUrlCache,
            [key]: { url: data.downloadUrl, timestamp: Date.now() },
          };
          setMediaUrlCache(updatedCache);
          localStorage.setItem("mediaUrlCache", JSON.stringify(updatedCache)); // persist
          return data.downloadUrl;
        }
      } catch (err) {
        console.error("Error fetching media URL:", err);
      }
      return undefined;
    },
    [mediaUrlCache, CACHE_TTL]
  );
  useEffect(() => {
    const loadAvatars = async () => {
      setImageLoading(true);
      try {
        const map: Record<string, string | null> = {}; // allow null
  
        for (const chat of chats) {
          const otherParticipant = users.find(
            u => chat.participants.includes(u._id) && u._id !== session?.user?._id
          );
  
          let avatarKey: string | null | undefined;
  
          if (!otherParticipant) {
            map[chat.id] = null;
            continue;
          }
  
          if (otherParticipant.creator) {
            const creatorObj = creators.find(c => c.user === otherParticipant._id);
            avatarKey = creatorObj?.avatarKey;
          } else {
            avatarKey = otherParticipant.avatarKey;
          }
  
          if (avatarKey) {
            map[chat.id] = await resolveAvatarUrl(avatarKey);
          } else {
            map[chat.id] = null; // fallback
          }
        }
  
        setChatAvatars(map);
      } finally {
        setImageLoading(false);
      }
    };
  
    if (chats.length > 0) void loadAvatars();
  }, [chats, users, creators, session?.user?._id, resolveAvatarUrl]);
  useEffect(() => {
    if (!currentChatIdentifier) return;
    const chatMessages = messagesByChat[currentChatIdentifier] || [];
    if (chatMessages.length === 0) return;
  
    const loadMediaUrls = async () => {
      const updatedUrls: Record<string, string> = { ...messageMediaUrls };
  
      for (const msg of chatMessages) {
        const keys = [msg.blurred_key, msg.image_key, msg.video_key, msg.voice_key, msg.file_key];
        for (const key of keys) {
          if (!key) continue;
  
          // Always fetch, bypassing cache for first load
          if (!updatedUrls[key]) {
            try {
              const url = await resolveMediaUrl(key);
              if (url) updatedUrls[key] = url;
              else console.warn("Failed to resolve key:", key);
            } catch (err) {
              console.error("Error resolving media key:", key, err);
            }
          }
        }
      }
  
      setMessageMediaUrls(prev => ({ ...prev, ...updatedUrls }));
    };
  
    void loadMediaUrls();
  }, [messages, resolveMediaUrl]);
  useEffect(() => {
    if (!currentChatIdentifier || !session?.user?._id) return;
  
    const selectedChat = chats.find(c => c.id === currentChatIdentifier);
    if (!selectedChat) return;
  
    const loadMessages = async () => {
      try {
        const rows = await getMessages(selectedChat.id);
        const mapped: MessageType[] = rows.map(row => ({
          id: String(row.id),
          sender_id: row.sender_id,
          content: row.content,
          created_at: row.created_at,
          chat_id: row.chat_id,
          type: row.image_key
            ? "photo"
            : row.video_key
            ? "video"
            : row.voice_key
            ? "voice"
            : row.file_key
            ? "file"
            : "text",
          image_key: row.image_key,
          video_key: row.video_key,
          voice_key: row.voice_key,
          price: row.price,
          fileKey: row.file_key,
          blurred_key: row.blurred_key,
          duration: row.duration,
          size: row.size,
          viewed: row.viewed ?? [],
          purchased: row.purchased ?? [],
        }));
        setMessagesByChat(prev => ({
          ...prev,
          [selectedChat.id]: mapped,
        }));
      } catch (err) {
        console.error(err);
      }
    };
  
    void loadMessages();
  
    const subscription = subscribeToMessages(selectedChat.id, (msg: MessageType) => {
      setMessagesByChat(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), msg],
      }));
    });
  
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [currentChatIdentifier, chats, session?.user?._id]);
  
  
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messagesByChat]);
 
  const handleConversationClick = (chat: Chat) => {
    setCurrentChatIdentifier(chat.id);
    localStorage.setItem("currentChatIdentifier", chat.id);
  
    // On mobile, switch from the conversation list to the chat view
    if (window.innerWidth < 768) { // md breakpoint
      setMobileView("chat");
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && files.length === 0) return;
    if (!currentChatIdentifier) return; // ✅ guard against null
  
    setUploading(true);
    try {
      let newMessage: MessageType;
  
      // Case 1: Sending media
      if (files.length > 0) {
        const file = files[0]; // one file per message (extend later if needed)
        const { key, blurred_key } = await uploadmediaservice.uploadContent(file);
  
        newMessage = await sendMessage({
          chatId: currentChatIdentifier, // ✅ FIXED
          senderId: session?.user._id ?? "",
          content: messageText || "",
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
        // Case 2: Plain text
        newMessage = await sendMessage({
          chatId: currentChatIdentifier, // ✅ FIXED
          senderId: session?.user._id ?? "",
          content: messageText,
        });
      }
  
      setMessagesByChat(prev => ({
        ...prev,
        [currentChatIdentifier]: [...(prev[currentChatIdentifier] || []), newMessage],
      }));

      // Reset inputs
      setMessageText("");
      setFiles([]);
      setPreviews([]);
      setPrice(0);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setUploading(false);
    }
  };
  const selectedChat = chats.find(c => c.id === currentChatIdentifier);
  const otherParticipant = selectedChat
    ? users.find(u => selectedChat.participants.includes(u._id) && u._id !== session?.user?._id)
    : null;
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (otherParticipant) {
      if (otherParticipant.avatarKey) {
        resolveAvatarUrl(otherParticipant.avatarKey).then(setOtherAvatar);
      } else {
        setOtherAvatar(null); // no avatar key
      }
    }
  }, [otherParticipant, resolveAvatarUrl]);
  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Helper function to check if we need a date divider
  const shouldShowDateDivider = (currentMsg: MessageType, previousMsg: MessageType | undefined) => {
    if (!previousMsg) return true;
    
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const previousDate = new Date(previousMsg.created_at).toDateString();
    
    return currentDate !== previousDate;
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
  const isVoiceFile = (file: File) => file.type.startsWith("audio");
  return (
    <div className="min-h-screen">
      {/* Main Chat Interface - Full Screen */}
      <div className="h-screen">
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl backdrop-blur-xl overflow-hidden h-full">
          <div className="flex h-full">
  
            {/* Conversations Sidebar */}
            <div className={`w-96 border-r border-white/20 bg-gradient-to-b from-white/5 to-white/10 
                  ${mobileView === "chat" ? "hidden" : "block"} md:block`}>
              {/* Sidebar Header */}
              <div className="p-8 border-b border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Conversations
                    </h2>
                    <p className="text-gray-400 text-sm">Stay connected with creators</p>
                  </div>
                </div>
  
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-blue-400" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl shadow-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
  
                {session?.user.creator && (
                  <div className="p-2 flex flex-row justify-between gap-2">
  {/* Mass Message Button */}
  <button
    onClick={() => router.push("/mass-messages")}
    className="rounded-full bg-white/30 hover:bg-white/50 cursor-pointer transition-colors"
    disabled={files.length > 0}
  >
    <Chip
      label={
        <span className="flex items-center gap-2 text-white">
          <Package className="w-5 h-5" />
          Send a mass message
        </span>
      }
    />
  </button>

  {/* Filter Button */}
  <button
    onClick={() => setIsFilterModalOpen(true)}
    className="rounded-full bg-white/30 hover:bg-white/50 cursor-pointer transition-colors"
  >
    <Chip
      label={
        <span className="flex items-center gap-2 text-white">
          <Funnel className="w-5 h-5" />
          Filters
        </span>
      }
    />
  </button>
</div>
)}
{isFilterModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white/10 rounded-2xl p-6 shadow-xl max-w-md w-full">
      <h2 className="text-lg font-semibold mb-4">Filter Conversations</h2>

      {/* Example filter options */}
      <div className="space-y-3">
  {[
    "Not Answered",
    "Subscribers",
    "Followers",
    "Spent more than $25",
    "Has Tipped",
    "Long Conversations (Over 25 messages)",
  ].map((label, idx) => (
    <label
      key={idx}
      className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors duration-200"
    >
      <input
        type="radio"
        name="chatFilter"
        checked={activeFilter === label}
        onChange={() => setActiveFilter(label)}
        className="appearance-none w-4 h-4 rounded-full border border-gray-400 checked:bg-white hover:border-white transition-colors duration-200"
      />
      {label}
    </label>
  ))}
</div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          onClick={() => setIsFilterModalOpen(false)}
          className="px-4 py-2 rounded-xl text-white bg-white/10 cursor-pointer hover:bg-white/20 transition-colors duration-200"
        >
          Cancel
        </button>
        {activeFilter && (
          <button
            onClick={() => {
              setActiveFilter(null);
              setIsFilterModalOpen(false);
            }}
            className="px-4 py-2 rounded-xl text-white bg-white/10 cursor-pointer hover:bg-white/20 transition-colors duration-200"
          >
            Clear Filters
          </button>
        )}
        <button
          onClick={() => {
            // TODO: apply filters here
            setIsFilterModalOpen(false);
          }}
          className="px-4 py-2 rounded-xl cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
)}
              </div>
  
              {/* Conversations List */}
              <div className="overflow-y-auto flex-1 p-4">
                {chatsLoading ? (<div className="space-y-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4"
      >
        {/* Avatar Skeleton */}
        {imageLoading &&
          <Skeleton className="w-14 h-14 rounded-full bg-gray-300/20" />}

        {/* Text Skeletons */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded bg-gray-300/20" /> {/* Name */}
            <Skeleton className="h-3 w-10 rounded bg-gray-300/20" /> {/* Time */}
          </div>
          <Skeleton className="h-3 w-48 rounded bg-gray-300/20" /> {/* Last message */}
        </div>
      </div>
    ))}
  </div>) 
                :
                chats.length > 0 ? (
                  <div className="space-y-2">
                    {filteredChats.map(chat => {
  const chatMessages = messagesByChat[chat.id] ?? [];
  const lastMessage = chatMessages[chatMessages.length - 1];
  const participant = users.find(
    u => chat.participants.includes(u._id) && u._id !== session?.user?._id
  );

  return (
    <div
      key={chat.id}
      className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:scale-[1.02] group ${
        currentChatIdentifier === chat.id
          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg"
          : "bg-white/5 border border-white/10"
      }`}
      onClick={() => handleConversationClick(chat)}
    >
      <div className="flex items-center gap-3">
        {chatAvatars[chat.id] ? <img
          src={chatAvatars[chat.id] || ""}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
         : <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl border-2 border-pink-500/40 shadow-lg">
         {participant?.name?.charAt(0).toUpperCase() || "U"}
       </div>}
        <div className="flex-1">
          <div className="font-semibold text-white">
            {participant?.name || "Unknown"}
          </div>
          {lastMessage && (
            <div className="text-sm text-gray-400 truncate">
              {lastMessage.content || lastMessage.type}
            </div>
          )}
        </div>
      </div>
    </div>
  );
})}

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No conversations yet</h3>
                    <p className="text-gray-400 text-sm">Start a conversation with a creator</p>
                  </div>
                )}
              </div>
            </div>
  
            {/* Chat Area */}
            <div className="flex flex-col flex-1">
              {selectedChat && otherParticipant ? (
                <>
                  {/* Chat Header */}
                  <div className="p-8 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
                    <div className="flex items-center justify-between">
                    <div className="md:hidden">
                        <button 
                          onClick={() => setMobileView("list")} 
                          className="flex items-center gap-2 text-white"
                        >
                          <ChevronLeft className="w-6 h-6"/>
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                      <div className="relative">
                        {otherAvatar ? (
                          <img
                            src={otherAvatar}
                            alt={otherParticipant?.username || "User Avatar"}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl border-2 border-pink-500/40 shadow-lg">
                            {otherParticipant?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white/20 shadow-lg"></div>
                      </div>
                        <div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {otherParticipant.username}
                          </h3>
                          <p className="text-green-400 text-sm font-medium">Online now</p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all duration-300 rounded-xl p-3">
                          <Phone className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all duration-300 rounded-xl p-3">
                          <Video className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all duration-300 rounded-xl p-3">
                          <Info className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all duration-300 rounded-xl p-3">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
  
                  {/* Messages Area */}
                  <Box
  ref={chatContainerRef}
  className="flex-1 p-6 space-y-4 overflow-y-auto"
  sx={{
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: '8px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    scrollbarWidth: 'thin',                // Firefox
    scrollbarColor: 'rgba(255,255,255,0.3) transparent',
  }}
>
{messages.map((message, index) => {
  const isOwn = message.sender_id === session?.user?._id;
  const previousMessage = index > 0 ? messages[index - 1] : undefined;
  const showDateDivider = shouldShowDateDivider(message, previousMessage);

  return (
    <div key={message.id} className="flex flex-col">
      {/* Date divider */}
      {showDateDivider && (
        <div className="flex items-center justify-center my-4">
          <span className="text-xs font-medium text-gray-300">
            {formatDate(message.created_at)}
          </span>
        </div>
      )}

      {/* Message row */}
      <div className={`flex items-end ${isOwn ? "justify-end" : "justify-start"} space-x-2`}>
        {/* Avatar for other participant */}
        {!isOwn && (
          <div className="flex-shrink-0">
            {otherAvatar ? (
              <img
                src={otherAvatar}
                alt={otherParticipant?.username || "User Avatar"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl border-2 border-pink-500/40 shadow-lg">
                {otherParticipant?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className="flex flex-col max-w-xl lg:max-w-md">
  <div
    className={`relative rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md inline-block ${
      isOwn
        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
        : "bg-gradient-to-br from-white/15 to-white/10 text-white border border-white/10"
    }`}
  >
    {/* Photo / Video */}
    {(message.type === "photo" || message.type === "video") && message.image_key && (
      <div className="relative">
        {/* Select source */}
        {message.type === "photo" && !message.price && (
          <img
            src={
              // ✅ RULE: Other participant's photo with *no price* → show blurred
              (!isOwn && !message.price && message.blurred_key && !showClear)
                ? messageMediaUrls[message.blurred_key]
                : messageMediaUrls[message.image_key]
            }
            alt="Sent image"
            className={`rounded-2xl object-cover ${
              message.content ? "max-w-full max-h-64" : "max-w-[250px] max-h-[250px]"
            }`}
            onClick={() =>
              // ✅ Only allow full-screen if media is already revealed
              (!message.price && (isOwn || showClear)) &&
              message.image_key && setActiveImage(messageMediaUrls[message.image_key])
            }
          />
        )}
      {message.type === "photo" && message.price && (
              <img
                src={
                  // ✅ RULE: Other participant's photo with *no price* → show blurred
                  (!isOwn && message.price && message.blurred_key && !showClear)
                    ? messageMediaUrls[message.blurred_key]
                    : messageMediaUrls[message.image_key]
                }
                alt="Sent image"
                className={`rounded-2xl object-cover ${
                  message.content ? "max-w-full max-h-64" : "max-w-[250px] max-h-[250px]"
                }`}
                onClick={() =>
                  // ✅ Only allow full-screen if media is already revealed
                  (!message.price && (isOwn || showClear)) &&
                  message.image_key && setActiveImage(messageMediaUrls[message.image_key])
                }
              />
            )}
        {message.type === "video" && message.video_key && (
          <video
            src={
              (!isOwn && !message.price && message.blurred_key && !showClear)
                ? messageMediaUrls[message.blurred_key]
                : messageMediaUrls[message.video_key]
            }
            controls={(!message.price && (isOwn || showClear))}
            className={`rounded-2xl ${
              message.content ? "max-w-full max-h-64" : "w-full h-auto"
            }`}
          />
        )}

        {/* ✅ Overlay timestamp when NO caption */}
        {!message.content && (
          <span className="absolute bottom-2 right-3 text-xs bg-black/50 text-white px-2 py-1 rounded-full">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}

        {/* ✅ Paywall overlay */}
        {message.price && !isOwn && (
          <button
            className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm font-semibold rounded-2xl hover:bg-black/70"
            onClick={() => {
              setCurrentMessagePrice(message.price || null);
              setPaypostOpen(true);
            }}
          >
            ${message.price} to view
          </button>
        )}

        {/* ✅ “Show media” button for blurred non-paid images */}
        {!isOwn &&
          !message.price &&
          message.blurred_key &&
          !showClear && (
            <button
              className="absolute cursor-pointer bottom-2 left-2 px-3 py-1 bg-black/60 hover:bg-black/80 text-white text-sm rounded-xl"
              onClick={() => {
                // you can manage local state or a DB flag; here we mutate in-place
                setShowClear(true)
                setMessagesByChat((prev) => ({ ...prev }))
              }
              }
            >
              Show media
            </button>
          )}
      </div>
    )}

    {/* Voice */}
    {message.type === "voice" && message.voice_key && (
      <div className="w-48 relative">
        <audio
          controls={!message.price}
          src={messageMediaUrls[message.voice_key]}
          className="w-full"
        />
        {message.price && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl text-white text-sm font-semibold">
            🔒 Pay to listen
          </div>
        )}
      </div>
    )}

    {/* Text caption */}
    {message.content && (
      <div className="p-2">
        <p className="text-sm leading-relaxed break-words">{message.content}</p>

        {/* Regular timestamp if there *is* a caption */}
        <span
          className={`block mt-1 text-xs text-right ${
            isOwn ? "text-blue-100/70" : "text-gray-400/70"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    )}
  </div>

  {/* ✅ Price status (sender only) */}
  {isOwn && message.price && (
    <span className="text-gray-400 text-sm mt-1">
      ${message.price.toFixed(2)} not paid yet
    </span>
  )}
</div>

      </div>
    </div>
  );
})}

                  </Box >
                    {payPostOpen && otherParticipant.creator && (
                      <PaymentForm 
                      type="message"
                      onClose={() => {
                        setPaypostOpen(false)
                        setCurrentMessagePrice(null)
                      }}
                      open={payPostOpen}
                      creator={creators?.find(c => c.user === otherParticipant._id) || null}
                      avatarUrl={
                        currentChatIdentifier ? chatAvatars[currentChatIdentifier] ?? null : null
                      }
                      price={currentMessagePrice}
                      session={session}
                    />
                    )}
                  {/* Active Image Portal */}
                  {activeImage &&
                    createPortal(
                      <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center" onClick={() => setActiveImage(null)}>
                        <button
                          className="absolute top-4 right-4 p-2 rounded-full bg-white/30 hover:bg-white/60 transition cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setActiveImage(null); }}
                        >
                          <X className="w-6 h-6 text-white" />
                        </button>
                        <img src={activeImage} alt="Full size" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
                      </div>,
                      document.body
                    )}
                    
                  {/* Message Input */}
                  <ChatInput
                      messageText={messageText}
                      setMessageText={setMessageText}
                      files={files}
                      setFiles={setFiles}
                      previews={previews}
                      setPreviews={setPreviews}
                      uploading={uploading}
                      handleSendMessage={handleSendMessage}
                      handleFileChange={handleFileChange}
                      setActiveImage={setActiveImage}
                      price={price}
                      setPrice={setPrice}                       // <-- add this          // <-- or use state
                      isVoiceModalOpen={isVoiceModalOpen}
                      setIsVoiceModalOpen={setIsVoiceModalOpen}
                      isVoiceFile={isVoiceFile}
                      />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
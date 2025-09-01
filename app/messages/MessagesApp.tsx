/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { MessageCircle,  Search, Image as MoreVertical, Phone, Video, Info, X, Package } from "lucide-react";
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
import SetPriceModal from "@/components/SetPriceModal";
interface AppProps {
  creators: Creator[];
  session: Session | null;
  users: User[];
}


export default function ChatApp({ session, users }: AppProps) {
  const [currentChatIdentifier, setCurrentChatIdentifier] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentChatIdentifier");
    }
    return null;
  });
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageText, setMessageText] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [urlCache, setUrlCache] = useState<Record<string, { url: string; timestamp: number }>>({});
  const [chatAvatars, setChatAvatars] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const CACHE_TTL = 15 * 60 * 1000;
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const router = useRouter();
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
      }
    };
  
    void loadChats();
  }, [session?.user?._id]);

  useEffect(() => {
    if (!currentChatIdentifier) return;
  
    const loadMessages = async () => {
      try {
        const rows: SupabaseMessage[] = await getMessages(currentChatIdentifier);
        const mapped: MessageType[] = rows.map((row) => ({
          id: String(row.id),
          sender_id: row.sender_id,
          content: row.content,
          created_at: row.created_at,
          type: row.image_key
            ? "photo"
            : row.video_key
            ? "video"
            : row.voice_key
            ? "voice"
            : row.file_key
            ? "file"
            : "text",
          image_key: row.image_key ?? undefined,
          video_key: row.video_key ?? undefined,
          price: row.price ?? undefined,
          voice_key: row.voice_key ?? undefined,
          fileKey: row.file_key ?? undefined,
          blurred_key: row.blurred_key ?? undefined,
          duration: row.duration ?? undefined,
          size: row.size ?? undefined,
        }));
  
        setMessages(mapped);
      } catch (err) {
        console.error(err);
      }
    };
  
    void loadMessages();
  }, [currentChatIdentifier]);

  const resolveAvatarUrl = useCallback(
    async (avatarKey: string | null | undefined): Promise<string> => {
      if (!avatarKey) return "/default-avatar.png";
  
      if (avatarKey.startsWith("http")) {
        return avatarKey;
      }
  
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
    [urlCache, CACHE_TTL]
  );
  const [mediaUrlCache, setMediaUrlCache] = useState<Record<string, { url: string; timestamp: number }>>({});
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
          setMediaUrlCache(prev => ({
            ...prev,
            [key]: { url: data.downloadUrl, timestamp: Date.now() },
          }));
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
          if (otherParticipant?.avatarKey) {
            map[chat.id] = await resolveAvatarUrl(otherParticipant.avatarKey);
          } else {
            map[chat.id] = null; // no avatar
          }
        }
        setChatAvatars(map);
      } finally {
        setImageLoading(false);
      }
    };
  
    if (chats.length > 0) void loadAvatars();
  }, [chats, users, session?.user?._id, resolveAvatarUrl]);
  useEffect(() => {
    if (messages.length === 0) return;
  
    const loadMediaUrls = async () => {
      const updatedUrls: Record<string, string> = { ...messageMediaUrls };
  
      for (const msg of messages) {
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
  
      setMessageMediaUrls(updatedUrls);
    };
  
    void loadMediaUrls();
  }, [messages]);
      console.log(messageMediaUrls)
  type SupabaseMessageRealtime = {
    id: number;
    chat_id: string;
    sender_id: string;
    content: string;
    image_key?: string;
    video_key?: string;
    voice_key?: string;
    file_key?: string;
    blurred_key?: string;
    duration?: number;
    size?: number;
    created_at: string;
  };
  type SupabaseMessage = {
    id: number;
    chat_id: string;
    sender_id: string;
    content: string;
    image_key?: string;
    video_key?: string;
    voice_key?: string;
    file_key?: string;
    price?: number;
    blurred_key?: string;
    duration?: number;
    size?: number;
    created_at: string;
  };
  useEffect(() => {
    if (!currentChatIdentifier || !session?.user?._id) return;
  
    const selectedChat = chats.find(c => c.id === currentChatIdentifier);
    if (!selectedChat) return;
  
    const loadMessages = async () => {
      try {
        const rows: SupabaseMessage[] = await getMessages(selectedChat.id);
        const mapped: MessageType[] = rows.map(row => ({
          id: String(row.id),
          sender_id: row.sender_id,
          content: row.content,
          created_at: row.created_at,
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
        }));
        setMessages(mapped);
      } catch (err) {
        console.error(err);
      }
    };
  
    void loadMessages();
  
    const subscription = subscribeToMessages(
      selectedChat.id,
      (msg: SupabaseMessageRealtime) => {
        const mappedMsg: MessageType = {
          id: String(msg.id),
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at,
          type: msg.image_key
            ? "photo"
            : msg.video_key
            ? "video"
            : msg.voice_key
            ? "voice"
            : msg.file_key
            ? "file"
            : "text",
          image_key: msg.image_key,
          video_key: msg.video_key,
          voice_key: msg.voice_key,
          file_key: msg.file_key,
          blurred_key: msg.blurred_key,
          duration: msg.duration,
          size: msg.size,
        };
        setMessages(prev => [...prev, mappedMsg]);
      }
    );
  
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [currentChatIdentifier, chats, session?.user?._id]);
  
  
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
 
  const handleConversationClick = (chat: Chat) => {
    setCurrentChatIdentifier(chat.id);
    localStorage.setItem("currentChatIdentifier", chat.id);
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
          fileKey:
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
  
      setMessages((prev) => [...prev, newMessage]);
  
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
  console.log(otherParticipant)
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
  console.log(messages)
  
  const isVoiceFile = (file: File) => file.type.startsWith("audio");
  return (
    <div className="min-h-screen">
      {/* Main Chat Interface - Full Screen */}
      <div className="h-screen">
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl backdrop-blur-xl overflow-hidden h-full">
          <div className="flex h-full">
  
            {/* Conversations Sidebar */}
            <div className="w-96 border-r border-white/20 bg-gradient-to-b from-white/5 to-white/10">
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
  
                {session?.user.creator && <div className="p-2 flex flex-row justify-between">
                  <button
                    onClick={() => router.push("/mass-messages")}
                    className="rounded-full items-center flex flex-row p-3 gap-3 w-full bg-white/30 disabled:hover:bg-transparent hover:bg-white/50 disabled:cursor-default disabled:text-gray-500 cursor-pointer transition"
                    disabled={files.length > 0}
                  >
                    <Package />
                    Send A Mass Message
                  </button>
                </div>
                }
              </div>
  
              {/* Conversations List */}
              <div className="overflow-y-auto flex-1 p-4">
                {chats.length > 0 ? (
                  <div className="space-y-2">
                    {chats.map(chat => {
                      const lastMessage = messages
                      .filter(msg => msg.id === chat.id) // match on chatId not msg.id
                      .slice(-1)[0];
                      console.log(chats)
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
                          <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14">
                                {imageLoading ? (
                                  <Skeleton className="w-14 h-14 rounded-full bg-gray-300/20" />
                                ) : chatAvatars[chat.id] ? (
                                  <img
                                    src={chatAvatars[chat.id]}
                                    alt="Chat Avatar"
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-lg"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center text-xl border-2 border-pink-500/40 shadow-lg">
                                    {participant?.name?.charAt(0).toUpperCase() || "U"}
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white/20 shadow-lg"></div>
                              </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-white font-semibold text-base truncate group-hover:text-blue-200 transition-colors">
                                  {participant?.name || participant?.username}
                                </h3>
                                <span className="text-gray-400 text-xs">
                                  {new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm truncate group-hover:text-gray-300 transition-colors">
                                {lastMessage?.content || "No messages yet"}
                              </p>
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
            <div className="flex-1 flex flex-col">
              {selectedChat && otherParticipant ? (
                <>
                  {/* Chat Header */}
                  <div className="p-8 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
                    <div className="flex items-center justify-between">
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
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message, index) => {
                      const previousMessage = index > 0 ? messages[index - 1] : undefined;
                      const showDateDivider = shouldShowDateDivider(message, previousMessage);
                      const isOwn = message.sender_id === session?.user?._id;
                      console.log(message)
                      return (
                        <div key={message.id}>
                          {showDateDivider && (
                            <div className="flex items-center justify-center my-6">
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                              <div className="px-4 py-2">
                                <span className="text-xs font-medium text-gray-300">
                                  {formatDate(message.created_at)}
                                </span>
                              </div>
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            </div>
                          )}
  
                          {/* Message Bubble */}
                          <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                                  isOwn
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                    : "bg-gradient-to-br from-white/15 to-white/10 text-white border border-white/10"
                                }`}
                              >
                               {(message.type === "photo" || message.type === "video") && (
  <div className="relative">
    {/* 🖼️ Image */}
    {message.type === "photo" && message.image_key && (
      <img
        src={
          message.price && message.blurred_key
            ? messageMediaUrls[message.blurred_key]
            : messageMediaUrls[message.image_key]
        }
        alt="Sent image"
        className="max-w-full max-h-64 rounded-xl object-cover cursor-pointer"
        onClick={() =>
          !message.price && message.image_key
            ? setActiveImage(messageMediaUrls[message.image_key])
            : null
        }
      />
    )}

    {/* 🎥 Video */}
    {message.type === "video" && message.video_key && (
      <video
        src={
          message.price && message.blurred_key
            ? messageMediaUrls[message.blurred_key]
            : messageMediaUrls[message.video_key]
        }
        controls={!message.price}
        className="max-w-full max-h-64 rounded-xl"
      />
    )}
    {message &&
    console.log(messageMediaUrls[message.blurred_key])}
    {/* 🔒 Paywall Overlay */}
    {message.price && (
      <div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl text-white text-sm font-semibold">
        🔒 Pay to view
      </div>
      <button className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 cursor-pointer rounded-xl text-white text-sm font-semibold">
      ${message.price} to view
      </button>
      </div>
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

                                {/* Text */}
                                {message.content && (
                                  <p className="text-sm leading-relaxed break-words mt-2">{message.content}</p>
                                )}

                                {/* Timestamp */}
                                <div
                                  className={`text-xs mt-2 ${
                                    isOwn ? "text-blue-100/70" : "text-gray-400/70"
                                  }`}
                                >
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>

                        </div>
                      );
                    })}
                  </div>
  
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
                      setPrice={setPrice}                       // <-- add this
                      isPriceModalOpen={isPriceModalOpen}                  // <-- or use state
                      setIsPriceModalOpen={setIsPriceModalOpen}            // <-- or use state
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
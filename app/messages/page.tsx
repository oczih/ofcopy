'use client';

import { useState } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { MessageCircle, Send, Search, MoreVertical, Phone, Video, Image as ImageIcon, Smile } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
export default function MessagesPage() {
  return (
    <SessionProvider>
      <MessagesApp />
    </SessionProvider>
  );
}

function MessagesApp() {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageText, setMessageText] = useState("");
  const [selected, setSelected] = useState(false)
  const {data: session} = useSession()
  const conversations = session?.user?.subscriptions?.map((subscription, index) => {
    const messages = [
      "Thanks for subscribing! 💕",
      "Check out my latest exclusive content!",
      "I'm working on something special for subscribers",
      "Your support means everything to me!",
      "New content dropping soon!",
      "Hope you're enjoying the exclusive posts",
      "Can't wait to share more with you",
      "Thanks for being part of my community"
    ];
    
    const timestamps = [
      "2 min ago",
      "5 min ago", 
      "1 hour ago",
      "2 hours ago",
      "1 day ago",
      "2 days ago"
    ];
    
    return {
      id: index,
      creator: {
        name: subscription.creatorName,
        username: subscription.creatorUsername,
        avatar: subscription.creatorImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        isOnline: Math.random() > 0.5 // Random online status for demo
      },
      lastMessage: messages[Math.floor(Math.random() * messages.length)],
      timestamp: timestamps[Math.floor(Math.random() * timestamps.length)],
      unreadCount: Math.floor(Math.random() * 3)
    };
  }) || [];
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation.id)
    setSelected(true)
  }
  // Generate messages based on selected conversation
  const messages = selectedConversation >= 0 && conversations[selectedConversation] ? [
    {
      id: 1,
      sender: conversations[selectedConversation].creator.username.replace('@', ''),
      content: `Hey! Thanks for subscribing to my content 💕 I'm ${conversations[selectedConversation].creator.name}`,
      timestamp: "10:30 AM",
      isRead: true
    },
    {
      id: 2,
      sender: "user",
      content: `Hi ${conversations[selectedConversation].creator.name}! I love your content, especially your latest posts`,
      timestamp: "10:32 AM",
      isRead: true
    },
    {
      id: 3,
      sender: conversations[selectedConversation].creator.username.replace('@', ''),
      content: "Aww thank you so much! I'm so glad you enjoy them. I'm actually working on some new exclusive content for subscribers",
      timestamp: "10:35 AM",
      isRead: true
    },
    {
      id: 4,
      sender: "user",
      content: "That sounds amazing! I can't wait to see it",
      timestamp: "10:37 AM",
      isRead: true
    },
    {
      id: 5,
      sender: conversations[selectedConversation].creator.username.replace('@', ''),
      content: "Thanks for the support! 💕 I'll make sure to send you early access to my new content",
      timestamp: "10:40 AM",
      isRead: false
    }
  ] : [];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Header />
      
      <div className="flex max-w-7xl mx-auto px-4 py-8 gap-8 relative z-10">
        <Sidebar />
        
        <main className="flex-1">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex h-[600px]">
              {/* Conversations List */}
              <div className="w-80 border-r border-white/10 bg-white/5">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Messages</h2>
                      <p className="text-gray-400 text-sm">Connect with creators</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto h-[500px]">
                  {conversations.length > 0 ? conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                        selectedConversation === conversation.id ? "bg-white/10 border-r-2 border-blue-500" : ""
                      }`}
                      onClick={() => handleConversationClick(conversation)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            src={conversation.creator.avatar}
                            alt={conversation.creator.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conversation.creator.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-950"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold text-sm truncate">
                              {conversation.creator.name}
                            </h3>
                            <span className="text-gray-400 text-xs">{conversation.timestamp}</span>
                          </div>
                          <p className="text-gray-400 text-sm truncate">{conversation.lastMessage}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">No Conversations</h3>
                        <p className="text-gray-400 text-sm">Subscribe to creators to start messaging them</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation !== null ? (
                  <>
                    {/* Chat Header */}
                    { selected && <div className="p-6 border-b border-white/10 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Image
                              src={conversations[selectedConversation]?.creator?.avatar}
                              alt={conversations[selectedConversation]?.creator?.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {conversations[selectedConversation]?.creator?.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">
                              {conversations[selectedConversation]?.creator?.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {conversations[selectedConversation]?.creator?.isOnline ? "Online" : "Offline"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                      }
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.length > 0 ? messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                                : "bg-white/10 text-white"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === "user" ? "text-blue-100" : "text-gray-400"
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-white font-semibold mb-2">Select a Conversation</h3>
                            <p className="text-gray-400 text-sm">Choose a creator to start messaging</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-6 border-t border-white/10 bg-white/5">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                          <ImageIcon className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                          <Smile className="w-5 h-5" />
                        </Button>
                        <div className="flex-1">
                          <Input
                            placeholder="Type a message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
                          />
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                      <p className="text-gray-400">Choose a creator to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

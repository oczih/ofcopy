/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useMemo,} from "react";
import { MessageType } from "@/app/types";
import { Calendar, DollarSign, Eye, MessageSquare, Paperclip, Send, ShoppingCart, X } from "lucide-react";
import { createPortal } from "react-dom";
import { deleteMessage } from "@/lib/messages";

interface MassMessagesTableProps {
  massMessages: MessageType[];
  massMessageMediaUrls: Record<string, string>;
  setMassMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}

export function MassMessagesTable({ massMessages, massMessageMediaUrls, setMassMessages }: MassMessagesTableProps) {
  // Format date nicely
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Count attachments
  interface CombinedMessage {
    ids: string[];
    id: string;
    date: string;
    senderId: string;
    text: string;
    attachments: Record<'image' | 'video' | 'voice' | 'file', { key: string; url: string }>;
    attachmentsArray: { key: string; url: string }[];
    price: number;
    sent: number;
    viewed: string[];
    purchased: string[]
  }
  
  const combinedMassMessages = useMemo<CombinedMessage[]>(() => {
    const groups: Record<string, Omit<CombinedMessage, 'attachmentsArray'>> = {};
  
    massMessages.forEach(msg => {
      if (!msg.ismassmessage) return;
  
      const d = new Date(msg.created_at);
      const minuteKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
      const key = `${msg.sender_id}-${minuteKey}`;
  
      if (!groups[key]) {
        groups[key] = {
          ids: [msg.id!],
          id: msg.id!,
          date: msg.created_at,
          senderId: msg.sender_id.toString(),
          text: msg.content!,
          attachments: {} as Record<'image' | 'video' | 'voice' | 'file', { key: string; url: string }>,
          price: msg.price ?? 0,
          sent: 1,
          viewed: msg.viewed ?? [],
          purchased: msg.purchased ?? [],
        };
      } else {
        groups[key].ids.push(msg.id!);
        groups[key].sent += 1;
      }
  
      // Only store the first of each type, and ensure URL exists
      if (msg.image_key && massMessageMediaUrls[msg.image_key] && !groups[key].attachments.image) {
        groups[key].attachments.image = { key: msg.image_key, url: massMessageMediaUrls[msg.image_key]! };
      }
      if (msg.video_key && massMessageMediaUrls[msg.video_key] && !groups[key].attachments.video) {
        groups[key].attachments.video = { key: msg.video_key, url: massMessageMediaUrls[msg.video_key]! };
      }
      if (msg.voice_key && massMessageMediaUrls[msg.voice_key] && !groups[key].attachments.voice) {
        groups[key].attachments.voice = { key: msg.voice_key, url: massMessageMediaUrls[msg.voice_key]! };
      }
      if (msg.file_key && massMessageMediaUrls[msg.file_key] && !groups[key].attachments.file) {
        groups[key].attachments.file = { key: msg.file_key, url: massMessageMediaUrls[msg.file_key]! };
      }
    });
  
    return Object.values(groups).map(g => ({
      ...g,
      attachmentsArray: Object.values(g.attachments),
    }));
  }, [massMessages, massMessageMediaUrls]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); 
  const handleUnsend = async (messageIds: string[]) => {
    try {
      setIsDeleting(messageIds.join(",")); // just for button state
      await Promise.all(messageIds.map(id => deleteMessage(id.toString())));
  
      // Remove all messages locally
      if(!messageIds) return;
      setMassMessages(prev => prev.filter(msg => msg.id && !messageIds.includes(msg.id)));
    } catch (err) {
      console.error("Failed to delete messages:", err);
      alert("Error deleting messages");
    } finally {
      setIsDeleting(null);
    }
  };
  

  return (
    <div className="w-full">
      {/* Enhanced Table Container */}
      <div className="bg-white/10 rounded-xl shadow-2xl overflow-hidden border border-slate-200">

        {/* Table Container with Scroll */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Media
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Sent
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  <div className="flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Viewed
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Purchased
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  Revenue
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {combinedMassMessages.map((msg, index) => (
                <tr key={msg.id} className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 ${
                  index % 2 === 0 ? 'bg-white/60' : 'bg-slate-50/60'
                }`}>
                  {/* Date */}
                  <td className="px-4 py-3 border-b border-slate-200">
                    <span className="text-sm font-medium text-white">
                      {formatDate(msg.date)}
                    </span>
                  </td>

                  {/* Message Text */}
                  <td className="px-4 py-3 border-b border-slate-200 max-w-xs">
                    <p className="text-sm text-white leading-relaxed break-words line-clamp-3">
                      {msg.text}
                    </p>
                  </td>

                  {/* Attachments with Preview */}
                  <td className="px-4 py-3 border-b border-slate-200">
  {msg.attachmentsArray.length ? (
    <div className="flex items-center gap-2">
      {msg.attachmentsArray.map((att: { key: string; url: string }) => (
        <div key={att.key}>
          {att.url && (
            <div
              className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md hover:shadow-lg"
              onClick={() => setActiveImage(att.url)}
            >
              {att.key.endsWith('.png') || att.key.endsWith('.jpg') || att.key.endsWith('.jpeg') ? (
                <img src={att.url} alt="Preview" className="w-full h-full object-cover" />
              ) : att.key.endsWith('.mp4') ? (
                <video src={att.url} className="w-12 h-12" controls />
              ) : att.key.endsWith('.mp3') ? (
                <audio src={att.url} controls className="w-24" />
              ) : (
                <span className="text-xs text-slate-600">{att.key.split('/').pop()}</span>
              )}
            </div>
          )}
        </div>
      ))}
      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
        {msg.attachmentsArray.length}
      </span>
    </div>
  ) : (
    <span className="text-xs text-slate-400 italic">No media</span>
  )}
</td>

                  {/* Price */}
                  <td className="px-4 py-3 border-b border-slate-200">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      ${msg.price.toFixed(2)}
                    </span>
                  </td>

                  {/* Stats with Progress Bars */}
                  <td className="px-4 py-3 border-b border-slate-200 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-white">{msg.sent}</span>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 border-b border-slate-200 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-white">{msg?.viewed.length}</span>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{width: `${(msg.viewed.length / msg.sent) * 100}%`}}></div>
                      </div>
                      <span className="text-xs text-slate-500">{((msg.viewed.length / msg.sent) * 100).toFixed(0)}%</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 border-b border-slate-200 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-white">{msg.purchased}</span>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{width: `${(msg.purchased.length / msg.sent) * 100}%`}}></div>
                      </div>
                      <span className="text-xs text-slate-500">{((msg.purchased.length / msg.sent) * 100).toFixed(0)}%</span>
                    </div>
                  </td>

                  
                  <td className="px-4 py-3 border-b border-slate-200 text-center">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">
                      ${(msg.price * msg.purchased.length).toFixed(2)}
                    </span>
                  </td>

                  
                  <td className="px-4 py-3 border-b border-slate-200 text-center">
                  <button 
  onClick={() => handleUnsend(msg.ids)} 
  disabled={isDeleting === msg.ids.join(",")}
  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200
    ${isDeleting === msg.ids.join(",")
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "text-red-600 bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 hover:border-red-300 hover:shadow-md"}
  `}
>
  <X className="w-3 h-3" />
  {isDeleting === msg.ids.join(",") ? "Deleting..." : "Unsend"}
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4 border-t border-slate-300">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">
              Total Messages: <span className="text-slate-800 font-bold">{combinedMassMessages.length}</span>
            </span>
            <span className="text-slate-600 font-medium">
              Total Revenue: <span className="text-green-600 font-bold">
                ${combinedMassMessages.reduce((sum, msg) => sum + (msg.price), 0).toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Image Overlay */}
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
      </div>
  )
}


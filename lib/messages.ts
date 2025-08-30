import { Chat, MessageType } from '@/app/types'
import { supabase } from './supabase'
import type { Message } from './supabase'

// Fetch messages between two users

export async function getMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getChats(userId: string): Promise<Chat[]> {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .contains('participants', [userId])
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Insert a new message

export type SendMessageParams = {
  chatId: string;
  senderId: string;
  content: string;
  imageKey?: string;
  videoKey?: string;
  voiceKey?: string;
  fileKey?: string;
  blurredKey?: string;
  duration?: number;
  size?: number;
  price?: number;               // new
  requiresPayment?: boolean;    // new
};

export async function sendMessage({
  chatId,
  senderId,
  content,
  imageKey,
  videoKey,
  voiceKey,
  fileKey,
  blurredKey,
  duration,
  size,
  price,
  requiresPayment,
}: SendMessageParams): Promise<MessageType> {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        chat_id: chatId,
        sender_id: senderId,
        content,
        image_key: imageKey,
        video_key: videoKey,
        voice_key: voiceKey,
        file_key: fileKey,
        blurred_key: blurredKey,
        duration,
        size,
        price,
        requires_payment: requiresPayment,
      },
    ])
    .select()
    .single();

  if (error || !data) throw error || new Error("No data returned");

  return {
    id: String(data.id),
    type: imageKey
      ? "photo"
      : videoKey
      ? "video"
      : voiceKey
      ? "voice"
      : fileKey
      ? "file"
      : "text",
    senderId: data.sender_id,
    message: data.content,
    createdAt: data.created_at,
    imageKey: data.image_key ?? undefined,
    videoKey: data.video_key ?? undefined,
    voiceKey: data.voice_key ?? undefined,
    fileKey: data.file_key ?? undefined,
    blurredKey: data.blurred_key ?? undefined,
    duration: data.duration ?? undefined,
    size: data.size ?? undefined,
  };
}
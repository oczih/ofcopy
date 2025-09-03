import { Chat, MessageType } from '@/app/types'
import { supabase } from './supabase'

// Fetch messages between two users

export async function getMessages(chatId: string): Promise<MessageType[]> {
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
export async function getChatsBetween(sessionUserId: string, userViewedId: string): Promise<Chat[]> {
  // 1. Find chats where userviewed is a participant
  const { data: userChats, error } = await supabase
    .from("chats")
    .select("*")
    .contains("participants", [userViewedId]);

  if (error) throw error;
  if (!userChats) return [];

  // 2. Keep only chats where session user is also a participant
  const filtered = userChats.filter(c => c.participants.includes(sessionUserId));

  return filtered;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
}
// Insert a new message

export type SendMessageParams = {
  chatId: string;
  senderId: string;
  content: string;
  image_key?: string;
  video_key?: string;
  voice_key?: string;
  file_key?: string;
  ismassmessage?: boolean;
  blurred_key?: string;
  duration?: number;
  size?: number;
  price?: number;               // new
  requiresPayment?: boolean;
  viewed?: string[];
  purchased?: string[]    // new
};

export async function sendMessage({
  chatId,
  senderId,
  content,
  image_key,
  video_key,
  voice_key,
  file_key,
  blurred_key,
  duration,
  size,
  price,
  requiresPayment,
  ismassmessage
}: SendMessageParams): Promise<MessageType> {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        chat_id: chatId,
        sender_id: senderId,
        content,
        ismassmessage,
        image_key,
        video_key,
        voice_key,
        file_key,
        blurred_key,
        duration,
        size,
        price,
        requires_payment: requiresPayment,
        viewed: [],
        purchased: []
      },
    ])
    .select()
    .single();

  if (error || !data) throw error || new Error("No data returned");

  return {
    id: String(data.id),
    type: image_key
      ? "photo"
      : video_key
      ? "video"
      : voice_key
      ? "voice"
      : file_key
      ? "file"
      : "text",
    sender_id: data.sender_id,
    content: data.content,
    created_at: data.created_at,
    image_key: data.image_key ?? undefined,
    video_key: data.video_key ?? undefined,
    voice_key: data.voice_key ?? undefined,
    price: data.price ?? undefined,
    file_key: data.file_key ?? undefined,
    blurred_key: data.blurred_key ?? undefined,
    duration: data.duration ?? undefined,
    size: data.size ?? undefined,
    viewed: data.viewed ?? undefined,
    purchased: data.purchased ?? undefined,
    requires_payment: data.requires_payment ?? undefined,
    ismassmessage: data.ismassmessage ?? undefined
  };
}
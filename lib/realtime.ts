import { supabase } from './supabase'
import type { SupabaseMessageRealtime } from '@/app/types' // <-- raw DB row
import type { MessageType } from '@/app/types';            // <-- your app state type

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (msg: MessageType) => void
) {
  return supabase
    .channel("messages")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) {
          const row = payload.new as SupabaseMessageRealtime;

          const mapped: MessageType = {
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
            file_key: row.file_key,
            blurred_key: row.blurred_key,
            duration: row.duration,
            size: row.size,
            viewed: row.viewed ?? [],
            purchased: row.purchased ?? [],
            ismassmessage: row.ismassmessage ?? false,
            requires_payment: !!row.price,
            price: row.price,
          };

          onNewMessage(mapped);
        }
      }
    )
    .subscribe();
}
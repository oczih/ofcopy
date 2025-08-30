import { supabase } from './supabase'
import type { Message } from './supabase'

export function subscribeToMessages(conversationId: string, onNewMessage: (msg: Message) => void) {
  return supabase
    .channel('messages')
    .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.new) {
            onNewMessage(payload.new as Message);
          }
        }
      )
    .subscribe()
}
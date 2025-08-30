// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Updated type for new messages table
export type Message = {
  id: number               // bigint in DB
  chat_id: string          // link to chat
  sender_id: string        // user UUID
  content: string
  created_at: string
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

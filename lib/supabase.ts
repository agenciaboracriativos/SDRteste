import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (only use in API routes)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type DadosCliente = {
  id: number
  created_at: string
  telefone: string
  session_id: string
  message: Record<string, unknown>
  nome: string | null
  email: string | null
}

export type FollowupCliente = {
  id: number
  created_at: string
  nome: string
  remoteid: string
  ultimaatividade: string
  ultimamensagem: string | null
  'Follow-up 1': boolean
  'Follow-up 2': boolean
  'Follow-up 3': boolean
  'Follow-up 4': boolean
  encerrado: boolean
  enviou_ticket: boolean
  humano_na_conversa: boolean
}

export type ChatHistory = {
  id: number
  session_id: string
  message: {
    type: string
    content: string
    data?: Record<string, unknown>
  }
}

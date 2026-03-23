import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id obrigatório' }, { status: 400 })

  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_id', sessionId)
      .order('id', { ascending: true })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
  }
}

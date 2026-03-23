import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') ?? 'all'
  const search = searchParams.get('search') ?? ''

  try {
    const db = createServiceClient()
    let query = db
      .from('followup_clientes')
      .select('*')
      .order('ultimaatividade', { ascending: false })

    if (filter === 'ativos') query = query.eq('encerrado', false)
    if (filter === 'encerrados') query = query.eq('encerrado', true)
    if (filter === 'tickets') query = query.eq('enviou_ticket', true)
    if (filter === 'humano') query = query.eq('humano_na_conversa', true)
    if (search) query = query.ilike('nome', `%${search}%`)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao buscar follow-ups' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

    const db = createServiceClient()
    const { data, error } = await db
      .from('followup_clientes')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

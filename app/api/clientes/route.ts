import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const search = searchParams.get('search') ?? ''
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  try {
    const db = createServiceClient()
    let query = db
      .from('dados_cliente')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ data, count, page, pageSize })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }
}

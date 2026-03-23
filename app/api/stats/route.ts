import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const db = createServiceClient()

    const [clientesRes, followupRes, chatRes] = await Promise.all([
      db.from('dados_cliente').select('id, created_at, nome, email', { count: 'exact' }),
      db.from('followup_clientes').select('*', { count: 'exact' }),
      db.from('n8n_chat_histories').select('id', { count: 'exact' }),
    ])

    const clientes = clientesRes.data ?? []
    const followup = followupRes.data ?? []

    const totalClientes = clientesRes.count ?? 0
    const totalFollowup = followupRes.count ?? 0
    const totalMensagens = chatRes.count ?? 0

    const encerrados = followup.filter(f => f.encerrado).length
    const comTicket = followup.filter(f => f.enviou_ticket).length
    const comHumano = followup.filter(f => f.humano_na_conversa).length
    const fu1 = followup.filter(f => f['Follow-up 1']).length
    const fu2 = followup.filter(f => f['Follow-up 2']).length
    const fu3 = followup.filter(f => f['Follow-up 3']).length
    const fu4 = followup.filter(f => f['Follow-up 4']).length

    // Clientes por dia (últimos 7 dias)
    const now = new Date()
    const dias: { label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('pt-BR', { weekday: 'short' })
      const count = clientes.filter(c => c.created_at?.startsWith(iso)).length
      dias.push({ label, count })
    }

    return NextResponse.json({
      totalClientes,
      totalFollowup,
      totalMensagens,
      encerrados,
      comTicket,
      comHumano,
      taxaConversao: totalFollowup > 0 ? Math.round((comTicket / totalFollowup) * 100) : 0,
      followupStatus: { fu1, fu2, fu3, fu4 },
      clientesPorDia: dias,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}

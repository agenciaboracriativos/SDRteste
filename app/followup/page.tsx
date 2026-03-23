'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, CheckCircle2, XCircle, Ticket, UserCheck, Clock, RefreshCw } from 'lucide-react'

type Followup = {
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

type Filter = 'all' | 'ativos' | 'encerrados' | 'tickets' | 'humano'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d atrás`
  if (h > 0) return `${h}h atrás`
  return 'agora'
}

function FuBadge({ done }: { done: boolean }) {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center"
      style={{
        background: done ? 'rgba(200,255,0,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${done ? 'rgba(200,255,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      {done && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--acid)' }} />}
    </div>
  )
}

export default function FollowupPage() {
  const [items, setItems] = useState<Followup[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ filter, search })
      const res = await fetch(`/api/followup?${params}`)
      const data = await res.json()
      setItems(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => { fetch_() }, [fetch_])

  const toggle = async (item: Followup, field: keyof Followup) => {
    setUpdating(item.id)
    try {
      await fetch('/api/followup', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, [field]: !item[field] }),
      })
      setItems(prev =>
        prev.map(i => i.id === item.id ? { ...i, [field]: !i[field] } : i)
      )
    } finally {
      setUpdating(null)
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'ativos', label: 'Ativos' },
    { key: 'encerrados', label: 'Encerrados' },
    { key: 'tickets', label: 'Com Ticket' },
    { key: 'humano', label: 'Humano' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Follow-up</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {items.length} leads · Ciclo automático a cada 2h
          </p>
        </div>
        <button className="btn btn-ghost" onClick={fetch_} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="btn"
            style={{
              background: filter === f.key ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.04)',
              color: filter === f.key ? 'var(--acid)' : 'var(--text-muted)',
              border: filter === f.key ? '1px solid rgba(200,255,0,0.25)' : '1px solid transparent',
              fontSize: 12,
              padding: '6px 12px',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por nome..."
          className="input pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Nome', 'Último Contato', 'Última Mensagem', 'FU 1', 'FU 2', 'FU 3', 'FU 4', 'Ticket', 'Humano', 'Status'].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="table-row">
                  {Array(10).fill(0).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded animate-pulse" style={{ background: 'var(--surface-3)', width: 60 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Nenhum lead encontrado
                </td>
              </tr>
            ) : items.map(item => (
              <tr
                key={item.id}
                className="table-row"
                style={{ opacity: updating === item.id ? 0.5 : 1, transition: 'opacity 0.2s' }}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{item.nome}</p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {item.remoteid.replace('@s.whatsapp.net', '')}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(item.ultimaatividade)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ maxWidth: 160 }}>
                  <p className="text-xs truncate" style={{ color: 'var(--text-dim)' }}>
                    {item.ultimamensagem ?? '—'}
                  </p>
                </td>
                {(['Follow-up 1', 'Follow-up 2', 'Follow-up 3', 'Follow-up 4'] as const).map(fu => (
                  <td key={fu} className="px-4 py-3">
                    <FuBadge done={item[fu]} />
                  </td>
                ))}
                <td className="px-4 py-3">
                  <button onClick={() => toggle(item, 'enviou_ticket')}>
                    <Ticket
                      size={15}
                      style={{ color: item.enviou_ticket ? 'var(--acid)' : 'var(--text-muted)' }}
                    />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(item, 'humano_na_conversa')}>
                    <UserCheck
                      size={15}
                      style={{ color: item.humano_na_conversa ? 'var(--blue)' : 'var(--text-muted)' }}
                    />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(item, 'encerrado')}>
                    {item.encerrado ? (
                      <span className="badge badge-gray">Encerrado</span>
                    ) : (
                      <span className="badge badge-green">Ativo</span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

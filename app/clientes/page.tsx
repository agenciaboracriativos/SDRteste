'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, Phone, Mail, MessageSquare, ChevronLeft, ChevronRight, X } from 'lucide-react'

type Cliente = {
  id: number
  created_at: string
  telefone: string
  session_id: string
  nome: string | null
  email: string | null
}

type ChatMsg = {
  id: number
  session_id: string
  message: { type: string; content: string; data?: Record<string, unknown> }
}

function formatPhone(phone: string) {
  return phone.replace('@s.whatsapp.net', '').replace('@g.us', '')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Cliente | null>(null)
  const [chat, setChat] = useState<ChatMsg[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), search })
      const res = await fetch(`/api/clientes?${params}`)
      const data = await res.json()
      setClientes(data.data ?? [])
      setTotal(data.count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchClientes() }, [fetchClientes])

  useEffect(() => {
    if (!selected) return
    setChatLoading(true)
    fetch(`/api/chat-history?session_id=${selected.session_id}`)
      .then(r => r.json())
      .then(d => setChat(d.data ?? []))
      .finally(() => setChatLoading(false))
  }, [selected])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="flex h-screen">
      {/* Left panel */}
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Clientes</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {total} registros encontrados
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            className="input pl-9"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Table */}
        <div className="card flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Nome', 'Telefone', 'Email', 'Cadastro'].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase"
                      style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
                    >
                      {h}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="table-row">
                      {Array(4).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div
                            className="h-4 rounded animate-pulse"
                            style={{ background: 'var(--surface-3)', width: `${60 + j * 10}%` }}
                          />
                        </td>
                      ))}
                      <td />
                    </tr>
                  ))
                ) : clientes.map(c => (
                  <tr
                    key={c.id}
                    className="table-row cursor-pointer"
                    onClick={() => setSelected(c)}
                    style={{ background: selected?.id === c.id ? 'rgba(200,255,0,0.04)' : undefined }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                        {c.nome ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} style={{ color: 'var(--text-muted)' }} />
                        <span className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
                          {formatPhone(c.telefone)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail size={11} style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{c.email}</span>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <MessageSquare size={13} style={{ color: 'var(--text-muted)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Página {page} de {totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost py-1.5 px-2.5"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="btn btn-ghost py-1.5 px-2.5"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Chat History */}
      {selected && (
        <div
          className="w-80 flex flex-col border-l"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {selected.nome ?? 'Cliente'}
              </p>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {formatPhone(selected.telefone)}
              </p>
            </div>
            <button className="btn btn-ghost py-1.5 px-2" onClick={() => setSelected(null)}>
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {chatLoading ? (
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Carregando...</p>
            ) : chat.length === 0 ? (
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Sem histórico</p>
            ) : chat.map(msg => {
              const isHuman = msg.message?.type === 'human'
              const content = typeof msg.message?.content === 'string'
                ? msg.message.content
                : JSON.stringify(msg.message?.content)
              return (
                <div key={msg.id} className={`flex ${isHuman ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                    style={{
                      background: isHuman ? 'rgba(200,255,0,0.12)' : 'var(--surface-3)',
                      color: isHuman ? 'var(--acid)' : 'var(--text)',
                      borderRadius: isHuman ? '12px 12px 2px 12px' : '12px 12px 12px 2px'
                    }}
                  >
                    {content}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

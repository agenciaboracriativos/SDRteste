'use client'
import { useEffect, useState } from 'react'
import { FileText, Trash2, RefreshCw, Database, Search } from 'lucide-react'

type Doc = {
  id: number
  content: string
  metadata: Record<string, unknown>
}

export default function RagPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rag')
      const data = await res.json()
      setDocs(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [])

  const deleteDoc = async (id: number) => {
    if (!confirm('Remover este documento da base RAG?')) return
    setDeleting(id)
    try {
      await fetch(`/api/rag?id=${id}`, { method: 'DELETE' })
      setDocs(prev => prev.filter(d => d.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const filtered = docs.filter(d =>
    d.content.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(d.metadata).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Base RAG</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {docs.length} chunks · Embeddings OpenAI (1536 dims)
          </p>
        </div>
        <button className="btn btn-ghost" onClick={fetchDocs} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Recarregar
        </button>
      </div>

      {/* Info card */}
      <div className="card p-4 mb-5 flex items-start gap-3" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
        <Database size={16} style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Tabela <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ background: 'var(--surface-3)' }}>documents</code> no Supabase
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Para adicionar novos documentos, faça upload pelo Google Drive conectado ao n8n. Os arquivos são processados automaticamente e adicionados aqui.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar no conteúdo dos documentos..."
          className="input pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Docs list */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="h-4 rounded animate-pulse mb-2" style={{ background: 'var(--surface-3)', width: '40%' }} />
              <div className="h-3 rounded animate-pulse mb-1.5" style={{ background: 'var(--surface-3)', width: '90%' }} />
              <div className="h-3 rounded animate-pulse" style={{ background: 'var(--surface-3)', width: '70%' }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {search ? 'Nenhum chunk encontrado' : 'Nenhum documento na base RAG'}
            </p>
          </div>
        ) : filtered.map(doc => {
          const isExp = expanded === doc.id
          const preview = doc.content.slice(0, 200)
          const source = doc.metadata?.source as string | undefined
          const filename = source?.split('/').pop() ?? 'documento'

          return (
            <div key={doc.id} className="card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={13} style={{ color: 'var(--acid)', flexShrink: 0 }} />
                    <span className="text-xs font-mono truncate" style={{ color: 'var(--text-dim)' }}>
                      {filename}
                    </span>
                    <span
                      className="badge badge-gray"
                      style={{ flexShrink: 0 }}
                    >
                      #{doc.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="btn btn-ghost py-1 px-2"
                      onClick={() => setExpanded(isExp ? null : doc.id)}
                      style={{ fontSize: 11 }}
                    >
                      {isExp ? 'Menos' : 'Ver tudo'}
                    </button>
                    <button
                      className="btn btn-danger py-1 px-2"
                      onClick={() => deleteDoc(doc.id)}
                      disabled={deleting === doc.id}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {isExp ? doc.content : preview}
                  {!isExp && doc.content.length > 200 && (
                    <span style={{ color: 'var(--text-muted)' }}>... </span>
                  )}
                </p>

                {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {Object.entries(doc.metadata).slice(0, 4).map(([k, v]) => (
                      <span
                        key={k}
                        className="badge badge-gray font-mono"
                        style={{ fontSize: 10 }}
                      >
                        {k}: {String(v).slice(0, 30)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

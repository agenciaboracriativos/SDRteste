'use client'
import { useEffect, useState } from 'react'
import {
  Users, MessageSquare, BellRing, Ticket, UserCheck, TrendingUp,
  RefreshCw, ArrowUpRight
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import Link from 'next/link'

type Stats = {
  totalClientes: number
  totalFollowup: number
  totalMensagens: number
  encerrados: number
  comTicket: number
  comHumano: number
  taxaConversao: number
  followupStatus: { fu1: number; fu2: number; fu3: number; fu4: number }
  clientesPorDia: { label: string; count: number }[]
}

function StatCard({
  label, value, icon: Icon, accent, sub
}: {
  label: string; value: number | string; icon: React.ElementType; accent?: boolean; sub?: string
}) {
  return (
    <div className={`card p-5 ${accent ? 'card-acid' : ''}`} style={{ animationFillMode: 'both' }}>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: accent ? 'rgba(200,255,0,0.12)' : 'rgba(255,255,255,0.05)' }}
        >
          <Icon size={16} style={{ color: accent ? 'var(--acid)' : 'var(--text-muted)' }} />
        </div>
        {accent && (
          <div className="badge badge-green">live</div>
        )}
      </div>
      <div
        className="text-3xl font-bold mb-1"
        style={{ color: accent ? 'var(--acid)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{sub}</div>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2" style={{ fontSize: 12 }}>
      <p style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ color: 'var(--acid)', fontWeight: 700 }}>{payload[0].value} clientes</p>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const funnelData = stats ? [
    { label: 'Follow-up 1', value: stats.followupStatus.fu1 },
    { label: 'Follow-up 2', value: stats.followupStatus.fu2 },
    { label: 'Follow-up 3', value: stats.followupStatus.fu3 },
    { label: 'Follow-up 4', value: stats.followupStatus.fu4 },
  ] : []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="btn btn-ghost"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard
          label="Total de Clientes"
          value={stats?.totalClientes ?? '—'}
          icon={Users}
          accent
        />
        <StatCard
          label="Conversas Totais"
          value={stats?.totalMensagens ?? '—'}
          icon={MessageSquare}
        />
        <StatCard
          label="Taxa de Conversão"
          value={stats ? `${stats.taxaConversao}%` : '—'}
          icon={TrendingUp}
          sub="clientes com ticket gerado"
        />
        <StatCard
          label="Em Follow-up"
          value={stats?.totalFollowup ?? '—'}
          icon={BellRing}
          sub={`${stats?.encerrados ?? 0} encerrados`}
        />
        <StatCard
          label="Tickets Gerados"
          value={stats?.comTicket ?? '—'}
          icon={Ticket}
        />
        <StatCard
          label="Atendimento Humano"
          value={stats?.comHumano ?? '—'}
          icon={UserCheck}
          sub="transferidos para humano"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Clientes por dia */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                Novos Clientes
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Últimos 7 dias</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats?.clientesPorDia ?? []} barSize={20}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(stats?.clientesPorDia ?? []).map((_: {label: string; count: number}, i: number) => (
                  <Cell
                    key={i}
                    fill={i === (stats?.clientesPorDia.length ?? 1) - 1 ? 'var(--acid)' : 'rgba(200,255,0,0.25)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funil de Follow-up */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              Funil de Follow-up
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Distribuição por etapa</p>
          </div>
          <div className="flex flex-col gap-3">
            {funnelData.map((item, i) => {
              const max = Math.max(...funnelData.map(f => f.value), 1)
              const pct = Math.round((item.value / max) * 100)
              return (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <span className="text-xs font-mono font-medium" style={{ color: 'var(--text)' }}>
                      {item.value}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { href: '/clientes', label: 'Ver todos os clientes', icon: Users },
          { href: '/followup', label: 'Gerenciar follow-ups', icon: BellRing },
          { href: '/rag', label: 'Editar base de conhecimento', icon: MessageSquare },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="card p-4 flex items-center justify-between group"
            style={{ textDecoration: 'none' }}
          >
            <div className="flex items-center gap-3">
              <Icon size={15} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text)' }}>{label}</span>
            </div>
            <ArrowUpRight
              size={14}
              style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}
              className="group-hover:text-acid"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

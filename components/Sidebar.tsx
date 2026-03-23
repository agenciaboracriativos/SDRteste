'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, BellRing, FileText, Settings, Zap, Bot
} from 'lucide-react'

const links = [
  { href: '/',            label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/clientes',    label: 'Clientes',     icon: Users },
  { href: '/followup',   label: 'Follow-up',    icon: BellRing },
  { href: '/rag',        label: 'Base RAG',     icon: FileText },
  { href: '/configuracoes', label: 'Config',    icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-full w-56 flex flex-col"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="p-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--acid)' }}
          >
            <Bot size={14} color="#0A0A0A" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>SDR Agent</span>
        </div>
        <div className="flex items-center gap-1.5 pl-0.5">
          <div className="dot-live" />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>DeployClub</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${path === href ? 'active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Zap size={13} style={{ color: 'var(--acid)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>n8n v2.9.4</span>
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          Follow-up a cada 2h
        </div>
      </div>
    </aside>
  )
}

'use client'
import { useState } from 'react'
import { Save, Eye, EyeOff, Zap, Bot, Database, Bell } from 'lucide-react'

type Section = {
  title: string
  icon: React.ElementType
  fields: {
    key: string
    label: string
    placeholder: string
    type?: string
    hint?: string
  }[]
}

const sections: Section[] = [
  {
    title: 'Supabase',
    icon: Database,
    fields: [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', placeholder: 'https://xxx.supabase.co' },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Key', placeholder: 'eyJ...', type: 'password' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Service Role Key', placeholder: 'eyJ...', type: 'password', hint: 'Usada pelas API routes server-side' },
    ]
  },
  {
    title: 'n8n / Evolution API',
    icon: Zap,
    fields: [
      { key: 'N8N_WEBHOOK_URL', label: 'Webhook URL do n8n', placeholder: 'https://seu-n8n.com/webhook/sdr' },
      { key: 'EVOLUTION_URL', label: 'Evolution API URL', placeholder: 'http://SUA-URL' },
      { key: 'EVOLUTION_INSTANCE', label: 'Nome da Instância', placeholder: 'SUA-INSTANCIA' },
    ]
  },
  {
    title: 'Agente IA',
    icon: Bot,
    fields: [
      { key: 'OPENAI_MODEL', label: 'Modelo OpenAI', placeholder: 'gpt-4o', hint: 'Configurado diretamente no n8n' },
    ]
  },
  {
    title: 'Follow-up',
    icon: Bell,
    fields: [
      { key: 'FU_INTERVAL_HOURS', label: 'Intervalo entre ciclos (horas)', placeholder: '2', hint: 'Configurado no Schedule Trigger do n8n' },
      { key: 'FU_24H_FILTER', label: 'Filtro 24h (horas sem resposta)', placeholder: '24' },
      { key: 'FU_48H_FILTER', label: 'Filtro 48h (horas sem resposta)', placeholder: '48' },
    ]
  },
]

export default function ConfigPage() {
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  const toggle = (key: string) =>
    setVisible(prev => ({ ...prev, [key]: !prev[key] }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Configurações</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Variáveis de ambiente e parâmetros da automação
        </p>
      </div>

      {/* Warning */}
      <div
        className="card p-4 mb-6"
        style={{ borderColor: 'rgba(255,140,66,0.25)', background: 'rgba(255,140,66,0.06)' }}
      >
        <p className="text-sm" style={{ color: 'var(--orange)' }}>
          ⚠️ As variáveis abaixo devem ser configuradas no painel do <strong>Vercel</strong>{' '}
          (Settings → Environment Variables), não nesta interface.
          Este painel é apenas uma referência visual.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {sections.map(section => (
          <div key={section.title} className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <section.icon size={15} style={{ color: 'var(--acid)' }} />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                {section.title}
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {section.fields.map(field => (
                <div key={field.key}>
                  <label
                    className="block text-xs font-semibold mb-1.5 uppercase"
                    style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}
                  >
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !visible[field.key] ? 'password' : 'text'}
                      placeholder={field.placeholder}
                      className="input font-mono text-xs pr-10"
                      readOnly
                    />
                    {field.type === 'password' && (
                      <button
                        onClick={() => toggle(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {visible[field.key]
                          ? <EyeOff size={13} />
                          : <Eye size={13} />
                        }
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {field.hint && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{field.hint}</p>
                    )}
                    <code
                      className="text-xs font-mono ml-auto"
                      style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                    >
                      {field.key}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Vercel deployment guide */}
      <div className="card p-6 mt-6">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Zap size={15} style={{ color: 'var(--acid)' }} />
          Deploy no Vercel
        </h2>
        <ol className="flex flex-col gap-3">
          {[
            'Faça o push do código para um repositório GitHub',
            'Importe o repositório no Vercel',
            'Configure todas as variáveis de ambiente listadas acima',
            'O Vercel detecta Next.js automaticamente — clique em Deploy',
            'Conecte seu domínio personalizado se desejar',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(200,255,0,0.1)', color: 'var(--acid)' }}
              >
                {i + 1}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-dim)' }}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="btn btn-primary"
          onClick={handleSave}
        >
          <Save size={14} />
          {saved ? 'Instruções copiadas!' : 'Salvar referência'}
        </button>
      </div>
    </div>
  )
}

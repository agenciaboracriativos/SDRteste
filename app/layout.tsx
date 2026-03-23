import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'SDR Dashboard | DeployClub',
  description: 'Painel de controle do Agente SDR com RAG e Follow-up',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-56 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

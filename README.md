# SDR Dashboard — DeployClub

Painel de controle para o **Agente SDR + RAG + Agendamento + Follow-up** rodando em n8n.

## Stack
- **Next.js 14** (App Router)
- **Supabase** (banco de dados — mesmo do n8n)
- **Recharts** (gráficos)
- **Tailwind CSS** (estilização)
- **Vercel** (deploy)

## Funcionalidades

| Página | Descrição |
|--------|-----------|
| `/` | Dashboard com métricas em tempo real |
| `/clientes` | Lista de clientes com histórico de chat |
| `/followup` | Gestão de leads e status de follow-up |
| `/rag` | Base de conhecimento (chunks do RAG) |
| `/configuracoes` | Referência de variáveis de ambiente |

## Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite o .env.local com seus valores

# 3. Rodar em desenvolvimento
npm run dev
```

## Deploy no Vercel

### 1. Suba o código para o GitHub
```bash
git init
git add .
git commit -m "feat: sdr dashboard"
git remote add origin https://github.com/SEU-USER/sdr-dashboard.git
git push -u origin main
```

### 2. Configure no Vercel
1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório GitHub
3. Em **Environment Variables**, adicione:

| Variável | Onde encontrar |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `N8N_WEBHOOK_URL` | URL do seu webhook n8n |

4. Clique em **Deploy** ✅

## Tabelas necessárias no Supabase

As tabelas são criadas automaticamente pelos nós do n8n (`Criar tabela de dados do chat e cliente`, `Criar tabela Follow Up`, `Criar tabela documentos RAG`). Execute esses nós uma vez para criar o schema.

## Estrutura de Arquivos

```
app/
  page.tsx                # Dashboard principal
  clientes/page.tsx       # Lista de clientes
  followup/page.tsx       # Gestão de follow-up
  rag/page.tsx            # Base RAG
  configuracoes/page.tsx  # Configurações
  api/
    stats/route.ts        # Métricas agregadas
    clientes/route.ts     # CRUD clientes
    followup/route.ts     # CRUD follow-up
    rag/route.ts          # CRUD documentos RAG
    chat-history/route.ts # Histórico de conversas
components/
  Sidebar.tsx             # Navegação lateral
lib/
  supabase.ts             # Cliente Supabase + tipos
```

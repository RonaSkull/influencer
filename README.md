# 🚀 AI INFLUENCER - README

**A plataforma definitiva de influenciadores virtuais autônomos que vendem qualquer produto.**

---

## 📋 VISÃO GERAL

Crie influenciadoras virtuais por IA que:
- ✅ Geram persona e identidade visual
- ✅ Criam roteiros virais automaticamente
- ✅ Produzem vídeos com avatar realista
- ✅ Narram com voz humana premium
- ✅ Publicam no Instagram/TikTok/WhatsApp
- ✅ Respondem leads e fecham vendas
- ✅ Otimizam com base em métricas

**Não é nicho específico. É universal para QUALQUER mercado.**

---

## 🎯 FUNCIONALIDADES

### Core Features
- **Multi-Nicho Support**: Farmácia, fitness, beleza, tech, finanças, etc.
- **AI Provider Abstraction**: Groq (free), OpenAI, Claude, Gemini, Qwen
- **Avatar Generator**: Leonardo.ai, Stability, DALL-E
- **Voice Synthesis**: ElevenLabs, PlayHT, Coqui (local)
- **Video Pipeline**: RunML, Pika, HeyGen integration ready
- **FFmpeg Processing**: Mix, legendas, otimização social

### Growth Engine
- Viral score predictor
- Hook generator com A/B testing
- CTA optimizer
- Trending topics scraper
- Content calendar automation

### Sales Automation
- DM Closer AI (Instagram responses)
- WhatsApp automation (Twilio integration)
- Objection handler
- Cart recovery
- Lead scoring

### Analytics
- Views, engagement tracking
- ROI per campaign
- CAC estimates
- Top performing content
- Conversion funnel

---

## 🏗️ ARQUITETURA

```
┌─────────────────────────────────────────────────────┐
│              Frontend (Next.js 14)                  │
│   Landing pages | Dashboard | Analytics             │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              API Gateway (Serverless)               │
│   Rate limiting | Auth | Validation                 │
└─────────────────────────────────────────────────────┘
                         ↓
    ┌────────────────────┼────────────────────┐
    ↓                    ↓                    ↓
┌─────────┐       ┌─────────────┐      ┌──────────┐
│  Auth   │       │  Pipeline   │      │Analytics │
│ Service │       │  Service    │      │ Service  │
└─────────┘       └─────────────┘      └──────────┘
    ↓                    ↓                    ↓
┌─────────┐       ┌─────────────┐      ┌──────────┐
│Supabase │       │ Redis Queue │      │ Postgres │
└─────────┘       └─────────────┘      └──────────┘
                         ↓
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │LLM Worker│   │Video     │   │TTS       │
   │(Groq)    │   │Worker    │   │Worker    │
   └──────────┘   └──────────┘   └──────────┘
```

---

## 🚀 INSTALAÇÃO RÁPIDA

### Pré-requisitos
- Node.js 18+ 
- FFmpeg instalado
- Git

### Setup

```bash
# Clone o repositório
git clone <repo-url>
cd ai-influencer

# Instale dependências
npm install

# Copie o .env.example
cp .env.example .env

# Configure suas chaves API (mínimo necessário)
echo "GROQ_API_KEY=your_key_here" >> .env
# Get free key at: https://console.groq.com

# Inicie em desenvolvimento
npm run dev
```

---

## 🔑 CONFIGURAÇÃO DE VARIÁVEIS

### Obrigatórias (CRÍTICO)
```env
GROQ_API_KEY=gsk_...        # Free: 500k tokens/day
NODE_ENV=development
```

### Recomendadas (IMPORTANTE)
```env
LEONARDO_API_KEY=...        # Free: 150 imagens/day
ELEVENLABS_API_KEY=...      # Vozes premium
```

### Opcionais (NICE TO HAVE)
```env
# Database
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Payments
STRIPE_SECRET_KEY=sk_...

# Social Media
INSTAGRAM_ACCESS_TOKEN=...
TWILIO_ACCOUNT_SID=...
```

---

## 📦 USO BÁSICO

### Via Código

```typescript
import { pipeline } from './src/services/InfluencerPipeline';

// Gerar vídeo completo
const result = await pipeline.execute({
  tema: 'vitamina C para imunidade',
  nicho: 'saude',
  platform: 'instagram'
});

console.log(result.finalVideo);
```

### Via CLI

```bash
# Gerar roteiro apenas
npx ts-node src/services/FreeRoteiroGenerator.ts "omega 3 beneficios"

# Pipeline completo
npx ts-node src/services/InfluencerPipeline.ts "colageno tipos"
```

---

## 🧪 TESTES

```bash
# Rodar testes unitários
npm test

# Testar pipeline específico
npm run test:pipeline

# Validar environment
npm run validate-env
```

---

## 📊 ROADMAP

### ✅ Fase 1: Fundação (COMPLETO)
- [x] Diagnóstico completo do projeto
- [x] AI Provider abstraction layer
- [x] Groq integration (free LLM)
- [x] Environment validation
- [x] Error handling unificado

### 🔄 Fase 2: Core Features (EM PROGRESSO)
- [ ] Integração Leonardo.ai (imagens)
- [ ] Integração ElevenLabs (vozes)
- [ ] Multi-nicho support
- [ ] Avatar customization
- [ ] Voice library

### 📅 Fase 3: Vídeo Pipeline
- [ ] RunML/Pika integration
- [ ] Lip-sync (Wav2Lip)
- [ ] Auto-captions (Whisper)
- [ ] Quality enhancement

### 📅 Fase 4: Growth & Monetization
- [ ] Viral score predictor
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Stripe integration
- [ ] Credits system

---

## 🛠️ STACK TECNOLÓGICA

| Componente | Tecnologia | Status |
|------------|-----------|--------|
| Frontend | Next.js 14 + TypeScript | 📅 Planejado |
| Backend | Node.js + Serverless | ✅ Pronto |
| Database | Supabase (Postgres) | 📅 Planejado |
| Cache | Redis (Upstash) | 📅 Planejado |
| Queue | Redis Bull | 📅 Planejado |
| LLM | Groq (free) + OpenAI | ✅ Parcial |
| Imagens | Leonardo.ai + Stability | ⚠️ Placeholder |
| Vídeo | RunML + Pika | ❌ TODO |
| TTS | ElevenLabs + Coqui | ⚠️ Placeholder |
| Payments | Stripe | 📅 Planejado |
| Deploy | Vercel + Railway | 📅 Planejado |

---

## 🤝 CONTRIBUINDO

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenções de Commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `refactor:` Refatoração de código
- `perf:` Melhoria de performance
- `ui:` Mudanças visuais/UX
- `infra:` Infraestrutura/DevOps
- `docs:` Documentação

---

## 📄 LICENÇA

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👥 EQUIPE

Built with ❤️ by the AI Influencer Team

---

## 🔗 LINKS ÚTEIS

- [Documentação Completa](docs/)
- [Diagnóstico do Projeto](docs/DIAGNOSTICO-COMPLETO.md)
- [API Reference](docs/API.md)
- [Roadmap](docs/ROADMAP.md)

---

## 💡 PRECISA DE AJUDA?

- 📧 Email: support@aiinfluencer.com
- 💬 Discord: [Join our server](link)
- 📚 Docs: [Read the docs](docs/)

---

**🚀 Ready to create your AI influencer?**

```bash
npm run dev
```

Let's go! 🎯

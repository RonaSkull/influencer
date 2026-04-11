# 🎬 PROJETO VIRAL AI INFLUENCER - 100% FREE

## Visão Geral
Criar um influenciador de IA sem pagar nada por APIs, usando apenas ferramentas gratuitas e open source.

---

## 🆓 STACK 100% FREE

### 1. GERAÇÃO DE VÍDEO (Free)
| Serviço | Uso | Custo |
|---------|-----|-------|
| **Stable Video Diffusion** (HuggingFace) | Imagem → Vídeo | FREE |
| **RunML diffusion** | Video generation | Free tier |
| **Pika Labs** (free) | Video generation | FREE |
| **Leonardo.ai** | Image generation | 150 credits/day FREE |

### 2. TEXTO PARA VOZ (TTS - Free)
| Serviço | Uso | Custo |
|---------|-----|-------|
| **Kokoro** (on-prem) | TTS open source | FREE |
| **Chatterbox** | Voice cloning | FREE |
| **Coqui TTS** | TTS open source | FREE |
| **Google TTS** (Cloud) | 300 chars/month | FREE |

### 3. IMAGENS (Free)
| Serviço | Uso | Custo |
|---------|-----|-------|
| **Flux Schnell** (Replicate) | 1000/month | FREE |
| **Stable Diffusion XL** | On local | FREE |
| **Leonardo.ai** | 150/day | FREE |
| **HuggingFace** | Free inference | FREE |

### 4. LLM (Texto - Free)
| Serviço | Uso | Custo |
|---------|-----|-------|
| **Groq** | 500k tokens/day | FREE |
| **OpenRouter** | Various free models | FREE |
| **Qwen 2.5** (HuggingFace) | On local | FREE |
| **DeepSeek** | Free tier | FREE |

---

## 🔄 PIPELINE COMPLETO

### FLUXO 1: "Vídeo Viral Completo" (MAIS ECONÔMICO)

```
1. GERAÇÃO DE IDEIA
   └── Groq (LLM) → Tema viral
   
2. ROTEIRO
   └── Groq → Roteiro com ganchos
   
3. IMAGEM
   └── Leonardo.ai (grátis) → Avatar imagem
   
4. VÍDEO
   └── Pika Labs (grátis) ou RunML → Vídeo do avatar
   
5. VOZ
   └── Coqui TTS (local) → Narração
   
6. MIX
   └── FFmpeg (local) → Vídeo final com áudio
   
7. LEGENDAS
   └── Whisper (local) → Subtítulos
   
8. PUBLICAÇÃO
   └── API Instagram (Developer) → Post
```

---

## 🚀 IMPLEMENTAÇÃO AGORA

### 1. GERADOR DE ROTEIROS (GROQ - FREE)

```typescript
// services/FreeRoteiroGenerator.ts
// usa Groq - 100% FREE (500k tokens/dia!)

const ROTEIRO_GERADOR = `
Gere um roteiro viral para influenciador de farmácia.
Tema: {TEMA}

Requisitos:
- Hook de 3 segundos (curiosidade/urgência)
- Corpo de 30 segundos (autoridade + utilidade)
- CTA para salvar/seguir

Responda em JSON:
{
  "hook": "...",
  "corpo": "...",
  "cta": "...",
  "hashtags": ["..."]
}
`

async function gerarRoteiro(tema: string) {
  // Groq API - FREE!
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: ROTEIRO_GERADOR.replace('{TEMA}', tema) }],
      temperature: 0.8
    })
  })
  
  return JSON.parse(response.choices[0].message.content)
}
```

---

### 2. GERADOR DE IMAGENS (LEONARDO.AI - FREE)

```typescript
// services/FreeImageGenerator.ts
// 150 imagens/dia GRÁTIS!

async function gerarAvatarDraOlivia(tema: string) {
  const response = await fetch('https://api.leonardo.ai/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: `Professional female pharmacist, white coat, friendly smile, 
               modern medical setting, high quality, 4k, photorealistic.
               Topic: ${tema}`,
      model_id: 'ac0f5c8d-8c8a-4c8e-8c8a-8c8a8c8a8c8a',
      width: 1024,
      height: 1024
    })
  })
  
  const data = await response.json()
  return data.generations[0].image_url
}
```

---

### 3. VÍDEO (PIKA LABS / RUNML - FREE)

```typescript
// services/FreeVideoGenerator.ts

async function gerarVideo(imagemUrl: string) {
  // OPÇÃO 1: Pika Labs (freemium)
  const pikaResponse = await fetch('https://api.pika.lol/v1/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PIKA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: imagemUrl,
      prompt: 'subtle movement, professional, high quality'
    })
  })
  
  return pikaResponse.video_url
}
```

---

### 4. VOZ (COQUI TTS - 100% LOCAL/FREE)

```typescript
// services/FreeTTS.ts
// 100% Gratuito - Rode local!

import { TTS } from 'coqui-tts'

async function gerarVoz(texto: string, outputPath: string) {
  // Rode localmente - ZERO custo!
  const tts = await TTS.load('coqui/tts', 'pt_BR')
  
  await tts.tts(texto, outputPath)
  
  return outputPath
}

// OU use Kokoro (melhor qualidade)
import { Kokoro } from 'kokoro-ts'

async function gerarVozKokoro(texto: string) {
  const kokoro = await Kokoro.load()
  const audio = await kokoro.speak(texto, 'pt-BR-female-1')
  
  return audio
}
```

---

### 5. VÍDEO FINAL (FFMPEG - LOCAL/FREE)

```typescript
// services/VideoMixer.ts

async function mixVideo(videoPath: string, audioPath: string, outputPath: string) {
  // FFmpeg - 100% gratuito!
  const command = `ffmpeg -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -shortest ${outputPath}`
  
  const { exec } = require('child_process')
  exec(command)
  
  return outputPath
}

async function addLegendas(videoPath: string, roteiro: string, outputPath: string) {
  // Use o Whisper para gerar legendas
  // FFmpeg para adicionar
  
  const command = `ffmpeg -i ${videoPath} -vf "subtitles=legendas.srt" ${outputPath}`
  
  return outputPath
}
```

---

## 📊 FREE TIER LIMITS

| API | Limite Free | Como usar muito |
|-----|-------------|-----------------|
| **Groq** | 500k tokens/dia | Gera infinitos roteiros |
| **Leonardo** | 150/day | 5 vídeos/dia |
| **Replicate** | $10 free/month | Stable Diffusion |
| **Pika** | 5 vídeos/month | Testes |
| **Coqui/Kokoro** | ∞ | Local = Grátis |

---

## 🎯 STRATEGY PARA VIRAL

### Técnicas de Viralização (Implementadas):
1. **Gatilho de curiosidade**: "Você não sabia..."
2. **Gatilho de urgência**: "Corra antes que..."
3. **Gatilho de autoridade**: "Sou farmacêutica..."
4. **Gatilho de utilidade**: "Guarda isso..."

### Formato Ideal:
- Vídeo: 30-60 segundos
- Legendas grandes e vibrantes
- Hook nos primeiros 3 segundos
- CTA no final

---

## 🚀 PRÓXIMOS PASSOS

1. **Pegar chaves API** (todas gratuitas):
   - Groq: groq.com
   - Leonardo: leonardo.ai
   - Replicate: replicate.com
   - Pika: pika.art

2. **Instalar local**:
   - Coqui TTS
   - FFmpeg
   - Whisper

3. **Testar pipeline completo**

---

## 💡 RESUMO

| Componente | Solução Free |
|------------|--------------|
| Roteiro | Groq (500k/dia) |
| Imagem | Leonardo (150/dia) |
| Vídeo | Pika / RunML |
| Voz | Coqui (local) |
| Legendas | Whisper (local) |
| Mix | FFmpeg (local) |
| Publicação | API Instagram (grátis) |

TOTAL: **$0** por mês para começar! 🚀
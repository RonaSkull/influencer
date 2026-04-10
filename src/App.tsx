import { useState, useRef, useEffect, useCallback } from 'react'
import React from 'react'
import './App.css'
import { CONFIG } from './config'
import type { AppStatus, FormValues, StreamLine, WorkflowPayload, WorkflowResponse } from './types'
import { WorkflowForm } from './components/WorkflowForm'
import { ResultDashboard } from './components/ResultDashboard'
import { StreamLog } from './components/StreamLog'
import LiveInfluencer from './components/LiveInfluencer'
import { CVIProvider } from './components/cvi/components/cvi-provider'

// ─── SSE line parser ──────────────────────────────────────────────────────────

function parseSSELine(raw: string): StreamLine | null {
  const text = raw.startsWith('data:') ? raw.slice(5).trim() : raw.trim()
  if (!text) return null

  if (raw.startsWith('event:')) {
    const evName = raw.slice(6).trim()
    if (evName === 'error') return { text: `⚠ Server event: ${evName}`, type: 'warn' }
    return { text: `◎ Event: ${evName}`, type: 'system' }
  }

  try {
    const j = JSON.parse(text) as Record<string, unknown>
    if (j.error) return { text: `✖ ${j.error}`, type: 'warn' }
    if (j.type === 'step' || j.step != null)
      return { text: `▸ ${j.name ?? j.message ?? text}`, type: 'info' }
    if (j.type === 'log' || j.message)
      return { text: `  ${j.message ?? text}`, type: 'default' }
    if (j.success === true && (j.executionId != null || j.data != null))
      return { text: `✔ Workflow concluído — Execução #${j.executionId ?? ''}`, type: 'done' }
    return { text: `  ${text}`, type: 'default' }
  } catch {
    return { text: text, type: 'default' }
  }
}

// ─── Build payload ─────────────────────────────────────────────────────────────

function buildPayload(f: FormValues): WorkflowPayload {
  return {
    productName:    f.productName.trim(),
    productBenefit: f.productBenefit.trim(),
    productPrice:   f.productPrice.trim(),
    videoCount:     Math.min(Math.max(1, f.videoCount), CONFIG.MAX_VIDEOS),
    influencerName: f.influencerName.trim(),
  }
}

// ─── Default form ─────────────────────────────────────────────────────────────

const DEFAULT_FORM: FormValues = {
  productName:    '',
  productBenefit: '',
  productPrice:   '',
  videoCount:     3,
  influencerName: '',
}

// ─── App ──────────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

function steps_estimate(videoCount: number): string {
  const baseMin = 8
  const perVideo = 2
  const total = baseMin + (videoCount - 1) * perVideo
  return `estimado ${total}–${total + 4} min para ${videoCount} vídeo${videoCount > 1 ? 's' : ''}`
}

export default function App() {
  const [form, setForm]           = useState<FormValues>(DEFAULT_FORM)
  const [status, setStatus]       = useState<AppStatus>('idle')
  const [streamLines, setStreamLines] = useState<StreamLine[]>([])
  const [result, setResult]       = useState<WorkflowResponse | null>(null)
  const [errorMsg, setErrorMsg]   = useState('')
  const [useStream, setUseStream] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [mode, setMode]           = useState<'blueprint' | 'live'>('blueprint')

  const streamLogRef = useRef<HTMLDivElement | null>(null)
  const abortRef     = useRef<AbortController | null>(null)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-scroll stream log
  useEffect(() => {
    if (streamLogRef.current) {
      streamLogRef.current.scrollTop = streamLogRef.current.scrollHeight
    }
  }, [streamLines])

  const addLine = useCallback((text: string, type: StreamLine['type'] = 'default') => {
    setStreamLines(prev => [...prev, { text, type }])
  }, [])

  const handleFieldChange = (field: keyof FormValues, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // ─── Timer helpers ────────────────────────────────────────────────────────

  const startTimer = () => {
    setElapsedSec(0)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const handleReset = () => {
    if (abortRef.current) abortRef.current.abort()
    stopTimer()
    setStatus('idle')
    setResult(null)
    setStreamLines([])
    setErrorMsg('')
    setElapsedSec(0)
  }

  // ─── Standard (non-streaming) POST ───────────────────────────────────────

  const runStandard = async (payload: WorkflowPayload, signal: AbortSignal) => {
    const steps = CONFIG.STEP_LABELS
    let idx = 0

    // Show first step immediately
    addLine(`▸ ${steps[0]}`, 'info')
    idx = 1

    // Subsequent steps tick every ~75 seconds to match real workflow pace
    let shownWaiting = false
    const ticker = setInterval(() => {
      if (idx < steps.length) {
        addLine(`▸ ${steps[idx]}`, 'info')
        idx++
      } else if (!shownWaiting) {
        shownWaiting = true
        addLine('', 'default')
        addLine('  ⏳ Todos os steps enviados — aguardando resposta final do servidor BubbleLab…', 'system')
        addLine('  ☁️ Claude Sonnet está finalizando os relatórios e salvando no Cloudflare R2…', 'system')
        addLine('  ⚠️ Isso pode levar mais alguns minutos — mantenha esta aba aberta.', 'system')
      }
      // After showing once, ticker continues but adds nothing more
    }, CONFIG.STEP_INTERVAL_MS)

    // Show step 2 after 8s so UI feels alive immediately
    setTimeout(() => {
      if (idx < steps.length) {
        addLine(`▸ ${steps[1]}`, 'info')
        idx = 2
      }
    }, 8000)

    try {
      const resp = await fetch(CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      })
      clearInterval(ticker)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
      const data: WorkflowResponse = await resp.json()
      addLine('', 'default')
      addLine('✔ Todos os 8 steps concluídos!', 'done')
      return data
    } catch (err) {
      clearInterval(ticker)
      throw err
    }
  }

  // ─── Streaming POST ───────────────────────────────────────────────────────

  const runStream = async (payload: WorkflowPayload, signal: AbortSignal): Promise<WorkflowResponse | null> => {
    const resp = await fetch(CONFIG.STREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })

    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`)
    if (!resp.body)  throw new Error('No response body — stream not supported')

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let captured: WorkflowResponse | null = null
    let hadServerError = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n')
      buffer = parts.pop() ?? ''

      for (const raw of parts) {
        if (raw.startsWith('event:')) {
          const evName = raw.slice(6).trim()
          if (evName === 'error') {
            hadServerError = true
            addLine(`⚠ Server stream event: error`, 'warn')
          }
          continue
        }

        const line = parseSSELine(raw)
        if (line) addLine(line.text, line.type)

        try {
          const text = raw.startsWith('data:') ? raw.slice(5).trim() : raw.trim()
          const j = JSON.parse(text) as WorkflowResponse
          if (j.success !== undefined || j.executionId != null || j.data != null) {
            captured = j
          }
        } catch { /* not JSON */ }
      }
    }

    if (hadServerError) {
      addLine('  Stream encerrado com erro — usando webhook padrão…', 'warn')
      return null
    }

    addLine('', 'default')
    addLine('✔ Stream completo!', 'done')
    return captured
  }

  // ─── Main submit handler ──────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setStatus('loading')
    startTimer()
    setStreamLines([])
    setResult(null)
    setErrorMsg('')

    const ctrl = new AbortController()
    abortRef.current = ctrl
    const payload = buildPayload(form)

    // Initial info log
    addLine('◈ Iniciando FarmáciAI Pipeline…', 'system')
    addLine(`◈ Produto: ${payload.productName} · ${payload.productBenefit} · ${payload.productPrice}`, 'system')
    addLine(`◈ Vídeos: ${payload.videoCount}`, 'system')
    if (payload.influencerName) addLine(`◈ Influenciadora: ${payload.influencerName}`, 'system')
    addLine(`◈ Webhook: ${CONFIG.WEBHOOK_URL}`, 'system')
    addLine('', 'default')

    try {
      let data: WorkflowResponse | null = null

      if (useStream) {
        addLine('▸ Tentando conexão SSE streaming…', 'info')
        try {
          data = await runStream(payload, ctrl.signal)
        } catch (streamErr) {
          addLine(`⚠ Stream falhou: ${(streamErr as Error).message}`, 'warn')
          data = null
        }

        if (!data) {
          addLine('▸ Fallback — usando webhook padrão…', 'info')
          addLine('  (Isso pode levar 5–15 minutos — não feche esta aba)', 'system')
          data = await runStandard(payload, ctrl.signal)
        }
      } else {
        addLine('▸ Iniciando workflow via webhook padrão…', 'info')
        addLine(`  (${steps_estimate(payload.videoCount)} — não feche esta aba)`, 'system')
        data = await runStandard(payload, ctrl.signal)
      }

      if (!data) throw new Error('Nenhuma resposta recebida do workflow.')

      stopTimer()
      setResult(data)
      setStatus(data.success ? 'done' : 'error')
      if (!data.success) {
        setErrorMsg(data.error ?? 'Workflow retornou success: false')
        addLine(`✖ ${data.error ?? 'Erro desconhecido'}`, 'warn')
      }
    } catch (err: unknown) {
      stopTimer()
      if ((err as Error).name === 'AbortError') {
        addLine('✖ Cancelado pelo usuário.', 'warn')
        setStatus('idle')
        return
      }
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMsg(msg)
      addLine(`✖ Erro: ${msg}`, 'warn')
      setStatus('error')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="app">
      {/* Ambient orbs */}
      <div className="glow-orb" style={{ width: 500, height: 500, top: -150, left: -150, background: 'rgba(167,139,250,0.07)' }} />
      <div className="glow-orb" style={{ width: 400, height: 400, top: '40%', right: -200, background: 'rgba(96,165,250,0.06)' }} />
      <div className="glow-orb" style={{ width: 300, height: 300, bottom: 0, left: '40%', background: 'rgba(52,211,153,0.05)' }} />

      {/* Header */}
      <header className="header glass">
        <div className="header-brand">
          <div className="header-logo">💊</div>
          <div className="header-title">
            {CONFIG.APP_NAME} <span>/ {CONFIG.APP_TAGLINE}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className={`platform-btn ${mode === 'blueprint' ? 'active' : ''}`}
            onClick={() => setMode('blueprint')}
          >
            📋 Campanha
          </button>
          <button 
            className={`platform-btn ${mode === 'live' ? 'active' : ''}`}
            onClick={() => setMode('live')}
          >
            🎙️ Live (IA)
          </button>
          <span className="header-badge">AI Powered</span>
        </div>
      </header>

      {/* Hero */}
      {mode === 'blueprint' && (
        <div className="hero">
          <div className="hero-eyebrow">
            <span className="dot" />
            Claude Sonnet · 8 Steps especializados · Mercado farmacêutico BR
          </div>
          <h1>
            <span className="gradient-text">Influenciadora Farmacêutica</span>
            <br />Gerada por IA
          </h1>
          <p className="hero-sub">
            Da persona ao kit de postagem completo — roteiros virais, plano de
            vídeo, manifesto de áudio TTS, CapCut guide e DM automation para qualquer produto de farmácia.
          </p>
        </div>
      )}

      {/* Main */}
      <main className="main-content">

        {/* BLUEPRINT UI */}
        {mode === 'blueprint' && (
          <>
            {status === 'idle' && (
              <WorkflowForm
                values={form}
                onChange={handleFieldChange}
                onSubmit={handleSubmit}
                useStream={useStream}
                onToggleStream={() => setUseStream(v => !v)}
              />
            )}

            {status === 'loading' && (
              <div className="loading-card">
                <div className="loading-spinner" />
                <h3 className="loading-title gradient-text">Gerando Campanha…</h3>
                {/* Progress Bar Component */}
                <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto 30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <span>Progresso da Campanha</span>
                    <span>{Math.round((streamLines.filter(l => l.text.includes('✓') || l.text.includes('▶')).length / 8) * 100)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${Math.min(100, Math.round((streamLines.filter(l => l.text.includes('✓') || l.text.includes('▶')).length / 8) * 100))}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #8B5CF6 0%, #D946EF 100%)',
                        transition: 'width 0.5s ease-out'
                      }} 
                    />
                  </div>
                  <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '500' }}>
                    Passo {Math.min(8, streamLines.filter(l => l.text.includes('✓') || l.text.includes('▶')).length)} de 8 finalizados
                  </div>
                </div>

                <StreamLog lines={streamLines} scrollRef={streamLogRef} />
                <div style={{ marginTop: 20 }}>
                  <button id="cancelBtn" type="button" className="btn-secondary" onClick={handleReset}>
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <>
                <div className="error-card">
                  <h3>✖ Workflow Falhou</h3>
                  <p>{errorMsg}</p>
                </div>
                {streamLines.length > 0 && (
                  <div className="section-card" style={{ marginBottom: 24 }}>
                    <div className="section-header">
                      <div className="section-header-icon bg-orange" style={{ color: 'var(--accent-orange)' }}>📋</div>
                      <div>
                        <div className="section-title">Log de Execução</div>
                        <div className="section-subtitle">O que aconteceu antes do erro</div>
                      </div>
                    </div>
                    <StreamLog lines={streamLines} scrollRef={streamLogRef} />
                  </div>
                )}
                <div className="result-toolbar">
                  <button id="retryBtn" type="button" className="btn-primary" onClick={handleReset}>
                    ↺ Tentar Novamente
                  </button>
                </div>
              </>
            )}

            {status === 'done' && result && (
              <ResultDashboard
                result={result}
                streamLines={streamLines}
                onReset={handleReset}
              />
            )}
          </>
        )}

        {/* LIVE MODE */}
        {mode === 'live' && (
          <CVIProvider>
            <LiveInfluencer />
          </CVIProvider>
        )}
      </main>
    </div>
  )
}


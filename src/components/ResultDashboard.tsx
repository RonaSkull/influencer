import React, { useState, useRef } from 'react'
import type { WorkflowResponse, StreamLine } from '../types'
import { StreamLog } from './StreamLog'
import { VideoOrchestrator } from '../services/videoOrchestrator'
import { TavusStatusTracker } from './TavusStatusTracker'

interface Props {
  result: WorkflowResponse
  streamLines: StreamLine[]
  onReset: () => void
}

export function ResultDashboard({ result, streamLines, onReset }: Props) {
  const logRef = useRef<HTMLDivElement | null>(null);
  const data = result.data;

  // ── Resolve values defensively ──────────────────────────────────────────
  const influencerName = data?.influencerName ?? 'Influenciadora';
  const product        = data?.product ?? '—';
  const videosGen      = data?.videosGenerated ?? 0;
  const jsonUrl        = data?.jsonReportUrl ?? '';
  const mdUrl          = data?.markdownReportUrl ?? '';
  const qs             = data?.quickSummary ?? {};
  const nextSteps      = data?.nextSteps ?? [];
  const generatedAt    = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    : '—';

  const [renderingVideoId, setRenderingVideoId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const theme = data?.product || 'Dra Olivia';

  const handleStartRender = async () => {
    setIsProcessing(true);
    try {
      // Pega o top script defendivamente
      const script = {
        tema: theme,
        hook: qs.topScript || 'Olá!',
        body: 'Sou a Dra. Olivia e hoje vou te contar um segredo...',
        cta: 'Me segue para mais dicas!'
      };

      const res = await VideoOrchestrator.renderVideo(script);
      setRenderingVideoId(res.video_id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const [mood, setMood] = useState('padrao');

  return (
    <div className="result-dashboard">
      {/* ── Success banner ─────────────────────────────────────────────────── */}
      <div className="success-banner">
        <div className="success-banner-left">
          <h2>🎉 Campanha Gerada com Sucesso!</h2>
          <p>
            Influenciadora <strong style={{ color: 'var(--accent-primary)' }}>{influencerName}</strong>
            {' · '}{videosGen} vídeo{videosGen !== 1 ? 's' : ''} para{' '}
            <strong>{product}</strong>
            {' · '}<span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{generatedAt}</span>
          </p>
        </div>
        <div className="success-icon">💊</div>
      </div>

      {/* ── Quick-summary stats ────────────────────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">👩</div>
          <div className="stat-val color-purple">{influencerName.split(' ')[0]}</div>
          <div className="stat-label">Persona criada</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-val color-blue">{videosGen}</div>
          <div className="stat-label">Vídeos gerados</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-val color-cyan" style={{ fontSize: 16 }}>{qs.topPostingTime ?? '19:00 BRT'}</div>
          <div className="stat-label">Melhor horário</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-val color-green" style={{ fontSize: 14 }}>#{qs.dmKeyword ?? '—'}</div>
          <div className="stat-label">Keyword DM</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔊</div>
          <div className="stat-val color-orange" style={{ fontSize: 11, lineHeight: 1.4 }}>TTS nova</div>
          <div className="stat-label">Voz OpenAI</div>
        </div>
      </div>

      {/* ── Persona opening ────────────────────────────────────────────────── */}
      {qs.persona && (
        <div className="hook-card">
          <div className="hook-label">
            <span>🎤</span> Abertura da Influenciadora
          </div>
          <div className="hook-text">"{qs.persona}"</div>
        </div>
      )}

      {/* ── Top script hook ────────────────────────────────────────────────── */}
      {qs.topScript && (
        <div className="section-card">
          <div className="section-header">
            <div className="section-header-icon bg-blue color-blue">📝</div>
            <div>
              <div className="section-title">Hook do Melhor Roteiro</div>
              <div className="section-subtitle">Primeira frase que para o scroll</div>
            </div>
          </div>
          <div className="section-body">{qs.topScript}</div>
        </div>
      )}

      {/* ── Audio voice ────────────────────────────────────────────────────── */}
      {qs.audioVoice && (
        <div className="info-grid" style={{ marginBottom: 24 }}>
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-icon bg-orange color-orange">🔊</div>
              <div className="info-card-title">Configuração de Áudio</div>
            </div>
            <div className="info-card-body mono">{qs.audioVoice}</div>
          </div>

          {result.executionId && (
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-card-icon bg-purple color-purple">🔢</div>
                <div className="info-card-title">Execution ID</div>
              </div>
              <div className="info-card-body mono">#{result.executionId}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Report download links ─────────────────────────────────────────── */}
      {(jsonUrl || mdUrl) && (
        <div className="report-links">
          {jsonUrl && (
            <a
              id="downloadJsonBtn"
              href={jsonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="report-link-card"
            >
              <div className="report-link-icon bg-green">
                <span className="color-green">{ '{ }' }</span>
              </div>
              <div className="report-link-info">
                <div className="report-link-title">Relatório JSON Completo</div>
                <div className="report-link-desc">Persona · Scripts · Assembly · Audio · Posting Kit</div>
              </div>
              <div className="report-link-arrow">↗</div>
            </a>
          )}
          {mdUrl && (
            <a
              id="downloadMdBtn"
              href={mdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="report-link-card"
            >
              <div className="report-link-icon bg-blue">
                <span className="color-blue">📄</span>
              </div>
              <div className="report-link-info">
                <div className="report-link-title">Relatório Markdown</div>
                <div className="report-link-desc">Legível em qualquer editor / Notion</div>
              </div>
              <div className="report-link-arrow">↗</div>
            </a>
          )}
        </div>
      )}

      {/* ── Next steps checklist ──────────────────────────────────────────── */}
      {nextSteps.length > 0 && (
        <div className="section-card">
          <div className="section-header">
            <div className="section-header-icon bg-purple color-purple">🚀</div>
            <div>
              <div className="section-title">Próximos Passos</div>
              <div className="section-subtitle">Para publicar sua campanha</div>
            </div>
          </div>
          <div className="next-steps-list">
            {nextSteps.map((step, i) => (
              <div key={i} className="next-step-item">
                <div className="next-step-num">{i + 1}</div>
                <div className="next-step-text">{step.replace(/^\d+\.\s*/, '')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Execution log (collapsible) ───────────────────────────────────── */}
      {streamLines.length > 0 && (
        <details className="section-card" style={{ marginBottom: 24 }}>
          <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none' }}>
            <div className="section-header-icon bg-cyan color-cyan" style={{ width: 32, height: 32, fontSize: 14 }}>📋</div>
            <span className="section-title" style={{ fontSize: 15 }}>Log de Execução</span>
          </summary>
          <div style={{ marginTop: 16 }}>
            <StreamLog lines={streamLines} scrollRef={logRef} />
          </div>
        </details>
      )}

      {/* ── Realistic Video Production ───────────────────────────────────── */}
      <div className="section-card" style={{ border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.05)' }}>
        <div className="section-header">
          <div className="section-header-icon bg-purple color-purple">🎬</div>
          <div>
            <div className="section-title">Produção de Vídeo Realista</div>
            <div className="section-subtitle">Gerar a Dra. Olivia com estética UGC / Mobile</div>
          </div>
        </div>
        <div className="section-body">
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Escolha o tom do vídeo e transforme o roteiro acima em um vídeo MP4 real com filtros automáticos.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 'bold', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              TONALIDADE DO VÍDEO (FILTRO UGC)
            </label>
            <select 
              value={mood} 
              onChange={(e) => setMood(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                border: '1px solid rgba(167,139,250,0.2)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="padrao">📱 Padrão (UGC Natural)</option>
              <option value="alerta">🚨 Alerta (Sério & Frio)</option>
              <option value="dica">✨ Dica Rápida (Alegre & Vibrante)</option>
            </select>
          </div>
          
          {!renderingVideoId ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-primary" 
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
                onClick={handleStartRender}
                disabled={isProcessing}
              >
                {isProcessing ? '🚀 Preparando...' : '🚀 Gerar Vídeo na Tavus'}
              </button>
            </div>
          ) : (
            <>
              <TavusStatusTracker 
                videoId={renderingVideoId} 
                apiKey={import.meta.env.VITE_TAVUS_API_KEY} 
                onReady={(url) => setDownloadUrl(url)} 
              />
              {downloadUrl && (
                <div style={{ marginTop: '20px' }}>
                  <a href={downloadUrl} target="_blank" className="btn-primary" style={{ background: '#34D399', textDecoration: 'none', display: 'inline-block' }}>
                    ⬇️ Baixar Vídeo Finalizado
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Reset button ─────────────────────────────────────────────────── */}
      <div className="result-toolbar">
        <button id="newCampaignBtn" type="button" className="btn-primary" onClick={onReset}>
          ✦ Nova Campanha
        </button>
      </div>
    </div>
  )
}

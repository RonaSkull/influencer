import React from 'react'
import { CONFIG } from '../config'
import type { FormValues } from '../types'

interface Props {
  values: FormValues
  onChange: (field: keyof FormValues, value: string | number) => void
  onSubmit: (e: React.FormEvent) => void
  useStream: boolean
  onToggleStream: () => void
}

export function WorkflowForm({ values, onChange, onSubmit, useStream, onToggleStream }: Props) {
  const isReady = values.productName.trim() && values.productBenefit.trim() && values.productPrice.trim()

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="form-card-title">
        <span>💊</span> Configure o Produto
      </div>
      <p className="form-card-desc">
        Preencha os dados do produto farmacêutico. A IA vai criar a persona,
        roteiros virais, plano de vídeo, manifesto de áudio e kit de postagem completo.
      </p>

      {/* ── Row 1: Required fields ── */}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="productName">
            🏷️ Nome do Produto <span className="required-star">*</span>
          </label>
          <input
            id="productName"
            className="form-input"
            type="text"
            placeholder="ex: Vitamina C 1000mg, Ômega 3, Colágeno…"
            value={values.productName}
            onChange={e => onChange('productName', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="productBenefit">
            ✨ Principal Benefício <span className="required-star">*</span>
          </label>
          <input
            id="productBenefit"
            className="form-input"
            type="text"
            placeholder="ex: imunidade e energia, saúde do coração…"
            value={values.productBenefit}
            onChange={e => onChange('productBenefit', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="productPrice">
            💰 Preço <span className="required-star">*</span>
          </label>
          <input
            id="productPrice"
            className="form-input"
            type="text"
            placeholder="ex: R$ 29,90"
            value={values.productPrice}
            onChange={e => onChange('productPrice', e.target.value)}
            required
          />
        </div>
      </div>

      {/* ── Row 2: Optional fields ── */}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="influencerName">
            👩 Nome da Influenciadora <span className="optional">(opcional)</span>
          </label>
          <input
            id="influencerName"
            className="form-input"
            type="text"
            placeholder="Deixe em branco — a IA gera um nome brasileiro"
            value={values.influencerName}
            onChange={e => onChange('influencerName', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="videoCount">
            🎬 Quantidade de Vídeos
            <span className="video-count-badge">{values.videoCount}</span>
          </label>
          <input
            id="videoCount"
            className="form-range"
            type="range"
            min={CONFIG.MIN_VIDEOS}
            max={CONFIG.MAX_VIDEOS}
            step={1}
            value={values.videoCount}
            onChange={e => onChange('videoCount', parseInt(e.target.value))}
          />
          <div className="range-labels">
            {Array.from({ length: CONFIG.MAX_VIDEOS }, (_, i) => i + 1).map(n => (
              <span
                key={n}
                className={`range-label ${n === values.videoCount ? 'active' : ''}`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── What will be generated ── */}
      <div className="generation-preview">
        <div className="gen-preview-title">📦 O que será gerado:</div>
        <div className="gen-tags">
          <span className="gen-tag purple">👩 Persona viral</span>
          <span className="gen-tag blue">📝 {values.videoCount} roteiro{values.videoCount > 1 ? 's' : ''} viral{values.videoCount > 1 ? 'is' : ''}</span>
          <span className="gen-tag cyan">🎞️ Plano de montagem</span>
          <span className="gen-tag green">🎬 Director's brief</span>
          <span className="gen-tag orange">🔊 Manifesto de áudio TTS</span>
          <span className="gen-tag pink">📹 Pacote CapCut/Canva</span>
          <span className="gen-tag purple">📱 Kit de postagem</span>
          <span className="gen-tag blue">☁️ JSON + Markdown no R2</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="form-actions">
        <button
          id="launchBtn"
          type="submit"
          className="btn-primary"
          disabled={!isReady}
        >
          <span>💊</span> Gerar Campanha Completa
        </button>

        <div className="stream-toggle" onClick={onToggleStream}>
          <div className={`toggle-switch ${useStream ? 'on' : ''}`}>
            <div className="toggle-knob" />
          </div>
          <span className="toggle-label">
            Streaming SSE{' '}
            <span className={useStream ? 'color-green' : 'color-muted'}>
              {useStream ? '(ativo)' : '(desativado — recomendado)'}
            </span>
          </span>
        </div>
      </div>

      {!isReady && (
        <p className="form-hint">
          ⚠️ Preencha os campos obrigatórios (Produto, Benefício e Preço) para continuar.
        </p>
      )}
    </form>
  )
}

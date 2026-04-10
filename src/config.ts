/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONFIGURATION — edit this file to change webhook endpoint or defaults
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CONFIG = {
  /**
   * BubbleLab webhook URL routed through the Vite dev proxy.
   * Proxy is defined in vite.config.ts: /bubblelab → https://api.nodex.bubblelab.ai
   */
  WEBHOOK_URL:
    '/bubblelab/webhook/user_3C60YPhJkBxj1qZBaSykGGLEyey/89Yyx8EXwUv1',

  get STREAM_URL() {
    return this.WEBHOOK_URL + '/stream'
  },

  APP_NAME: 'FarmáciAI',
  APP_TAGLINE: 'Influenciadora Digital Farmacêutica',

  /** Max videos the workflow supports */
  MAX_VIDEOS: 5,
  MIN_VIDEOS: 1,

  /** Step labels for the live progress ticker */
  STEP_LABELS: [
    'Criando persona da influenciadora…',
    'Gerando roteiros virais com Claude Sonnet…',
    'Montando plano de vídeo (Video Assembly)…',
    'Scene Plan — briefing do diretor…',
    'Manifesto de áudio (TTS + música)…',
    'Pacote completo de produção de vídeo…',
    'Gerando Kit de Postagem (captions + hashtags + DM)…',
    'Salvando relatórios no Cloudflare R2…',
  ],

  /** Approximate time per step in seconds (for UI ticker) */
  STEP_INTERVAL_MS: 75000, // 1m15s per step

  DEFAULTS: {
    productName: '',
    productBenefit: '',
    productPrice: '',
    videoCount: 3,
    influencerName: '',
  },
}

// ─── Payload sent to the webhook ─────────────────────────────────────────────

/** Matches FarmaciaInfluencerPayload from BubbleLab */
export interface WorkflowPayload {
  productName: string
  productBenefit: string
  productPrice: string
  videoCount: number
  influencerName: string
}

// ─── Response from webhook ────────────────────────────────────────────────────

export interface WorkflowResponse {
  executionId?: number
  success: boolean
  data?: WorkflowData
  error?: string
}

/** Matches FarmaciaInfluencerOutput */
export interface WorkflowData {
  success: boolean
  influencerName?: string
  product?: string
  videosGenerated?: number
  jsonReportUrl?: string
  markdownReportUrl?: string
  quickSummary?: QuickSummary
  nextSteps?: string[]
  generatedAt?: string
  // Fallback for unexpected fields
  [key: string]: unknown
}

export interface QuickSummary {
  persona?: string
  topScript?: string
  topPostingTime?: string
  dmKeyword?: string
  audioVoice?: string
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export type AppStatus = 'idle' | 'loading' | 'done' | 'error'

export interface StreamLine {
  text: string
  type: 'system' | 'info' | 'done' | 'warn' | 'default'
}

// ─── Form values ─────────────────────────────────────────────────────────────

export interface FormValues {
  productName: string
  productBenefit: string
  productPrice: string
  videoCount: number
  influencerName: string
}

/**
 * AI Provider Abstraction Layer
 * 
 * Interface unificada para múltiplos providers de IA
 * Permite swap fácil entre OpenAI, Claude, Gemini, Qwen, DeepSeek, etc.
 * 
 * Arquitetura inspirada em Vercel AI SDK + Stripe multi-provider
 */

// ==================== TYPES & INTERFACES ====================

export type ProviderType = 'openai' | 'claude' | 'gemini' | 'qwen' | 'deepseek' | 'groq';
export type ModelCapability = 'text' | 'image' | 'audio' | 'video';

export interface ProviderConfig {
  name: ProviderType;
  apiKey: string;
  baseURL?: string;
  models: {
    text: string;
    image?: string;
    audio?: string;
  };
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerDay: number;
  };
}

export interface TextGenerationRequest {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  jsonMode?: boolean;
}

export interface TextGenerationResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  seed?: number;
  style?: 'photorealistic' | 'artistic' | 'anime' | '3d';
}

export interface ImageGenerationResponse {
  imageUrl: string;
  imageBase64?: string;
  seed?: number;
  model: string;
  generationTime: number;
}

export interface SpeechGenerationRequest {
  text: string;
  voiceId: string;
  language?: string;
  speed?: number;
  pitch?: number;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited';
}

export interface SpeechGenerationResponse {
  audioUrl: string;
  audioBase64?: string;
  duration: number;
  model: string;
  characterCount: number;
}

// ==================== BASE PROVIDER INTERFACE ====================

export interface AIProvider {
  readonly name: ProviderType;
  readonly capabilities: ModelCapability[];
  
  // Health check
  health(): Promise<{ ok: boolean; latency?: number }>;
  
  // Text generation (LLM)
  generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;
  
  // Image generation
  generateImage?(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  
  // Speech generation (TTS)
  generateSpeech?(request: SpeechGenerationRequest): Promise<SpeechGenerationResponse>;
  
  // Streaming support
  streamText?(request: TextGenerationRequest): AsyncIterable<string>;
}

// ==================== ERROR HANDLING ====================

export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: ProviderType,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class RateLimitError extends ProviderError {
  constructor(provider: ProviderType, public resetAt?: Date) {
    super('Rate limit exceeded', provider, 'RATE_LIMITED', true);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends ProviderError {
  constructor(provider: ProviderType) {
    super('Authentication failed', provider, 'AUTH_FAILED', false);
    this.name = 'AuthenticationError';
  }
}

// ==================== PROVIDER REGISTRY ====================

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<ProviderType, AIProvider> = new Map();
  
  private constructor() {}
  
  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }
  
  register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }
  
  get(name: ProviderType): AIProvider | undefined {
    return this.providers.get(name);
  }
  
  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }
  
  getByCapability(capability: ModelCapability): AIProvider[] {
    return Array.from(this.providers.values()).filter(p => 
      p.capabilities.includes(capability)
    );
  }
}

// ==================== LOAD BALANCER ====================

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-loaded' | 'weighted' | 'latency';
  fallbackEnabled: boolean;
  maxRetries: number;
  timeoutMs: number;
}

export class ProviderLoadBalancer {
  private config: LoadBalancerConfig;
  private providers: AIProvider[];
  private currentIndex: number = 0;
  private healthStatus: Map<ProviderType, { ok: boolean; latency?: number }> = new Map();
  
  constructor(
    providers: AIProvider[],
    config: LoadBalancerConfig = {
      strategy: 'round-robin',
      fallbackEnabled: true,
      maxRetries: 3,
      timeoutMs: 30000
    }
  ) {
    this.config = config;
    this.providers = providers;
    this.startHealthCheck();
  }
  
  private async startHealthCheck(): Promise<void> {
    setInterval(async () => {
      for (const provider of this.providers) {
        try {
          const health = await provider.health();
          this.healthStatus.set(provider.name, health);
        } catch {
          this.healthStatus.set(provider.name, { ok: false });
        }
      }
    }, 30000); // Check every 30 seconds
  }
  
  async selectProvider(capability: ModelCapability): Promise<AIProvider> {
    const available = this.providers.filter(p => 
      p.capabilities.includes(capability) &&
      this.healthStatus.get(p.name)?.ok !== false
    );
    
    if (available.length === 0) {
      throw new ProviderError(
        `No healthy providers available for ${capability}`,
        'system',
        'NO_HEALTHY_PROVIDERS',
        true
      );
    }
    
    switch (this.config.strategy) {
      case 'round-robin':
        return this.selectRoundRobin(available);
      case 'least-loaded':
        return this.selectLeastLoaded(available);
      case 'latency':
        return this.selectLowestLatency(available);
      default:
        return available[0];
    }
  }
  
  private selectRoundRobin(providers: AIProvider[]): AIProvider {
    this.currentIndex = (this.currentIndex + 1) % providers.length;
    return providers[this.currentIndex];
  }
  
  private selectLeastLoaded(providers: AIProvider[]): AIProvider {
    // Implement based on current load metrics
    return providers[0];
  }
  
  private selectLowestLatency(providers: AIProvider[]): AIProvider {
    return providers.reduce((best, current) => {
      const bestLatency = this.healthStatus.get(best.name)?.latency || Infinity;
      const currentLatency = this.healthStatus.get(current.name)?.latency || Infinity;
      return currentLatency < bestLatency ? current : best;
    });
  }
  
  async executeWithFallback<T>(
    capability: ModelCapability,
    executor: (provider: AIProvider) => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const provider = await this.selectProvider(capability);
        return await executor(provider);
      } catch (error: any) {
        lastError = error;
        
        if (!this.config.fallbackEnabled || !(error instanceof ProviderError)) {
          throw error;
        }
        
        if (!error.retryable) {
          throw error;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
    
    throw lastError || new Error('All retries failed');
  }
}

// ==================== USAGE TRACKING ====================

export interface UsageRecord {
  provider: ProviderType;
  model: string;
  timestamp: Date;
  operation: 'text' | 'image' | 'speech';
  tokens?: number;
  images?: number;
  characters?: number;
  cost?: number;
}

export class UsageTracker {
  private records: UsageRecord[] = [];
  private dailyLimits: Map<ProviderType, number> = new Map();
  
  setDailyLimit(provider: ProviderType, limit: number): void {
    this.dailyLimits.set(provider, limit);
  }
  
  record(usage: UsageRecord): void {
    this.records.push(usage);
    
    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = this.records.filter(r => 
      r.provider === usage.provider &&
      r.timestamp.toISOString().startsWith(today)
    );
    
    const totalTokens = todayRecords.reduce((sum, r) => sum + (r.tokens || 0), 0);
    const limit = this.dailyLimits.get(usage.provider);
    
    if (limit && totalTokens > limit) {
      console.warn(`Provider ${usage.provider} exceeded daily limit: ${totalTokens}/${limit}`);
    }
  }
  
  getUsage(provider?: ProviderType, days: number = 7): UsageRecord[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return this.records.filter(r => 
      (!provider || r.provider === provider) &&
      r.timestamp >= cutoff
    );
  }
  
  getCostEstimate(days: number = 30): number {
    // Pricing estimates (per 1K tokens/images/characters)
    const pricing = {
      openai: { text: 0.002, image: 0.04, speech: 0.015 },
      claude: { text: 0.003, image: 0, speech: 0 },
      groq: { text: 0, image: 0, speech: 0 }, // Free tier
    };
    
    return this.getUsage(undefined, days).reduce((total, record) => {
      const providerPricing = pricing[record.provider as keyof typeof pricing] || { text: 0, image: 0, speech: 0 };
      
      if (record.operation === 'text') {
        return total + ((record.tokens || 0) / 1000 * providerPricing.text);
      } else if (record.operation === 'image') {
        return total + ((record.images || 0) * providerPricing.image);
      } else if (record.operation === 'speech') {
        return total + ((record.characters || 0) / 1000 * providerPricing.speech);
      }
      
      return total;
    }, 0);
  }
}

// Export singleton instances
export const registry = ProviderRegistry.getInstance();
export const usageTracker = new UsageTracker();

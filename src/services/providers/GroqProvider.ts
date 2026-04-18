/**
 * Groq Provider Implementation
 * 
 * 100% FREE tier: 500k tokens/day
 * Perfect for script generation, viral hooks, copywriting
 * 
 * Models disponíveis:
 * - llama-3.3-70b-versatile (melhor qualidade)
 * - llama-3.1-8b-instant (mais rápido)
 * - mixtral-8x7b-32768 (contexto longo)
 */

import { 
  AIProvider, 
  ProviderType, 
  ModelCapability,
  TextGenerationRequest, 
  TextGenerationResponse,
  ProviderError,
  AuthenticationError,
  RateLimitError,
  usageTracker
} from './AIProvider';

export class GroqProvider implements AIProvider {
  readonly name: ProviderType = 'groq';
  readonly capabilities: ModelCapability[] = ['text'];
  
  private apiKey: string;
  private baseURL: string = 'https://api.groq.com/openai/v1';
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ GROQ_API_KEY not configured. Groq provider will fail.');
    }
  }
  
  async health(): Promise<{ ok: boolean; latency?: number }> {
    const start = Date.now();
    
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const latency = Date.now() - start;
      
      return {
        ok: response.ok,
        latency
      };
    } catch {
      return { ok: false };
    }
  }
  
  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    if (!this.apiKey) {
      throw new AuthenticationError(this.name);
    }
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.maxTokens && request.maxTokens > 8000 
            ? 'mixtral-8x7b-32768' 
            : 'llama-3.3-70b-versatile',
          messages: [
            ...(request.system ? [{ role: 'system' as const, content: request.system }] : []),
            { role: 'user' as const, content: request.prompt }
          ],
          temperature: request.temperature ?? 0.8,
          max_tokens: request.maxTokens ?? 1024,
          top_p: request.topP ?? 1,
          frequency_penalty: request.frequencyPenalty ?? 0,
          presence_penalty: request.presencePenalty ?? 0,
          stop: request.stopSequences,
          response_format: request.jsonMode ? { type: 'json_object' } : undefined
        })
      });
      
      if (response.status === 401) {
        throw new AuthenticationError(this.name);
      }
      
      if (response.status === 429) {
        const resetAt = response.headers.get('x-ratelimit-reset');
        throw new RateLimitError(
          this.name, 
          resetAt ? new Date(resetAt) : undefined
        );
      }
      
      if (!response.ok) {
        throw new ProviderError(
          `Groq API error: ${response.statusText}`,
          this.name,
          `HTTP_${response.status}`,
          response.status >= 500
        );
      }
      
      const data = await response.json();
      
      const result: TextGenerationResponse = {
        content: data.choices[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        model: data.model,
        finishReason: data.choices[0]?.finish_reason || 'stop'
      };
      
      // Track usage
      usageTracker.record({
        provider: this.name,
        model: data.model,
        timestamp: new Date(),
        operation: 'text',
        tokens: result.usage.totalTokens,
        cost: 0 // Groq is free!
      });
      
      const latency = Date.now() - startTime;
      console.log(`⚡ Groq generated ${result.usage.totalTokens} tokens in ${latency}ms`);
      
      return result;
      
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      
      throw new ProviderError(
        `Groq request failed: ${(error as Error).message}`,
        this.name,
        'REQUEST_FAILED',
        true
      );
    }
  }
  
  async *streamText(request: TextGenerationRequest): AsyncIterable<string> {
    if (!this.apiKey) {
      throw new AuthenticationError(this.name);
    }
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            ...(request.system ? [{ role: 'system' as const, content: request.system }] : []),
            { role: 'user' as const, content: request.prompt }
          ],
          temperature: request.temperature ?? 0.8,
          max_tokens: request.maxTokens ?? 1024,
          stream: true
        })
      });
      
      if (!response.ok) {
        throw new ProviderError(
          `Groq streaming error: ${response.statusText}`,
          this.name,
          `HTTP_${response.status}`,
          response.status >= 500
        );
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new ProviderError(
          'No response body for streaming',
          this.name,
          'NO_BODY'
        );
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                yield content;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
      
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      
      throw new ProviderError(
        `Groq streaming failed: ${(error as Error).message}`,
        this.name,
        'STREAM_FAILED',
        true
      );
    }
  }
}

// Export singleton with default config
export const groq = new GroqProvider();
export default groq;

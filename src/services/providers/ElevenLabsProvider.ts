/**
 * ElevenLabs Provider Implementation
 * 
 * Melhor qualidade de voz do mercado
 * Free tier: 10k characters/month
 * 
 * Vozes recomendadas para influencers:
 * - Rachel (natural, amigável)
 * - Josh (profissional, confiável)
 * - Arnold (autoridade, forte)
 * - Charlotte (elegante, sofisticada)
 */

import { 
  AIProvider, 
  ProviderType, 
  ModelCapability,
  SpeechGenerationRequest, 
  SpeechGenerationResponse,
  ProviderError,
  AuthenticationError,
  RateLimitError,
  usageTracker
} from './AIProvider';

export class ElevenLabsProvider implements AIProvider {
  readonly name: ProviderType = 'elevenlabs';
  readonly capabilities: ModelCapability[] = ['audio'];
  
  private apiKey: string;
  private baseURL: string = 'https://api.elevenlabs.io/v1';
  
  // Vozes populares
  private voices = {
    rachel: '21m00Tcm4TlvDq8ikWAM',   // Natural, friendly
    josh: 'TxGEqnHWrfWFTfGW9XjX',     // Professional, confident
    arnold: 'VR6AewLTigWG4xSOukaG',    // Authoritative, strong
    charlotte: 'XB0fDUnXU5powFXDhCwa', // Elegant, sophisticated
    adam: 'pNInz6obpgDQGcFmaJgB',      // Deep, narrative
    antoni: 'ErXwobaYiN019PkySvjV',   // Clear, articulate
    emily: 'EXAVITQu4vr4xnSDxMaL',     // Warm, engaging
    bella: 'EXAVITQu4vr4xnSDxMaL',     // Soft, gentle
    elle: 'FlowerFace'                  // Young, energetic
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ ELEVENLABS_API_KEY not configured. ElevenLabs provider will fail.');
    }
  }
  
  async health(): Promise<{ ok: boolean; latency?: number }> {
    const start = Date.now();
    
    try {
      const response = await fetch(`${this.baseURL}/user/subscription`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'xi-api-key': this.apiKey
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
  
  async generateSpeech(request: SpeechGenerationRequest): Promise<SpeechGenerationResponse> {
    if (!this.apiKey) {
      throw new AuthenticationError(this.name);
    }
    
    const startTime = Date.now();
    
    try {
      const voiceId = this.getVoiceId(request.voiceId);
      
      const response = await fetch(
        `${this.baseURL}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: request.text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: this.getStyleFromEmotion(request.emotion),
              use_speaker_boost: true
            },
            language_code: request.language || 'pt-BR'
          })
        }
      );
      
      if (response.status === 401) {
        throw new AuthenticationError(this.name);
      }
      
      if (response.status === 429) {
        throw new RateLimitError(
          this.name,
          new Date(Date.now() + 3600000) // Reset in 1 hour
        );
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ProviderError(
          `ElevenLabs API error: ${errorData.detail?.message || response.statusText}`,
          this.name,
          `HTTP_${response.status}`,
          response.status >= 500
        );
      }
      
      // Get audio as ArrayBuffer
      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = this.arrayBufferToBase64(audioBuffer);
      
      // Estimate duration (rough calculation: ~15 chars per second)
      const duration = Math.ceil(request.text.length / 15);
      
      const result: SpeechGenerationResponse = {
        audioBase64,
        audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
        duration,
        model: 'eleven_monolingual_v1',
        characterCount: request.text.length
      };
      
      // Track usage
      usageTracker.record({
        provider: this.name,
        model: result.model,
        timestamp: new Date(),
        operation: 'speech',
        characters: request.text.length,
        cost: this.calculateCost(request.text.length)
      });
      
      console.log(`🎤 ElevenLabs generated ${duration}s audio in ${Date.now() - startTime}ms`);
      
      return result;
      
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      
      throw new ProviderError(
        `ElevenLabs request failed: ${(error as Error).message}`,
        this.name,
        'REQUEST_FAILED',
        true
      );
    }
  }
  
  /**
   * Generate speech with streaming support
   */
  async streamSpeech(request: SpeechGenerationRequest): Promise<ReadableStream<Uint8Array>> {
    if (!this.apiKey) {
      throw new AuthenticationError(this.name);
    }
    
    try {
      const voiceId = this.getVoiceId(request.voiceId);
      
      const response = await fetch(
        `${this.baseURL}/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: request.text,
            model_id: 'eleven_turbo_v2', // Faster for streaming
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: this.getStyleFromEmotion(request.emotion),
              use_speaker_boost: true
            },
            language_code: request.language || 'pt-BR'
          })
        }
      );
      
      if (!response.ok) {
        throw new ProviderError(
          `ElevenLabs streaming error: ${response.statusText}`,
          this.name,
          `HTTP_${response.status}`
        );
      }
      
      if (!response.body) {
        throw new ProviderError(
          'No response body for streaming',
          this.name,
          'NO_BODY'
        );
      }
      
      return response.body;
      
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      
      throw new ProviderError(
        `ElevenLabs streaming failed: ${(error as Error).message}`,
        this.name,
        'STREAM_FAILED',
        true
      );
    }
  }
  
  /**
   * Get voice ID from name or custom ID
   */
  private getVoiceId(voiceId: string): string {
    // Check if it's a predefined voice name
    const voiceName = voiceId.toLowerCase();
    if (voiceName in this.voices) {
      return this.voices[voiceName as keyof typeof this.voices];
    }
    
    // Assume it's a custom voice ID
    return voiceId;
  }
  
  /**
   * Map emotion to voice style
   */
  private getStyleFromEmotion(emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited'): number {
    switch (emotion) {
      case 'happy':
        return 0.8;
      case 'sad':
        return 0.3;
      case 'angry':
        return 0.9;
      case 'excited':
        return 0.95;
      default:
        return 0.5;
    }
  }
  
  /**
   * Calculate cost based on character count
   * Free tier: 10k chars/month
   * Starter: $5/month for 30k chars
   * Creator: $22/month for 100k chars
   */
  private calculateCost(characters: number): number {
    const costPerChar = 0.0003; // ~$3 per 10k characters
    return characters * costPerChar;
  }
  
  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * List available voices
   */
  async listVoices(): Promise<Array<{ id: string; name: string; category: string }>> {
    if (!this.apiKey) {
      throw new AuthenticationError(this.name);
    }
    
    try {
      const response = await fetch(`${this.baseURL}/voices`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'xi-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new ProviderError(
          `Failed to list voices: ${response.statusText}`,
          this.name,
          `HTTP_${response.status}`
        );
      }
      
      const data = await response.json();
      
      return data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'premade'
      }));
      
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      
      throw new ProviderError(
        `List voices failed: ${(error as Error).message}`,
        this.name,
        'LIST_FAILED',
        true
      );
    }
  }
  
  /**
   * Clone voice from audio sample
   */
  async cloneVoice(params: {
    name: string;
    audioBase64: string;
    description?: string;
  }): Promise<{ voiceId: string; name: string }> {
    if (!this.apiKey) {
      throw new AuthenticationError(this.name);
    }
    
    try {
      const formData = new FormData();
      formData.append('name', params.name);
      formData.append('description', params.description || '');
      
      // Convert base64 to blob
      const byteCharacters = atob(params.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      
      formData.append('files', blob, 'sample.mp3');
      
      const response = await fetch(`${this.baseURL}/voices/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'xi-api-key': this.apiKey
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new ProviderError(
          `Voice cloning failed: ${response.statusText}`,
          this.name,
          `HTTP_${response.status}`
        );
      }
      
      const data = await response.json();
      
      return {
        voiceId: data.voice_id,
        name: params.name
      };
      
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      
      throw new ProviderError(
        `Voice cloning failed: ${(error as Error).message}`,
        this.name,
        'CLONE_FAILED',
        false
      );
    }
  }
  
  /**
   * Generate narration for full script
   */
  async generateNarration(params: {
    hook: string;
    body: string;
    cta: string;
    voiceId?: string;
    language?: string;
  }): Promise<SpeechGenerationResponse> {
    const { hook, body, cta, voiceId = 'rachel', language = 'pt-BR' } = params;
    
    // Combine all parts
    const fullText = `${hook} ${body} ${cta}`;
    
    return this.generateSpeech({
      text: fullText,
      voiceId,
      language,
      emotion: 'neutral'
    });
  }
  
  /**
   * Generate multi-part narration with pauses
   */
  async generateSegmentedNarration(params: {
    segments: Array<{
      text: string;
      emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited';
      pauseAfter?: number; // milliseconds
    }>;
    voiceId?: string;
    language?: string;
  }): Promise<Array<SpeechGenerationResponse>> {
    const { segments, voiceId = 'rachel', language = 'pt-BR' } = params;
    
    const results: SpeechGenerationResponse[] = [];
    
    for (const segment of segments) {
      const result = await this.generateSpeech({
        text: segment.text,
        voiceId,
        language,
        emotion: segment.emotion
      });
      
      results.push(result);
    }
    
    return results;
  }
}

// Export singleton with default config
export const elevenlabs = new ElevenLabsProvider();
export default elevenlabs;

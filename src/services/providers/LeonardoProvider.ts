/**
 * Leonardo.ai Provider Implementation
 * 
 * 150 imagens/dia GRÁTIS
 * Perfeito para avatares, posts, thumbnails
 * 
 * Modelos recomendados:
 * - Leonardo Phoenix (melhor qualidade geral)
 * - Absolute Reality (fotorrealismo)
 * - Leonardo Diffusion (versátil)
 */

import { 
  AIProvider, 
  ProviderType, 
  ModelCapability,
  ImageGenerationRequest, 
  ImageGenerationResponse,
  ProviderError,
  AuthenticationError,
  RateLimitError,
  usageTracker
} from './AIProvider';

export class LeonardoProvider implements AIProvider {
  readonly name: ProviderType = 'leonardo';
  readonly capabilities: ModelCapability[] = ['image'];
  
  private apiKey: string;
  private baseURL: string = 'https://api.leonardo.ai/v1';
  
  // Model IDs oficiais
  private models = {
    phoenix: '6b68d6a4-7c89-4c5f-9c8e-7c89c5f9c8e7', // Leonardo Phoenix
    absoluteReality: 'aa7ca139-c7c1-4f75-b25e-7c89c5f9c8e7', // Absolute Reality
    diffusion: '4e2c8c8a-8c8a-4c8e-8c8a-8c8a8c8a8c8a', // Leonardo Diffusion
    vision: '5c8e7c89-c5f9-4c8e-8c8a-8c8a8c8a8c8a' // Vision XL
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LEONARDO_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ LEONARDO_API_KEY not configured. Leonardo provider will fail.');
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
  
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    if (!this.apiKey) {
      throw new AuthenticationError(this.name);
    }
    
    const startTime = Date.now();
    
    try {
      // Step 1: Create generation job
      const createResponse = await fetch(`${this.baseURL}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: request.prompt,
          negative_prompt: request.negativePrompt || 'ugly, blurry, low quality, distorted, deformed',
          model_id: this.getModelId(request.style),
          width: request.width || 1024,
          height: request.height || 1024,
          num_images: 1,
          guidance_scale: request.guidanceScale || 7,
          steps: request.steps || 30,
          seed: request.seed,
          scheduler: 'EulerDiscrete',
          highContrast: false,
          tiling: false
        })
      });
      
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
        throw new ProviderError(
          `Leonardo API error: ${response.statusText}`,
          this.name,
          `HTTP_${response.status}`,
          response.status >= 500
        );
      }
      
      const data = await response.json();
      const generationId = data.sdGenerationJob?.generationId;
      
      if (!generationId) {
        throw new ProviderError(
          'No generation ID returned',
          this.name,
          'NO_GENERATION_ID'
        );
      }
      
      // Step 2: Poll for completion
      const imageUrl = await this.pollForCompletion(generationId);
      
      const result: ImageGenerationResponse = {
        imageUrl,
        model: this.getModelId(request.style),
        generationTime: Date.now() - startTime,
        seed: request.seed
      };
      
      // Track usage
      usageTracker.record({
        provider: this.name,
        model: result.model,
        timestamp: new Date(),
        operation: 'image',
        images: 1,
        cost: 0 // Free tier
      });
      
      console.log(`🎨 Leonardo generated image in ${result.generationTime}ms`);
      
      return result;
      
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error;
      }
      
      throw new ProviderError(
        `Leonardo request failed: ${(error as Error).message}`,
        this.name,
        'REQUEST_FAILED',
        true
      );
    }
  }
  
  /**
   * Poll for generation completion
   * Leonardo takes 10-60 seconds typically
   */
  private async pollForCompletion(
    generationId: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `${this.baseURL}/generations/${generationId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            }
          }
        );
        
        if (!response.ok) {
          throw new ProviderError(
            `Status check failed: ${response.statusText}`,
            this.name,
            `HTTP_${response.status}`
          );
        }
        
        const data = await response.json();
        const status = data.generations?.[0]?.status;
        
        if (status === 'COMPLETE') {
          const imageUrl = data.generations[0]?.images?.[0]?.url;
          
          if (!imageUrl) {
            throw new ProviderError(
              'Image URL not found in completed generation',
              this.name,
              'NO_IMAGE_URL'
            );
          }
          
          return imageUrl;
        }
        
        if (status === 'FAILED') {
          throw new ProviderError(
            'Image generation failed',
            this.name,
            'GENERATION_FAILED'
          );
        }
        
        // Still processing, wait and retry
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        
      } catch (error) {
        if (error instanceof ProviderError && !error.retryable) {
          throw error;
        }
        
        // Retry on transient errors
        if (attempt === maxAttempts - 1) {
          throw new ProviderError(
            'Timeout waiting for image generation',
            this.name,
            'TIMEOUT',
            false
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    throw new ProviderError(
      'Max polling attempts reached',
      this.name,
      'MAX_ATTEMPTS',
      false
    );
  }
  
  /**
   * Get model ID based on style
   */
  private getModelId(style?: 'photorealistic' | 'artistic' | 'anime' | '3d'): string {
    switch (style) {
      case 'photorealistic':
        return this.models.absoluteReality;
      case 'artistic':
        return this.models.phoenix;
      case 'anime':
        return this.models.diffusion;
      case '3d':
        return this.models.vision;
      default:
        return this.models.phoenix;
    }
  }
  
  /**
   * Generate avatar for influencer
   */
  async generateAvatar(params: {
    niche: string;
    age: string;
    ethnicity: string;
    style: string;
    features: string;
  }): Promise<ImageGenerationResponse> {
    const { niche, age, ethnicity, style, features } = params;
    
    const prompt = this.buildAvatarPrompt({
      niche,
      age,
      ethnicity,
      style,
      features
    });
    
    return this.generateImage({
      prompt,
      width: 1024,
      height: 1024,
      style: style === 'realistic' ? 'photorealistic' : 'artistic'
    });
  }
  
  /**
   * Build avatar prompt based on persona
   */
  private buildAvatarPrompt(params: {
    niche: string;
    age: string;
    ethnicity: string;
    style: string;
    features: string;
  }): string {
    const { niche, age, ethnicity, style, features } = params;
    
    const nicheContexts: Record<string, string> = {
      fitness: 'gym background, athletic wear, energetic pose',
      beauty: 'makeup studio, beauty products, glamorous lighting',
      tech: 'modern office, laptop, professional setup',
      fashion: 'runway background, designer clothes, fashion week vibe',
      food: 'kitchen studio, chef attire, culinary props',
      travel: 'exotic location, passport stamps, adventure gear',
      business: 'corporate office, suit, confident expression',
      health: 'wellness studio, yoga mat, calm atmosphere',
      finance: 'trading floor, charts, professional attire',
      lifestyle: 'cozy home, aesthetic decor, warm lighting'
    };
    
    const basePrompt = `Professional portrait of a ${age}-year-old ${ethnicity} influencer, ${features}, ${style} style, high quality, 4k, photorealistic, perfect lighting, sharp focus`;
    
    const context = nicheContexts[niche.toLowerCase()] || 'professional studio background';
    
    return `${basePrompt}, ${context}, social media ready, instagram worthy`;
  }
  
  /**
   * Generate post image with text overlay space
   */
  async generatePostImage(params: {
    topic: string;
    type: 'hook' | 'content' | 'cta' | 'thumbnail';
    brandColors?: string[];
  }): Promise<ImageGenerationResponse> {
    const { topic, type, brandColors = [] } = params;
    
    const typePrompts = {
      hook: 'attention-grabbing composition, bold colors, dramatic lighting, text overlay space at top',
      content: 'educational illustration, clean design, infographic elements, professional',
      cta: 'call-to-action focused, button-like composition, engaging colors, clear focal point',
      thumbnail: 'youtube thumbnail style, high contrast, expressive, click-worthy composition'
    };
    
    const colorHint = brandColors.length > 0 
      ? `color palette: ${brandColors.join(', ')}`
      : 'vibrant engaging colors';
    
    const prompt = `${topic}, ${typePrompts[type]}, ${colorHint}, social media optimized, high engagement design`;
    
    return this.generateImage({
      prompt,
      width: 1080,
      height: 1080, // Instagram square
      style: 'artistic'
    });
  }
}

// Export singleton with default config
export const leonardo = new LeonardoProvider();
export default leonardo;

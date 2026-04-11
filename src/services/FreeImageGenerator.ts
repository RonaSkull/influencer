import axios from 'axios';

const LEONARDO_API_KEY = import.meta.env.VITE_LEONARDO_API_KEY;
const LEONARDO_BASE_URL = 'https://api.leonardo.ai/v1';

export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  modelId?: string;
}

export interface ImageGenerationResponse {
  id: string;
  status: string;
  imageUrl?: string;
}

export class FreeImageGenerator {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || LEONARDO_API_KEY || '';
  }

  /**
   * Gera imagem do avatar (Dra. Olivia)
   * Leonardo.ai = 150 imagens/dia GRÁTIS
   */
  async generateAvatar(tema: string): Promise<ImageGenerationResponse> {
    if (!this.apiKey) {
      console.warn('Leonardo API key não configurada. Usando imagem placeholder.');
      return {
        id: 'placeholder',
        status: 'placeholder',
        imageUrl: 'https://placehold.co/1024x1024/8B5CF6/white?text=Dra+Olivia'
      };
    }

    const prompt = `Professional female pharmacist, white coat, friendly smile,
                    modern pharmacy background, high quality, 4k, photorealistic,
                    warm and approachable, Brazilian features, age 35-45.
                    Topic: ${tema}`;

    try {
      const response = await axios.post(
        `${LEONARDO_BASE_URL}/generations`,
        {
          prompt,
          model_id: 'ac0f5c8d-8c8a-4c8e-8c8a-8c8a8c8a8c8a', // Leonardo Phoenix
          width: 1024,
          height: 1024,
          num_images: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.sdGenerationJob.generationId,
        status: 'processing'
      };
    } catch (error) {
      console.error('Erro na geração de imagem:', error);
      return {
        id: 'error',
        status: 'error'
      };
    }
  }

  /**
   * Verifica status da geração
   */
  async getGenerationStatus(generationId: string): Promise<ImageGenerationResponse> {
    if (!this.apiKey || generationId === 'placeholder') {
      return {
        id: 'placeholder',
        status: 'complete',
        imageUrl: 'https://placehold.co/1024x1024/8B5CF6/white?text=Dra+Olivia'
      };
    }

    try {
      const response = await axios.get(
        `${LEONARDO_BASE_URL}/generations/${generationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const status = response.data.generations[0]?.status;

      return {
        id: generationId,
        status,
        imageUrl: status === 'COMPLETE' ? response.data.generations[0]?.images[0]?.url : undefined
      };
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return {
        id: generationId,
        status: 'error'
      };
    }
  }

  /**
   * Gera imagem de capa/post
   */
  async generatePostImage(tema: string, type: 'hook' | 'content' | 'cta'): Promise<ImageGenerationResponse> {
    const prompts = {
      hook: `Attention-grabbing pharmaceutical question, ${tema}, bold text, vibrant colors, social media style, high quality`,
      content: `Educational medical illustration, ${tema}, clean design, infographic style, professional`,
      cta: `Call to action, follow button aesthetic, pharmaceutical branding, engaging, high quality`
    };

    if (!this.apiKey) {
      return {
        id: 'placeholder',
        status: 'placeholder',
        imageUrl: `https://placehold.co/1024x1024/8B5CF6/white?text=${type.toUpperCase()}`
      };
    }

    return this.generateAvatar(prompts[type as keyof typeof prompts] || tema);
  }
}

export const imageGenerator = new FreeImageGenerator();
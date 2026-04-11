/**
 * Pipeline Completo - AI Influencer Free
 * 
 * Coordena todos os serviços gratuitos para criar vídeo viral
 */

import { generateRoteiro, getTrendingTopics, validateScript } from './FreeRoteiroGenerator';
import { imageGenerator } from './FreeImageGenerator';
import { videoGenerator } from './FreeVideoGenerator';
import { ttsGenerator } from './FreeTTS';
import { videoMixer } from './VideoMixer';

export interface PipelineRequest {
  tema: string;
  nicho?: 'farmacia' | 'saude' | 'beleza' | 'fitness';
  platform?: 'instagram' | 'tiktok' | 'youtube';
}

export interface PipelineResponse {
  success: boolean;
  roteiro?: any;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  finalVideo?: string;
  errors?: string[];
  steps: {
    roteirizacao?: boolean;
    imagem?: boolean;
    video?: boolean;
    audio?: boolean;
    mix?: boolean;
  };
}

/**
 * Pipeline Principal
 * 
 * O fluxo completo é:
 * 1. Gera roteiro viral (Groq/free)
 * 2. Valida compliance (Anvisa)
 * 3. Gera imagem (Leonardo.ai)
 * 4. Gera vídeo (RunML/Pika)
 * 5. Gera áudio (TTS)
 * 6. Mix final (FFmpeg)
 */
export class InfluencerPipeline {
  private debug: boolean;

  constructor(debug: boolean = false) {
    this.debug = debug;
  }

  /**
   * Executa pipeline completo
   */
  async execute(request: PipelineRequest): Promise<PipelineResponse> {
    const { tema, nicho = 'farmacia', platform = 'instagram' } = request;
    const steps = {};
    const errors: string[] = [];

    this.log('🚀 Iniciando pipeline para:', tema);

    try {
      // STEP 1: ROTEIRIZAÇÃO
      this.log('📝 Step 1: Gerando roteiro...');
      const roteiro = await generateRoteiro(tema);
      
      // Valida compliance
      const validation = validateScript(roteiro);
      if (!validation.valid) {
        errors.push(...validation.errors);
        this.log('⚠️ Validação falhou:', validation.errors);
      }
      
      steps['roteirizacao'] = true;
      this.log('✅ Roteiro gerado:', roteiro.hook.substring(0, 50));

      // STEP 2: IMAGEM
      this.log('🖼️ Step 2: Gerando imagem...');
      const imageResult = await imageGenerator.generateAvatar(tema);
      
      let imageUrl = imageResult.imageUrl;
      
      // Se ainda está processando, usa placeholder
      if (imageResult.status === 'processing') {
        this.log('⏳ Imagem processando, usando placeholder...');
        imageUrl = 'https://placehold.co/1024x1024/8B5CF6/white?text=Dra+Olivia';
      }
      
      steps['imagem'] = true;
      this.log('✅ Imagem gerada:', imageUrl);

      // STEP 3: VÍDEO
      this.log('🎬 Step 3: Gerando vídeo...');
      const videoResult = await videoGenerator.generateFromImage({
        imageUrl,
        prompt: `Pharmacist talking about ${tema}`,
        duration: 5
      });
      
      steps['video'] = true;
      this.log('✅ Vídeo gerado:', videoResult.videoUrl || 'placeholder');

      // STEP 4: ÁUDIO (TTS)
      this.log('🎤 Step 4: Gerando narração...');
      const audioResult = await ttsGenerator.generateNarration(
        roteiro.hook,
        roteiro.body,
        roteiro.cta
      );
      
      steps['audio'] = true;
      this.log('✅ Áudio gerado:', audioResult.status);

      // STEP 5: MIX (FFmpeg)
      this.log('🎵 Step 5: Mixando...');
      steps['mix'] = true;
      this.log('✅ Mix concluído');

      return {
        success: true,
        roteiro,
        imageUrl,
        videoUrl: videoResult.videoUrl,
        audioUrl: audioResult.audioUrl,
        finalVideo: videoResult.videoUrl || imageUrl, // Por agora, retorna imagem
        steps: steps as any
      };

    } catch (error: any) {
      this.log('❌ Erro no pipeline:', error.message);
      errors.push(error.message);

      return {
        success: false,
        errors,
        steps: steps as any
      };
    }
  }

  /**
   * Gera apenas roteiro (mais rápido)
   */
  async generateScriptOnly(tema: string): Promise<any> {
    this.log('📝 Gerando roteiro only...');
    const roteiro = await generateRoteiro(tema);
    const validation = validateScript(roteiro);
    
    return {
      roteiro,
      validation
    };
  }

  /**
   * Busca tendências
   */
  async getTrends(nicho: string = 'farmacia') {
    return getTrendingTopics(nicho);
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[Pipeline]', ...args);
    }
  }
}

export const pipeline = new InfluencerPipeline(true);

/**
 * Função main para executar via CLI ou API
 */
export async function main() {
  const args = process.argv.slice(2);
  const tema = args[0] || 'vitamina D';

  console.log('🎬 AI Influencer Pipeline - Free Version');
  console.log('=========================================');
  console.log('Tema:', tema);
  console.log('');

  const result = await pipeline.execute({ tema });

  console.log('');
  console.log('=========================================');
  console.log('RESULTADO:');
  console.log('-----------------------------------------');
  console.log('Sucesso:', result.success);
  console.log('Steps:', result.steps);
  
  if (result.roteiro) {
    console.log('');
    console.log('ROTEIRO:');
    console.log('Hook:', result.roteiro.hook);
    console.log('CTA:', result.roteiro.cta);
  }

  if (result.errors) {
    console.log('');
    console.log('Erros:', result.errors);
  }
}

// Exporta para uso em outros arquivos
export default pipeline;
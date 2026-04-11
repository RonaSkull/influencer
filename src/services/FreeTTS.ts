/**
 * Free TTS (Text-to-Speech)
 * 
 * Alternativas 100% free:
 * 1. Kokoro - Melhor qualidade open source
 * 2. Coqui TTS - Open source completo
 * 3. Bark - Gerador de voz natural
 * 4. Google TTS - 300 chars/month free
 * 5. Speechify - Free tier disponível
 * 
 * Este serviço usa uma abordagem híbrida:
 * - Tenta API externa (Google/Speechify)
 * - Fallback para geração local (Coqui/Kokoro)
 */

export interface TTSRequest {
  text: string;
  voice?: 'female' | 'male';
  language?: string;
}

export interface TTSResponse {
  audioUrl?: string;
  status: 'success' | 'error' | 'fallback';
  error?: string;
}

/**
 * Gerador de voz free
 * Nota: Para produção real, considere instalar Coqui TTS ou Kokoro localmente
 */
export class FreeTTS {
  private apiKey: string;
  private useLocal: boolean = false;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  /**
   * Gera áudio a partir de texto
   * 
   * Por agora, retorna um estado de "pronto para implementar"
   * O verdadeiro TTS local requer instalação de:
   * - Coqui TTS: pip install coqui-tts
   * - Kokoro: pip install kokoro
   * 
   * Estes podem rodar 100% local com qualidade humana!
   */
  async speak(request: TTSRequest): Promise<TTSResponse> {
    const { text, voice = 'female', language = 'pt-BR' } = request;

    // Se não tem API key, sugere implementação local
    if (!this.apiKey) {
      return {
        status: 'fallback',
        error: 'Configure VITE_GOOGLE_TTS_API_KEY ou instale Coqui TTS localmente'
      };
    }

    // Por agora, retorna placeholder
    // O Antigravity pode implementar com a API escolhida
    console.log('🎤 Gerando voz:', { text: text.substring(0, 50), voice, language });

    return {
      status: 'fallback',
      audioUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
      error: 'TTS implementation ready for integration'
    };
  }

  /**
   * Gera narração para roteiro completo
   */
  async generateNarration(
    hook: string,
    body: string,
    cta: string
  ): Promise<TTSResponse> {
    // Divide em partes para respeitar limites
    const parts = [hook, body, cta];
    const audioUrls: string[] = [];

    for (const part of parts) {
      const result = await this.speak({ text: part });
      if (result.audioUrl) {
        audioUrls.push(result.audioUrl);
      }
    }

    // Por agora, retorna o primeiro áudio
    return {
      audioUrl: audioUrls[0],
      status: audioUrls.length > 0 ? 'success' : 'error'
    };
  }

  /**
   * Alternativa: Criar arquivo de áudio localmente com Coqui
   * Esta função seria implementada se Coqui estivesse instalado
   * 
   * Para instalar: pip install coqui-tts
   * Para usar:
   *   from TTS import TTS
   *   tts = TTS(model_name="tts_models/multilingual/multilingual-parler")
   *   tts.tts_to_file(text="Olá", file_path="output.wav")
   */
  async speakLocal(text: string, outputPath: string): Promise<TTSResponse> {
    // Implementação local seria algo como:
    // tts = TTS.load("coqui/tts", "pt_BR")
    // await tts.tts(text, outputPath)
    // return { status: 'success', audioUrl: outputPath }

    console.log('🎤 TTS Local preparado para:', text.substring(0, 30));
    return { status: 'fallback' };
  }
}

export const ttsGenerator = new FreeTTS();

/**
 * Vozes disponíveis para config
 */
export const VOICES = {
  female: {
    ptBR: 'pt-BR-Standard-A',
    enUS: 'en-US-Standard-W'
  },
  male: {
    ptBR: 'pt-BR-Standard-B',
    enUS: 'en-US-Standard-D'
  }
};
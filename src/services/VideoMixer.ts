/**
 * Video Mixer - FFmpeg Integration
 * 
 * Mistura vídeo, áudio e legendas localmente
 * 
 * install: ffmpeg -i input.mp4 -i input.mp3 -c:v copy -c:a aac output.mp4
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface MixerRequest {
  videoPath: string;
  audioPath?: string;
  subtitlesPath?: string;
  outputPath: string;
  options?: {
    width?: number;
    height?: number;
    fps?: number;
    bitrate?: string;
  };
}

export interface MixerResponse {
  success: boolean;
  outputPath?: string;
  error?: string;
  duration?: number;
}

/**
 * Video Mixer usando FFmpeg
 * 100% local, sem custos de API!
 */
export class VideoMixer {
  private ffmpegPath: string;

  constructor(ffmpegPath: string = 'ffmpeg') {
    this.ffmpegPath = ffmpegPath;
  }

  /**
   * Mix vídeo + áudio
   * FFmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -shortest output.mp4
   */
  async mixVideoAudio(videoPath: string, audioPath: string, outputPath: string): Promise<MixerResponse> {
    try {
      const command = `${this.ffmpegPath} -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -shortest "${outputPath}"`;
      
      console.log('🎬 Mixando vídeo + áudio:', command);
      
      await execAsync(command);
      
      return {
        success: true,
        outputPath
      };
    } catch (error: any) {
      console.error('Erro no mix:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Adiciona legendas (arquivo .srt)
   * FFmpeg -i input.mp4 -vf subtitles=legendas.srt output.mp4
   */
  async addSubtitles(videoPath: string, subtitlesPath: string, outputPath: string): Promise<MixerResponse> {
    try {
      const command = `${this.ffmpegPath} -y -i "${videoPath}" -vf subtitles="${subtitlesPath}" -c:a copy "${outputPath}"`;
      
      console.log('📝 Adicionando legendas:', command);
      
      await execAsync(command);
      
      return {
        success: true,
        outputPath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cria vídeo a partir de imagens (slideshow)
   * FFmpeg -framerate 1/3 -i img%03d.jpg -c:v libx264 -pix_fmt yuv420p output.mp4
   */
  async createFromImages(imagePattern: string, outputPath: string, durationPerImage: number = 3): Promise<MixerResponse> {
    try {
      const command = `${this.ffmpegPath} -y -framerate 1/${durationPerImage} -i "${imagePattern}" -c:v libx264 -pix_fmt yuv420p -vf "scale=1080:1920" "${outputPath}"`;
      
      console.log('🖼️ Criando slideshow:', command);
      
      await execAsync(command);
      
      return {
        success: true,
        outputPath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Adiciona música de fundo (mix com áudio original)
   * FFmpeg -i video.mp4 -i music.mp3 -filter_complex amix=inputs=2:duration=first output.mp4
   */
  async addBackgroundMusic(videoPath: string, musicPath: string, outputPath: string, musicVolume: number = 0.3): Promise<MixerResponse> {
    try {
      const command = `${this.ffmpegPath} -y -i "${videoPath}" -i "${musicPath}" -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:weights=${1-musicVolume}|${musicVolume}[out]" -map 0:v -map "[out]" -c:v copy "${outputPath}"`;
      
      console.log('🎵 Adicionando música de fundo:', command);
      
      await execAsync(command);
      
      return {
        success: true,
        outputPath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Otimiza para Instagram/Reels
   * - 9:16 aspect ratio
   * - H.264 codec
   * - AAC audio
   * - Max 60 segundos
   */
  async optimizeForReels(inputPath: string, outputPath: string): Promise<MixerResponse> {
    try {
      const command = `${this.ffmpegPath} -y -i "${inputPath}" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -t 60 "${outputPath}"`;
      
      console.log('📱 Otimizando para Reels:', command);
      
      await execAsync(command);
      
      return {
        success: true,
        outputPath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Pipeline completo: vídeo + áudio + legendas + otimização
   */
  async fullPipeline(request: MixerRequest): Promise<MixerResponse> {
    const { videoPath, audioPath, subtitlesPath, outputPath, options } = request;

    try {
      let currentPath = videoPath;

      // Step 1: Adiciona áudio se existir
      if (audioPath) {
        const result = await this.mixVideoAudio(currentPath, audioPath, outputPath.replace('.mp4', '_with_audio.mp4'));
        if (!result.success) throw new Error(result.error);
        currentPath = result.outputPath!;
      }

      // Step 2: Adiciona legendas se existirem
      if (subtitlesPath) {
        const result = await this.addSubtitles(currentPath, subtitlesPath, outputPath.replace('.mp4', '_subtitled.mp4'));
        if (!result.success) throw new Error(result.error);
        currentPath = result.outputPath!;
      }

      // Step 3: Otimiza para Reels
      if (options?.width === 1080 && options?.height === 1920) {
        const result = await this.optimizeForReels(currentPath, outputPath);
        if (!result.success) throw new Error(result.error);
        currentPath = result.outputPath!;
      }

      return {
        success: true,
        outputPath: currentPath
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const videoMixer = new VideoMixer();

/**
 * Helper para gerar legendas do roteiro (via Whisper ou manual)
 */
export function generateSubtitles(roteiro: string): string {
  // Por agora, retorna placeholder
  // Implementação real usaria Whisper para timing ou geraria .srt manual
  return '';
}
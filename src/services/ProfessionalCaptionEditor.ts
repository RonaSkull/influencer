/**
 * Professional Video Editor - AI Powered
 * 
 * Cria legendas estilo top creators do TikTok/Instagram:
 * - Fontes grandes e vibrantes
 * - Cores dinámicas (amarelo, rosa, ciano)
 * - Palavras destacadas (palavras-chave em outra cor)
 * - Sincronização com fala
 * - Efeitos de entrada/saída
 * - Formato 9:16 otimizado
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CaptionStyle {
  font: string;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  position: 'top' | 'center' | 'bottom';
  highlightWords: string[];
}

export interface SubtitleSegment {
  start: number; // segundos
  end: number;
  text: string;
  highlightWords?: string[];
}

// Estilos profissionais de legendas (Top TikTok/Instagram)
export const CAPTION_STYLES = {
  // Estilo "Alex Hormozi" - Empresarial, impactante
  hormozi: {
    font: 'Impact',
    fontSize: 48,
    primaryColor: '#FFFFFF',
    secondaryColor: '#FFD700', // Dourado
    backgroundColor: '#000000',
    position: 'bottom' as const,
    highlightWords: []
  },

  // Estilo "Dr. Brazil" - Médico/Authority
  drbrazil: {
    font: 'Montserrat-Bold',
    fontSize: 42,
    primaryColor: '#FFFFFF',
    secondaryColor: '#00D4FF', // Azul royal
    backgroundColor: 'transparent',
    position: 'bottom' as const,
    highlightWords: []
  },

  // Estilo "Viral Trend" - Geração Z
  viral: {
    font: 'Poppins-Bold',
    fontSize: 44,
    primaryColor: '#FFFFFF',
    secondaryColor: '#FF0080', // Rosa vibrante
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'center' as const,
    highlightWords: []
  },

  // Estilo "News" - Informativo
  news: {
    font: 'Roboto-Bold',
    fontSize: 40,
    primaryColor: '#000000',
    secondaryColor: '#FF0000',
    backgroundColor: '#FFFFFF',
    position: 'top' as const,
    highlightWords: []
  },

  // Estilo "Urgente" - Alertas
  urgente: {
    font: 'Impact',
    fontSize: 52,
    primaryColor: '#FF0000',
    secondaryColor: '#FFD700',
    backgroundColor: '#000000',
    position: 'center' as const,
    highlightWords: ['⚠️', 'ATENÇÃO', 'IMPORTANTE', 'URGENTE']
  }
};

/**
 * Gera arquivo de legendas .ass (Advanced Substation Alpha)
 * Formato profissional usado por editores de vídeo
 */
function generateASSFile(
  segments: SubtitleSegment[],
  style: CaptionStyle,
  width: number = 1080,
  height: number = 1920
): string {
  const lines: string[] = [];

  // Header ASS
  lines.push(
    '[Script Info]',
    'Title: AI Generated Captions',
    'ScriptType: v4.00+',
    'PlayResX: ' + width,
    'PlayResY: ' + height,
    '',
    '[V4+ Styles]',
    `Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding`,
    `Style: Default,${style.font},${style.fontSize},${colorToASS(style.primaryColor)},${colorToASS(style.secondaryColor)},${colorToASS('#000000')},${colorToASS(style.backgroundColor)},1,0,0,0,100,100,0,0,${style.backgroundColor === 'transparent' ? 0 : 2},2,${alignmentToASS(style.position)},10,10,50,1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
  );

  // Adicionar segmentos
  segments.forEach((seg, index) => {
    const startTime = formatTime(seg.start);
    const endTime = formatTime(seg.end);
    const text = formatTextWithHighlights(seg.text, style.highlightWords, style.secondaryColor);
    
    lines.push(`Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`);
  });

  return lines.join('\n');
}

/**
 * Converte cor hex para formato ASS (AABBGGRR)
 */
function colorToASS(hex: string): string {
  if (hex === 'transparent') return '&H00000000';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `&H00${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`;
}

/**
 * Converte posição para alinhamento ASS
 */
function alignmentToASS(pos: string): number {
  switch (pos) {
    case 'top': return 8;
    case 'center': return 5;
    case 'bottom': return 2;
    default: return 2;
  }
}

/**
 * Formata tempo para ASS (H:MM:SS.CC)
 */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

/**
 * Formata texto com palavras destacadas
 */
function formatTextWithHighlights(text: string, highlightWords: string[], highlightColor: string): string {
  // Palavras de alta atenção
  const urgentWords = ['ATENÇÃO', 'IMPORTANTE', '⚠️', 'CUIDADO', 'URGENTE'];
  
  let formatted = text;
  
  // Destaca palavras em maiúsculas (grito)
  formatted = formatted.replace(/\b([A-ZÀ-Ú]{3,})\b/g, `{\\c${colorToASS(highlightColor)}{\\b1}$1}`);
  
  // Destaca palavras de urgência
  urgentWords.forEach(word => {
    formatted = formatted.replace(new RegExp(word, 'gi'), `{\\c${colorToASS('#FF0000')}{\\b1}{\\fs+5}${word}`);
  });
  
  // Quebra linhas longas
  if (formatted.length > 40) {
    const words = formatted.split(' ');
    let line = '';
    const newLines: string[] = [];
    
    words.forEach(word => {
      if ((line + ' ' + word).length > 40) {
        newLines.push(line);
        line = word;
      } else {
        line += ' ' + word;
      }
    });
    newLines.push(line);
    formatted = newLines.join('\\N');
  }
  
  return formatted;
}

/**
 * Gera legendas simples em formato SRT
 */
function generateSRTFile(segments: SubtitleSegment[]): string {
  return segments.map((seg, i) => {
    const startTime = formatSRTTime(seg.start);
    const endTime = formatSRTTime(seg.end);
    return `${i + 1}\n${startTime} --> ${endTime}\n${seg.text}\n`;
  }).join('\n');
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

/**
 * Converte roteiro em segmentos de legendas (via timing)
 */
export function textoParaLegendas(texto: string, duracaoTotal: number): SubtitleSegment[] {
  // Divide texto em frases (aproximadamente 2-3 segundos cada)
  const frases = texto
    .split(/[.!?]+/)
    .map(f => f.trim())
    .filter(f => f.length > 0);
  
  const tempoPorFrase = duracaoTotal / frases.length;
  const segments: SubtitleSegment[] = [];
  
  frases.forEach((frase, i) => {
    segments.push({
      start: i * tempoPorFrase,
      end: (i + 1) * tempoPorFrase,
      text: frase,
      highlightWords: frase.split(' ').filter(w => w.length > 6).slice(0, 3)
    });
  });
  
  return segments;
}

/**
 * Classe principal de edição de vídeo
 */
export class VideoEditorAI {
  private ffmpegPath: string;
  private outputDir: string;

  constructor(outputDir: string = './output') {
    this.ffmpegPath = 'ffmpeg';
    this.outputDir = outputDir;
  }

  /**
   * Adiciona legendas profissionais ao vídeo
   */
  async addProfessionalCaptions(
    inputVideo: string,
    outputVideo: string,
    roteiro: string,
    estilo: keyof typeof CAPTION_STYLES = 'drbrazil'
  ): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    
    const style = CAPTION_STYLES[estilo];
    const duracao = 30; // Assume vídeo de 30 segundos
    
    // Gera segmentos de legendas
    const segments = textoParaLegendas(roteiro, duracao);
    
    // Gera arquivo ASS
    const assContent = generateASSFile(segments, style);
    const assPath = `${this.outputDir}/legendas_${Date.now()}.ass`;
    
    // Escreve arquivo de legendas
    const fs = require('fs');
    fs.writeFileSync(assPath, assContent);
    
    // Aplica legendas via FFmpeg
    const command = `${this.ffmpegPath} -y -i "${inputVideo}" -vf "ass='${assPath}'" -c:a copy "${outputVideo}"`;
    
    try {
      await execAsync(command);
      return { success: true, outputPath: outputVideo };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cria vídeo com legendas automática (sem needing FFmpeg)
   */
  async createCaptionedVideo(
    inputImageOrVideo: string,
    outputPath: string,
    roteiro: string,
    duration: number = 30
  ): Promise<{ success: boolean; outputPath?: string; error?: string }> {
    
    // Converte imagem em vídeo se necessário
    const isImage = inputImageOrVideo.match(/\.(jpg|jpeg|png|webp)$/i);
    
    let inputPath = inputImageOrVideo;
    
    if (isImage) {
      // Cria vídeo a partir da imagem
      const tempVideo = `${this.outputDir}/temp_${Date.now()}.mp4`;
      const imgToVideoCmd = `${this.ffmpegPath} -y -loop 1 -i "${inputImageOrVideo}" -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf "scale=1080:1920" "${tempVideo}"`;
      
      try {
        await execAsync(imgToVideoCmd);
        inputPath = tempVideo;
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    
    // Adiciona legendas
    return this.addProfessionalCaptions(inputPath, outputPath, roteiro, 'drbrazil');
  }

  /**
   * Aplica filtros visuais estilo TikTok
   */
  async applyTikTokFilters(
    inputVideo: string,
    outputVideo: string,
    filterType: 'warm' | 'cool' | 'vintage' | 'vibrant' = 'vibrant'
  ): Promise<{ success: boolean; error?: string }> {
    
    const filters = {
      warm: 'eq=brightness=0.05:saturation=1.3:contrast=1.1:gamma=1.1',
      cool: 'eq=brightness=0:saturation=0.9:contrast=1.1:gamma=0.9',
      vintage: 'eq=brightness=0.02:saturation=0.8:contrast=1.2:gamma=1.2,colorbalance=rs=0.1:gs=-0.05',
      vibrant: 'eq=brightness=0.06:saturation=1.5:contrast=1.15'
    };
    
    const command = `${this.ffmpegPath} -y -i "${inputVideo}" -vf "${filters[filterType]}" -c:a copy "${outputVideo}"`;
    
    try {
      await execAsync(command);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Pipeline completo: vídeo + legendas + filtros
   */
  async fullVideoPipeline(
    inputMedia: string,
    roteiro: string,
    outputPath: string,
    options: {
      duration?: number;
      captionStyle?: keyof typeof CAPTION_STYLES;
      filter?: 'warm' | 'cool' | 'vintage' | 'vibrant';
    } = {}
  ): Promise<{ success: boolean; finalPath?: string; error?: string }> {
    
    const { duration = 30, captionStyle = 'drbrazil', filter = 'vibrant' } = options;
    
    // Step 1: Criar vídeo com legendas
    const captionedResult = await this.createCaptionedVideo(
      inputMedia,
      outputPath.replace('.mp4', '_captions.mp4'),
      roteiro,
      duration
    );
    
    if (!captionedResult.success) {
      return { success: false, error: captionedResult.error };
    }
    
    // Step 2: Aplicar filtros
    const filteredResult = await this.applyTikTokFilters(
      captionedResult.outputPath!,
      outputPath,
      filter
    );
    
    if (!filteredResult.success) {
      return { success: false, error: filteredResult.error };
    }
    
    return { success: true, finalPath: outputPath };
  }
}

export const videoEditor = new VideoEditorAI();

/**
 * Exemplo de uso:
 * 
 * const editor = new VideoEditorAI();
 * 
 * await editor.fullVideoPipeline(
 *   'avatar.jpg',
 *   'Oi! Sou a Dra. Olivia. Hoje vou te contar sobre vitamina D...',
 *   'output_video.mp4',
 *   { 
 *     duration: 30,
 *     captionStyle: 'drbrazil',
 *     filter: 'vibrant'
 *   }
 * );
 */
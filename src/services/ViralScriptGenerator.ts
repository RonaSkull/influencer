/**
 * Viral Script Generator - Growth Engine Core
 * 
 * Gera roteiros otimizados para viralização usando:
 * - Hook patterns que funcionam (baseado em dados reais)
 * - Estruturas validadas de retenção
 * - CTAs com alta conversão
 * - A/B testing integrado
 * 
 * Nichos suportados: TODOS (universal)
 * - ecommerce, cosméticos, suplementos, infoprodutos
 * - fintech, imobiliário, moda, saúde, B2B, SaaS
 * - local business, afiliados, etc.
 */

import { groq } from './providers/GroqProvider';

export interface ScriptConfig {
  niche: string;
  productType: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
  objective: 'awareness' | 'engagement' | 'conversion' | 'retention';
  targetAudience: {
    painPoints: string[];
    desires: string[];
    objections: string[];
  };
  brandVoice?: 'professional' | 'casual' | 'energetic' | 'educational' | 'entertaining';
  duration: '15s' | '30s' | '60s' | '90s';
}

export interface GeneratedScript {
  id: string;
  hook: {
    text: string;
    type: HookType;
    predictedRetention: number; // 0-100
    alternatives: string[];
  };
  body: {
    problem: string;
    agitation: string;
    solution: string;
    proof: string;
  };
  cta: {
    primary: string;
    secondary?: string;
    urgency?: string;
    type: CtaType;
  };
  metadata: {
    estimatedDuration: number; // seconds
    wordCount: number;
    readingLevel: string;
    emotionalTone: string[];
    viralScore: number; // 0-100
    conversionScore: number; // 0-100
  };
  hashtags: string[];
  captions: {
    onScreen: Array<{ time: number; text: string }>;
    description: string;
  };
  abTests: {
    hookVariants: Array<{ variant: string; hypothesis: string }>;
    ctaVariants: Array<{ variant: string; hypothesis: string }>;
  };
}

export type HookType = 
  | 'question'           // "Você sabia que...?"
  | 'controversial'      // "Pare de fazer isso agora!"
  | 'secret'             // "O segredo que ninguém te conta..."
  | 'transformation'     // "De X para Y em Z dias"
  | 'listicle'           // "5 maneiras de..."
  | 'mistake'            // "O erro que 90% cometem"
  | 'before-after'       // "Antes vs Depois"
  | 'shocking-stat'      // "87% das pessoas não sabem..."
  | 'story'              // "Há 3 anos atrás eu..."
  | 'challenge';         // "Duvido você fazer isso"

export type CtaType =
  | 'follow'
  | 'comment'
  | 'share'
  | 'click-link'
  | 'dm-me'
  | 'buy-now'
  | 'sign-up'
  | 'save-post';

export class ViralScriptGenerator {
  // Hook patterns baseados em análise de vídeos virais
  private hookPatterns: Record<HookType, string[]> = {
    question: [
      'Você já se perguntou por que {pain_point}?',
      'O que ninguém te conta sobre {topic}?',
      'Por que {target_audience} continua falhando em {goal}?',
      'Será que você está cometendo esse erro em {topic}?'
    ],
    controversial: [
      'Pare de {common_practice} agora mesmo!',
      'Tudo que te contaram sobre {topic} é mentira',
      'Por que {popular_belief} está te prejudicando',
      'Eu odeio dizer isso, mas...'
    ],
    secret: [
      'O segredo que {industry} não quer que você saiba',
      'Revelei meu método de {result} em {timeframe}',
      'O que {successful_people} fazem diferente',
      'Descobri um hack proibido para {goal}'
    ],
    transformation: [
      'Como fui de {bad_state} para {good_state} em {timeframe}',
      '{number} passos para transformar {area_da_vida}',
      'A estratégia exata que usei para {achievement}',
      'De {zero} para {hero}: minha jornada'
    ],
    listicle: [
      '{number} {things} que vão mudar sua vida',
      'Top {number} {tools/tips} para {goal}',
      '{number} sinais de que você precisa {action}',
      '{number} erros fatais em {topic}'
    ],
    mistake: [
      'O erro número 1 que {target_audience} comete',
      'Pare de fazer isso se quer {goal}',
      'Isso está destruindo seus {results}',
      'Por que seu {effort} não está funcionando'
    ],
    'before-after': [
      'Antes: {before_state}. Depois: {after_state}',
      'Olha a diferença que {product/method} fez',
      'Eu achava que era {belief}, até ver isso',
      'Compare: método tradicional vs meu método'
    ],
    'shocking-stat': [
      '{percentage}% das pessoas falham nisso. Você?',
      'Estudo revela: {shocking_finding}',
      'A verdade chocante sobre {industry}',
      'Dados mostram que {unexpected_fact}'
    ],
    story: [
      'Há {timeframe}, eu estava {bad_situation}...',
      'Tudo mudou quando descobri {insight}',
      'Ninguém esperava que eu {achievement}',
      'A lição mais dura que aprendi sobre {topic}'
    ],
    challenge: [
      'Duvido você fazer isso por {timeframe}',
      'Aceita o desafio de {action}?',
      'Só {percentage}% conseguem passar disso',
      'Te desafio a tentar {method} por {days} dias'
    ]
  };

  /**
   * Generate complete viral script
   */
  async generateScript(config: ScriptConfig): Promise<GeneratedScript> {
    console.log(`📝 Generating viral script for ${config.niche} - ${config.productType}`);
    
    // Generate hook with AI
    const hookResult = await this.generateHook(config);
    
    // Generate body structure (PAS framework)
    const bodyResult = await this.generateBody(config);
    
    // Generate high-converting CTA
    const ctaResult = await this.generateCTA(config);
    
    // Generate metadata and scores
    const metadata = await this.calculateMetadata(config, hookResult, bodyResult, ctaResult);
    
    // Generate hashtags
    const hashtags = await this.generateHashtags(config);
    
    // Generate captions
    const captions = await this.generateCaptions(config, hookResult, bodyResult, ctaResult);
    
    // Generate A/B test variants
    const abTests = await this.generateABTests(config, hookResult, ctaResult);
    
    const script: GeneratedScript = {
      id: this.generateId(),
      hook: hookResult,
      body: bodyResult,
      cta: ctaResult,
      metadata,
      hashtags,
      captions,
      abTests
    };
    
    console.log(`✨ Script generated: ${metadata.viralScore}/100 viral score, ${metadata.conversionScore}/100 conversion score`);
    
    return script;
  }
  
  /**
   * Generate hook using Groq + pattern library
   */
  private async generateHook(config: ScriptConfig): Promise<GeneratedScript['hook']> {
    const painPoint = config.targetAudience.painPoints[0] || 'seu problema';
    const topic = config.productType;
    
    // Select best hook types for this niche/objective
    const hookTypes = this.selectHookTypes(config);
    
    // Generate hooks using patterns
    const patternHooks = hookTypes.flatMap(type => 
      this.hookPatterns[type].map(pattern => 
        this.fillPattern(pattern, { pain_point: painPoint, topic, target_audience: 'você', goal: 'ter sucesso' })
      )
    );
    
    // Use Groq to generate custom hooks and rate them
    const aiPrompt = `Generate 5 viral video hooks for:
    
Niche: ${config.niche}
Product: ${config.productType}
Platform: ${config.platform}
Objective: ${config.objective}
Target Pain Point: ${painPoint}

For each hook, provide:
1. The hook text (max 15 words, must grab attention in 3 seconds)
2. Hook type (question/controversial/secret/transformation/listicle/mistake/before-after/shocking-stat/story/challenge)
3. Predicted retention score (0-100)

Return as JSON array: [{"text": "...", "type": "...", "retention": 85}]`;

    try {
      const result = await groq.generateText({
        prompt: aiPrompt,
        system: 'You are a viral content expert. Create hooks that stop the scroll in 3 seconds.',
        temperature: 0.9,
        maxTokens: 800,
        jsonMode: true
      });
      
      const aiHooks = JSON.parse(result.content);
      
      // Combine pattern hooks and AI hooks
      const allHooks = [
        ...patternHooks.map(text => ({ text, type: this.detectHookType(text), retention: 70 })),
        ...aiHooks
      ];
      
      // Sort by retention and pick best
      allHooks.sort((a, b) => b.retention - a.retention);
      
      const bestHook = allHooks[0];
      const alternatives = allHooks.slice(1, 4).map(h => h.text);
      
      return {
        text: bestHook.text,
        type: bestHook.type as HookType,
        predictedRetention: bestHook.retention,
        alternatives
      };
      
    } catch (error) {
      console.error('Hook generation failed, using fallback');
      return this.generateFallbackHook(config);
    }
  }
  
  /**
   * Generate body using PAS (Problem-Agitation-Solution) framework
   */
  private async generateBody(config: ScriptConfig): Promise<GeneratedScript['body']> {
    const painPoint = config.targetAudience.painPoints[0];
    const desire = config.targetAudience.desires[0];
    
    const prompt = `Create video script body using PAS framework:

Problem: ${painPoint}
Desired Outcome: ${desire}
Product/Solution: ${config.productType}
Niche: ${config.niche}

Structure:
1. PROBLEM (relate to viewer's pain, 1-2 sentences)
2. AGITATION (make it hurt, explain consequences, 2-3 sentences)
3. SOLUTION (introduce product as answer, 2-3 sentences)
4. PROOF (social proof, data, or demonstration, 1-2 sentences)

Return as JSON: {"problem": "...", "agitation": "...", "solution": "...", "proof": "..."}`;

    try {
      const result = await groq.generateText({
        prompt,
        system: 'You are a direct response copywriter. Make every word count.',
        temperature: 0.7,
        maxTokens: 600,
        jsonMode: true
      });
      
      return JSON.parse(result.content);
      
    } catch (error) {
      // Fallback PAS structure
      return {
        problem: `Se você sofre com ${painPoint}, você não está sozinho.`,
        agitation: `Isso te impede de alcançar ${desire}, e pior: cada dia que passa sem resolver isso, mais difícil fica.`,
        solution: `É exatamente aqui que ${config.productType} entra. Uma solução criada especificamente para quem busca ${desire}.`,
        proof: `Mais de 10.000 pessoas já transformaram seus resultados usando este método.`
      };
    }
  }
  
  /**
   * Generate high-converting CTA
   */
  private async generateCTA(config: ScriptConfig): Promise<GeneratedScript['cta']> {
    const ctaTypes: Record<typeof config.objective, CtaType> = {
      awareness: 'follow',
      engagement: 'comment',
      conversion: 'click-link',
      retention: 'save-post'
    };
    
    const primaryCtaMap: Record<CtaType, string[]> = {
      follow: ['Segue pra mais dicas como essa', 'Me segue que eu te ajudo', 'Não perde o próximo vídeo'],
      comment: ['Comenta "EU QUERO" que te envio', 'Qual sua maior dúvida? Comenta aqui', 'Marca alguém que precisa ver isso'],
      share: ['Compartilha com quem precisa', 'Manda pro seu amigo que sofre com isso', 'Salva e compartilha'],
      'click-link': ['Link na bio', 'Clica no link da bio agora', 'Corre no link antes que saia do ar'],
      'dm-me': ['Me chama no direct', 'DM aberta pra dúvidas', 'Me manda um "OI" no direct'],
      'buy-now': ['Compra agora enquanto tem promoção', 'Últimas unidades, clica abaixo', 'Oferta por tempo limitado'],
      'sign-up': ['Cadastro gratuito no link', 'Garanta sua vaga grátis', 'Inscreva-se agora'],
      'save-post': ['Salva pra não perder', 'Salva esse vídeo', 'Volta aqui sempre que precisar']
    };
    
    const ctaType = ctaTypes[config.objective];
    const options = primaryCtaMap[ctaType];
    
    // Add urgency for conversion objectives
    const urgencyPhrases = config.objective === 'conversion' ? [
      'Só hoje com desconto',
      'Vagas limitadas',
      'Promoção acaba à meia-noite',
      'Última chance'
    ] : [];
    
    return {
      primary: options[Math.floor(Math.random() * options.length)],
      secondary: config.objective === 'conversion' ? 'Não deixa pra depois' : undefined,
      urgency: urgencyPhrases.length > 0 ? urgencyPhrases[Math.floor(Math.random() * urgencyPhrases.length)] : undefined,
      type: ctaType
    };
  }
  
  /**
   * Calculate metadata and scores
   */
  private async calculateMetadata(
    config: ScriptConfig,
    hook: GeneratedScript['hook'],
    body: GeneratedScript['body'],
    cta: GeneratedScript['cta']
  ): Promise<GeneratedScript['metadata']> {
    const fullScript = `${hook.text} ${body.problem} ${body.agitation} ${body.solution} ${body.proof} ${cta.primary}`;
    const wordCount = fullScript.split(' ').length;
    
    // Estimate duration (average speaking rate: 2.5 words/second)
    const estimatedDuration = Math.round(wordCount / 2.5);
    
    // Calculate viral score based on hook type, length, and patterns
    const viralScore = this.calculateViralScore(config, hook, estimatedDuration);
    
    // Calculate conversion score based on CTA strength and clarity
    const conversionScore = this.calculateConversionScore(config, cta, body);
    
    // Determine reading level
    const readingLevel = wordCount < 50 ? 'Elementary' : wordCount < 100 ? 'Intermediate' : 'Advanced';
    
    // Detect emotional tone
    const emotionalTone = this.detectEmotionalTone(fullScript);
    
    return {
      estimatedDuration,
      wordCount,
      readingLevel,
      emotionalTone,
      viralScore,
      conversionScore
    };
  }
  
  /**
   * Calculate viral score (0-100)
   */
  private calculateViralScore(
    config: ScriptConfig,
    hook: GeneratedScript['hook'],
    duration: number
  ): number {
    let score = 50; // Base score
    
    // Hook type bonus
    const highPerformingHooks: HookType[] = ['controversial', 'secret', 'mistake', 'shocking-stat'];
    if (highPerformingHooks.includes(hook.type)) {
      score += 15;
    }
    
    // Retention prediction
    score += hook.predictedRetention * 0.2;
    
    // Duration optimization (15-45s is sweet spot for most platforms)
    if (duration >= 15 && duration <= 45) {
      score += 10;
    } else if (duration < 15 || duration > 60) {
      score -= 10;
    }
    
    // Platform-specific bonuses
    if (config.platform === 'tiktok' && hook.type === 'challenge') {
      score += 10;
    }
    if (config.platform === 'linkedin' && hook.type === 'story') {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }
  
  /**
   * Calculate conversion score (0-100)
   */
  private calculateConversionScore(
    config: ScriptConfig,
    cta: GeneratedScript['cta'],
    body: GeneratedScript['body']
  ): number {
    let score = 50;
    
    // CTA clarity
    if (cta.primary.length < 30) {
      score += 15; // Short, clear CTAs convert better
    }
    
    // Urgency presence
    if (cta.urgency) {
      score += 10;
    }
    
    // Solution clarity in body
    if (body.solution.toLowerCase().includes(config.productType.toLowerCase())) {
      score += 10;
    }
    
    // Proof presence
    if (body.proof.length > 20) {
      score += 10;
    }
    
    // Objective alignment
    const strongConversionObjectives = ['conversion', 'retention'];
    if (strongConversionObjectives.includes(config.objective)) {
      score += 5;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }
  
  /**
   * Detect emotional tone
   */
  private detectEmotionalTone(text: string): string[] {
    const tones: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('incrível') || lowerText.includes('amazing') || lowerText.includes('fantástico')) {
      tones.push('excitement');
    }
    if (lowerText.includes('problema') || lowerText.includes('erro') || lowerText.includes('difícil')) {
      tones.push('concern');
    }
    if (lowerText.includes('segredo') || lowerText.includes('descobri') || lowerText.includes('hack')) {
      tones.push('curiosity');
    }
    if (lowerText.includes('transform') || lowerText.includes('mudou') || lowerText.includes('resultado')) {
      tones.push('hope');
    }
    if (lowerText.includes('agora') || lowerText.includes('hoje') || lowerText.includes('última')) {
      tones.push('urgency');
    }
    
    return tones.length > 0 ? tones : ['neutral'];
  }
  
  /**
   * Generate relevant hashtags
   */
  private async generateHashtags(config: ScriptConfig): Promise<string[]> {
    const nicheTags = {
      fitness: ['#fitness', '#workout', '#health', '#gym', '#fitfam'],
      beauty: ['#beauty', '#makeup', '#skincare', '#glowup', '#beautytips'],
      tech: ['#tech', '#technology', '#gadgets', '#innovation', '#techtips'],
      finance: ['#finance', '#investing', '#money', '#wealth', '#financialfreedom'],
      lifestyle: ['#lifestyle', '#wellness', '#selfcare', '#motivation', '#dailyinspo']
    };
    
    const baseTags = nicheTags[config.niche.toLowerCase() as keyof typeof nicheTags] || ['#viral', '#trending'];
    
    // Add platform-specific tags
    const platformTags = {
      instagram: ['#reels', '#explorepage', '#fyp'],
      tiktok: ['#fyp', '#foryou', '#viral', '#trending'],
      youtube: ['#shorts', '#youtube', '#viral'],
      linkedin: ['#linkedin', '#professional', '#career']
    };
    
    const combined = [...baseTags, ...platformTags[config.platform]];
    
    // Add niche-specific long-tail tags
    const longTail = [
      `#${config.niche.replace(/\s/g, '')}tips`,
      `#${config.productType.replace(/\s/g, '')}`,
      `#${config.objective}content`
    ];
    
    return [...combined, ...longTail].slice(0, 10);
  }
  
  /**
   * Generate on-screen captions
   */
  private async generateCaptions(
    config: ScriptConfig,
    hook: GeneratedScript['hook'],
    body: GeneratedScript['body'],
    cta: GeneratedScript['cta']
  ): Promise<GeneratedScript['captions']> {
    const fullText = `${hook.text} ${body.problem} ${body.agitation} ${body.solution} ${body.proof} ${cta.primary}`;
    const words = fullText.split(' ');
    
    // Split into caption chunks (max 8 words per caption)
    const chunks: Array<{ time: number; text: string }> = [];
    const wordsPerChunk = 6;
    const secondsPerWord = 0.4; // Average speaking pace
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      chunks.push({
        time: Math.round(i * secondsPerWord),
        text: chunk
      });
    }
    
    // Generate description
    const description = `${hook.text} ${body.solution.substring(0, 100)}... ${cta.primary}`;
    
    return {
      onScreen: chunks,
      description
    };
  }
  
  /**
   * Generate A/B test variants
   */
  private async generateABTests(
    config: ScriptConfig,
    hook: GeneratedScript['hook'],
    cta: GeneratedScript['cta']
  ): Promise<GeneratedScript['abTests']> {
    return {
      hookVariants: hook.alternatives.map((variant, i) => ({
        variant,
        hypothesis: `Hook variant ${i + 1} will increase retention by focusing on different angle`
      })),
      ctaVariants: [
        {
          variant: cta.primary,
          hypothesis: 'Original CTA - baseline'
        },
        {
          variant: cta.type === 'click-link' ? 'Comenta "LINK" que te envio' : 'Link na bio',
          hypothesis: 'Alternative CTA may reduce friction'
        }
      ]
    };
  }
  
  /**
   * Select best hook types for niche/objective
   */
  private selectHookTypes(config: ScriptConfig): HookType[] {
    const mappings: Record<string, HookType[]> = {
      fitness: ['transformation', 'mistake', 'challenge', 'before-after'],
      beauty: ['before-after', 'secret', 'listicle', 'transformation'],
      tech: ['shocking-stat', 'secret', 'mistake', 'listicle'],
      finance: ['mistake', 'shocking-stat', 'secret', 'transformation'],
      lifestyle: ['story', 'transformation', 'question', 'listicle']
    };
    
    return mappings[config.niche.toLowerCase()] || ['question', 'listicle', 'transformation'];
  }
  
  /**
   * Fill pattern template
   */
  private fillPattern(pattern: string, replacements: Record<string, string>): string {
    return pattern.replace(/\{(\w+)\}/g, (_, key) => replacements[key] || key);
  }
  
  /**
   * Detect hook type from text
   */
  private detectHookType(text: string): HookType {
    const lower = text.toLowerCase();
    if (lower.startsWith('você') || lower.endsWith('?')) return 'question';
    if (lower.includes('pare') || lower.includes('mentira')) return 'controversial';
    if (lower.includes('segredo') || lower.includes('ninguém te conta')) return 'secret';
    if (lower.includes('de ') && lower.includes(' para ')) return 'transformation';
    if (lower.match(/^\d+ /)) return 'listicle';
    if (lower.includes('erro') || lower.includes('errado')) return 'mistake';
    if (lower.includes('antes') && lower.includes('depois')) return 'before-after';
    if (lower.match(/\d+%/) || lower.includes('estudo')) return 'shocking-stat';
    if (lower.includes('há ') && lower.includes('atrás')) return 'story';
    if (lower.includes('duvido') || lower.includes('desafio')) return 'challenge';
    return 'question';
  }
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate fallback hook when AI fails
   */
  private generateFallbackHook(config: ScriptConfig): GeneratedScript['hook'] {
    const painPoint = config.targetAudience.painPoints[0] || 'seu problema';
    const patterns = this.hookPatterns.question;
    const text = patterns[0].replace('{pain_point}', painPoint);
    
    return {
      text,
      type: 'question',
      predictedRetention: 65,
      alternatives: patterns.slice(1, 4)
    };
  }
}

// Export singleton
export const viralScriptGenerator = new ViralScriptGenerator();
export default viralScriptGenerator;

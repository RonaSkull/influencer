/**
 * Persona Engine - AI Influencer Creator
 * 
 * Cria personas completas de influenciadores virtuais
 * baseado em nicho, público-alvo e objetivos
 * 
 * Features:
 * - Geração de nome, idade, backstory
 * - Definição de tom de voz e personalidade
 * - Configuração visual (etnia, estilo, características)
 * - Especialização por nicho
 * - Adaptação cultural (Brasil, EUA, etc.)
 */

import { groq } from './providers/GroqProvider';

export interface PersonaConfig {
  niche: string;
  targetAudience: {
    ageRange: string;
    gender: string;
    interests: string[];
    location?: string;
  };
  platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
  tone: 'professional' | 'casual' | 'energetic' | 'educational' | 'entertaining';
  language: 'pt-BR' | 'en-US' | 'es-ES';
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  ethnicity: string;
  gender: string;
  backstory: string;
  personality: {
    traits: string[];
    values: string[];
    quirks: string[];
  };
  visual: {
    style: string;
    hairColor: string;
    eyeColor: string;
    bodyType: string;
    fashionStyle: string;
    signature: string; // elemento visual marcante
  };
  voice: {
    tone: string;
    pace: 'slow' | 'medium' | 'fast';
    pitch: 'low' | 'medium' | 'high';
    accent?: string;
  };
  content: {
    topics: string[];
    catchphrases: string[];
    contentPillars: string[];
    postingFrequency: string;
  };
  engagement: {
    responseStyle: string;
    emojiUsage: 'minimal' | 'moderate' | 'heavy';
    hashtagStrategy: string;
  };
  monetization: {
    productTypes: string[];
    priceRange: string;
    affiliateCategories: string[];
  };
}

export class PersonaEngine {
  private templates: Record<string, Partial<Persona>> = {
    fitness: {
      personality: {
        traits: ['motivador', 'disciplinado', 'energético', 'inspirador'],
        values: ['saúde', 'superação', 'consistência', 'bem-estar'],
        quirks: ['frases de efeito motivacionais', 'usa timer nos treinos']
      },
      visual: {
        style: 'atlético',
        fashionStyle: 'activewear, roupas de academia',
        signature: 'sempre com garrafa de água e toalha'
      },
      voice: {
        tone: 'energético e motivador',
        pace: 'fast',
        pitch: 'medium'
      },
      content: {
        topics: ['treinos', 'nutrição', 'suplementação', 'lifestyle saudável'],
        contentPillars: ['workout tutorials', 'meal prep', 'transformation stories', 'motivation'],
        postingFrequency: 'daily'
      },
      monetization: {
        productTypes: ['suplementos', 'roupas fitness', 'planos de treino', 'apps de saúde'],
        priceRange: '$20-$200',
        affiliateCategories: ['fitness', 'nutrition', 'wellness']
      }
    },
    beauty: {
      personality: {
        traits: ['criativo', 'atento a detalhes', 'trendy', 'acessível'],
        values: ['autoexpressão', 'inclusividade', 'autocuidado', 'confiança'],
        quirks: ['colecionador de pincéis', 'sempre testando lançamentos']
      },
      visual: {
        style: 'glamouroso mas acessível',
        fashionStyle: 'trendy, cores vibrantes',
        signature: 'maquiagem impecável, unhas sempre feitas'
      },
      voice: {
        tone: 'amigável e entusiasta',
        pace: 'medium',
        pitch: 'medium-high'
      },
      content: {
        topics: ['makeup tutorials', 'skincare routines', 'product reviews', 'trends'],
        contentPillars: ['tutorials', 'reviews', 'get ready with me', 'before/after'],
        postingFrequency: '4-5x per week'
      },
      monetization: {
        productTypes: ['cosméticos', 'skincare', 'ferramentas de beleza', 'cursos'],
        priceRange: '$10-$150',
        affiliateCategories: ['beauty', 'skincare', 'personal care']
      }
    },
    tech: {
      personality: {
        traits: ['analítico', 'curioso', 'didático', 'visionário'],
        values: ['inovação', 'eficiência', 'conhecimento', 'futuro'],
        quirks: ['sempre com gadget novo', 'obcecado por produtividade']
      },
      visual: {
        style: 'clean e moderno',
        fashionStyle: 'smart casual, minimalista',
        signature: 'setup impecável com múltiplos monitores'
      },
      voice: {
        tone: 'profissional mas acessível',
        pace: 'medium',
        pitch: 'medium'
      },
      content: {
        topics: ['reviews de gadgets', 'dicas de produtividade', 'tendências tech', 'tutoriais'],
        contentPillars: ['product reviews', 'tech news', 'how-to guides', 'setup tours'],
        postingFrequency: '3-4x per week'
      },
      monetization: {
        productTypes: ['gadgets', 'software', 'cursos online', 'consultoria'],
        priceRange: '$50-$2000',
        affiliateCategories: ['technology', 'software', 'education']
      }
    },
    finance: {
      personality: {
        traits: ['confiável', 'estratégico', 'paciente', 'educador'],
        values: ['liberdade financeira', 'segurança', 'inteligência', 'planejamento'],
        quirks: ['planilhas para tudo', 'obsessão por otimizar gastos']
      },
      visual: {
        style: 'profissional e sofisticado',
        fashionStyle: 'business casual, relógio clássico',
        signature: 'sempre com café e falando de investimentos'
      },
      voice: {
        tone: 'confiante e educador',
        pace: 'slow-medium',
        pitch: 'low-medium'
      },
      content: {
        topics: ['investimentos', 'economia doméstica', 'empreendedorismo', 'aposentadoria'],
        contentPillars: ['investment tips', 'budget hacks', 'market analysis', 'success stories'],
        postingFrequency: 'daily'
      },
      monetization: {
        productTypes: ['cursos de investimento', 'consultoria', 'planilhas', 'books'],
        priceRange: '$30-$500',
        affiliateCategories: ['finance', 'education', 'business']
      }
    },
    lifestyle: {
      personality: {
        traits: ['autêntico', 'relatável', 'otimista', 'criativo'],
        values: ['equilíbrio', 'experiências', 'conexões', 'gratidão'],
        quirks: ['diário de gratidão', 'sempre planejando viagens']
      },
      visual: {
        style: 'cozy e aesthetic',
        fashionStyle: 'comfortable chic, tons neutros',
        signature: 'cenários instagramáveis, luz natural'
      },
      voice: {
        tone: 'quente e convidativo',
        pace: 'medium',
        pitch: 'medium'
      },
      content: {
        topics: ['rotina matinal', 'home decor', 'self-care', 'travel'],
        contentPillars: ['day in the life', 'home tours', 'self-care Sunday', 'travel diaries'],
        postingFrequency: '4-5x per week'
      },
      monetization: {
        productTypes: ['home decor', 'self-care products', 'planners', 'travel gear'],
        priceRange: '$20-$300',
        affiliateCategories: ['lifestyle', 'home', 'wellness', 'travel']
      }
    }
  };

  /**
   * Generate complete persona based on config
   */
  async generatePersona(config: PersonaConfig): Promise<Persona> {
    const baseTemplate = this.templates[config.niche.toLowerCase()] || this.templates.lifestyle;
    
    // Use Groq to generate unique persona details
    const generationPrompt = this.buildGenerationPrompt(config, baseTemplate);
    
    const result = await groq.generateText({
      prompt: generationPrompt,
      system: 'You are an expert influencer strategist. Create compelling, authentic personas that resonate with target audiences.',
      temperature: 0.8,
      maxTokens: 1500,
      jsonMode: true
    });
    
    try {
      const generatedData = JSON.parse(result.content);
      
      const persona: Persona = {
        id: this.generateId(),
        name: generatedData.name || this.generateName(config),
        age: generatedData.age || this.generateAge(config.targetAudience),
        ethnicity: generatedData.ethnicity || this.generateEthnicity(config.targetAudience),
        gender: generatedData.gender || config.targetAudience.gender,
        backstory: generatedData.backstory || this.generateBackstory(config, baseTemplate),
        personality: {
          ...baseTemplate.personality,
          ...generatedData.personality
        } as Persona['personality'],
        visual: {
          ...baseTemplate.visual,
          ...generatedData.visual
        } as Persona['visual'],
        voice: {
          ...baseTemplate.voice,
          ...generatedData.voice
        } as Persona['voice'],
        content: {
          ...baseTemplate.content,
          ...generatedData.content
        } as Persona['content'],
        engagement: generatedData.engagement || this.generateEngagementStyle(config.tone),
        monetization: {
          ...baseTemplate.monetization,
          ...generatedData.monetization
        } as Persona['monetization']
      };
      
      console.log(`✨ Generated persona: ${persona.name} (${config.niche})`);
      
      return persona;
      
    } catch (error) {
      console.error('Failed to parse persona JSON, using fallback generation');
      return this.generateFallbackPersona(config, baseTemplate);
    }
  }
  
  /**
   * Build prompt for persona generation
   */
  private buildGenerationPrompt(config: PersonaConfig, template: Partial<Persona>): string {
    return `Create a unique influencer persona with the following specifications:

Niche: ${config.niche}
Target Audience: ${config.targetAudience.ageRange}, ${config.targetAudience.gender}, interests: ${config.targetAudience.interests.join(', ')}
Platform: ${config.platform}
Tone: ${config.tone}
Language: ${config.language}

Generate a JSON object with these fields:
{
  "name": "unique and memorable name",
  "age": appropriate age number,
  "ethnicity": specific ethnicity matching target audience,
  "backstory": "compelling 2-3 sentence origin story",
  "personality": {
    "traits": ["trait1", "trait2", "trait3"],
    "values": ["value1", "value2"],
    "quirks": ["unique quirk1", "unique quirk2"]
  },
  "visual": {
    "hairColor": "specific color",
    "eyeColor": "specific color",
    "bodyType": "description",
    "signature": "distinctive visual element"
  },
  "voice": {
    "tone": "detailed description",
    "pace": "slow|medium|fast",
    "pitch": "low|medium|high",
    "accent": "optional accent"
  },
  "content": {
    "catchphrases": ["phrase1", "phrase2"],
    "topics": ["topic1", "topic2", "topic3"]
  },
  "engagement": {
    "responseStyle": "how they interact with followers",
    "emojiUsage": "minimal|moderate|heavy",
    "hashtagStrategy": "approach to hashtags"
  }
}

Make the persona authentic, relatable, and optimized for ${config.platform}. Consider cultural nuances for ${config.language} audience.`;
  }
  
  /**
   * Generate fallback persona without AI
   */
  private generateFallbackPersona(config: PersonaConfig, template: Partial<Persona>): Persona {
    const name = this.generateName(config);
    
    return {
      id: this.generateId(),
      name,
      age: this.generateAge(config.targetAudience),
      ethnicity: this.generateEthnicity(config.targetAudience),
      gender: config.targetAudience.gender,
      backstory: this.generateBackstory(config, template),
      personality: template.personality! as Persona['personality'],
      visual: {
        ...template.visual!,
        hairColor: this.randomChoice(['castanho', 'loiro', 'preto', 'ruivo']),
        eyeColor: this.randomChoice(['castanhos', 'verdes', 'azuis'])
      } as Persona['visual'],
      voice: template.voice! as Persona['voice'],
      content: template.content! as Persona['content'],
      engagement: this.generateEngagementStyle(config.tone),
      monetization: template.monetization! as Persona['monetization']
    };
  }
  
  /**
   * Generate name based on niche and language
   */
  private generateName(config: PersonaConfig): string {
    const prefixes = {
      fitness: ['Fit', 'Active', 'Strong', 'Power', 'Vital'],
      beauty: ['Glow', 'Beauty', 'Chic', 'Glam', 'Radiant'],
      tech: ['Tech', 'Digital', 'Cyber', 'Smart', 'Next'],
      finance: ['Wealth', 'Smart', 'Wise', 'Prime', 'Capital'],
      lifestyle: ['Life', 'Daily', 'Cozy', 'Pure', 'Simply']
    };
    
    const suffixes = {
      ptBR: ['a', 'e', 'y', 'ie'],
      enUS: ['ie', 'y', 'a', 'elle'],
      esES: ['a', 'ia', 'ita', 'ita']
    };
    
    const nichePrefix = prefixes[config.niche.toLowerCase() as keyof typeof prefixes] || prefixes.lifestyle;
    const prefix = this.randomChoice(nichePrefix);
    const suffix = this.randomChoice(suffixes[config.language]);
    
    const names = ['Olivia', 'Sophia', 'Emma', 'Isabella', 'Mia', 'Luna', 'Aurora', 'Stella'];
    const baseName = this.randomChoice(names);
    
    return `${prefix}${suffix} ${baseName}`;
  }
  
  /**
   * Generate appropriate age
   */
  private generateAge(targetAudience: PersonaConfig['targetAudience']): number {
    const range = targetAudience.ageRange.split('-').map(Number);
    const min = range[0] || 25;
    const max = range[1] || 35;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generate ethnicity based on target audience
   */
  private generateEthnicity(targetAudience: PersonaConfig['targetAudience']): string {
    const location = targetAudience.location || 'BR';
    
    const ethnicities: Record<string, string[]> = {
      BR: ['brasileira', 'latina', 'morena', 'branca', 'negra', 'asiática-brasileira'],
      US: ['Caucasian', 'Latina', 'African American', 'Asian American', 'Mixed'],
      ES: ['española', 'latina', 'mediterránea', 'gitana']
    };
    
    const options = ethnicities[location] || ethnicities.BR;
    return this.randomChoice(options);
  }
  
  /**
   * Generate backstory
   */
  private generateBackstory(config: PersonaConfig, template: Partial<Persona>): string {
    const backstories: Record<string, string[]> = {
      fitness: [
        'Ex-atleta que superou lesão e agora ajuda outros a alcançarem seu potencial máximo',
        'Transformou sua vida através do fitness e quer inspirar milhões',
        'Personal trainer certificada com paixão por transformar corpos e mentes'
      ],
      beauty: [
        'Maquiadora profissional que democratiza técnicas de Hollywood',
        'Autodidata que transformou paixão em carreira de sucesso',
        'Defensora da beleza inclusiva e autoaceitação'
      ],
      tech: [
        'Engenheiro de software que simplifica tecnologia complexa',
        'Early adopter que testa tudo antes de você comprar',
        'Empresário tech que compartilha aprendizados reais'
      ],
      finance: [
        'Ex-banqueiro que ensina o sistema por dentro',
        'Investidor autodidata que conquistou liberdade financeira',
        'Educador financeiro focado em gerarções mais jovens'
      ],
      lifestyle: [
        'Criadora de conteúdo que valoriza o simples e autêntico',
        'Viajante compulsiva que transforma experiências em inspiração',
        'Entusiasta de bem-estar buscando equilíbrio na correria moderna'
      ]
    };
    
    const options = backstories[config.niche.toLowerCase()] || backstories.lifestyle;
    return this.randomChoice(options);
  }
  
  /**
   * Generate engagement style
   */
  private generateEngagementStyle(tone: PersonaConfig['tone']): Persona['engagement'] {
    const styles: Record<string, Persona['engagement']> = {
      professional: {
        responseStyle: 'thoughtful and informative responses',
        emojiUsage: 'minimal',
        hashtagStrategy: 'strategic, industry-specific tags'
      },
      casual: {
        responseStyle: 'friendly and conversational',
        emojiUsage: 'moderate',
        hashtagStrategy: 'mix of popular and niche tags'
      },
      energetic: {
        responseStyle: 'enthusiastic and engaging',
        emojiUsage: 'heavy',
        hashtagStrategy: 'trending and viral tags'
      },
      educational: {
        responseStyle: 'patient and detailed explanations',
        emojiUsage: 'minimal',
        hashtagStrategy: 'topic-focused and searchable'
      },
      entertaining: {
        responseStyle: 'witty and playful banter',
        emojiUsage: 'heavy',
        hashtagStrategy: 'fun and trending tags'
      }
    };
    
    return styles[tone] || styles.casual;
  }
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Random choice from array
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Get persona templates
   */
  getTemplates(): string[] {
    return Object.keys(this.templates);
  }
  
  /**
   * Customize existing template
   */
  customizeTemplate(niche: string, customizations: Partial<Persona>): Partial<Persona> {
    const base = this.templates[niche.toLowerCase()] || this.templates.lifestyle;
    return {
      ...base,
      ...customizations
    };
  }
}

// Export singleton
export const personaEngine = new PersonaEngine();
export default personaEngine;

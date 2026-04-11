import { ViralScript } from './VideoGenerator';

interface TrendTopic {
  topic: string;
  searches: number;
  category: string;
}

const TRENDING_TOPICS = {
  farmacia: [
    'vitamina D',
    'ômega 3',
    'colágeno',
    'whey protein',
    'creatina',
    'vitamina C',
    'magnésio',
    'zinco',
    'probióticos',
    'ácido hialurônico'
  ],
  saude: [
    'dormir melhor',
    'estresse',
    'fadiga',
    'imunidade',
    'queda de cabelo',
    'acne',
    'dores',
    'articulação'
  ]
};

const ROTEIROS_VIRAL: Record<string, {
  hook: string;
  body: string;
  cta: string;
}> = {
  'vitamina d': {
    hook: `💊 VITAMINA D: O segredo que os MÉDICOS não querem que você saiba!`,
    body: `95% dos brasileiros têm DEFICIÊNCIA de vitamina D e nem sabem.

Mas atenção: não é só tomar sol.

A dosagem errada pode fazer MAL à saúde.

Eu vejo isso todos os dias na farmácia: pessoas tomando dose errada, gastando dinheiro e não vendo resultado.

A correção? Simple: primeiro faça o exame. Depois, a dose correta para o SEU caso.

Mas a maioria das pessoas não sabe disso. Estão tomando sol errado, na hora errada, no tempo errado.

O ideal? 15-20 minutos de sol antes das 10h ou depois das 16h, sem protetor solar.

MAS você pode ter outros problemas que impedem a absorção.

Porisso, sempre consulte seu médico ou farmacêutico. Cada pessoa é diferente.

#VitaminaD #Farmácia #Saúde #DraOlivia #ConselhoFarmacêutico`,
    cta: `💡 Salva esse post e segue para mais dicas de saúde!`,
  }
};

function generateHookFallback(tema: string): string {
  const hooks = [
    `💊 ${tema.toUpperCase()}: O segredo que ninguém te conta!`,
    `🧪 O segredo sobre ${tema} que a indústria não quer que você saiba!`,
    `⚠️ Atenção: sobre ${tema} você PRECISA saber disso!`,
    `🔥 ${tema}: o que descobri depois de anos de farmácia`,
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

function generateBodyFallback(tema: string): string {
  return `O que você precisa saber sobre ${tema}.\n\nO que a maioria das pessoas não sabe é que isso pode afetar sua saúde de formas que você nem imagina.\n\nEu vejo isso todos os dias: pessoas sofrendo porque não têm a informação correta.\n\nA boa notícia? É mais simples do que você pensa.\n\nMas atenção: sempre consulte um profissional antes de fazer qualquer mudança.\n\nCompartilhe com quem você ama!`;
}

function generateCTAFallback(tema: string): string {
  return `🔥 Salva esse post e me segue para mais dicas de saúde!\n\n#Farmácia #${tema.replace(/ /g, '')} #Saúde`;
}

export async function getTrendingTopics(nicho: string = 'farmacia'): Promise<TrendTopic[]> {
  return TRENDING_TOPICS[nicho as keyof typeof TRENDING_TOPICS]?.map(topic => ({
    topic,
    searches: Math.floor(Math.random() * 100000) + 10000,
    category: nicho
  })) || [];
}

export async function generateRoteiro(tema: string): Promise<ViralScript> {
  const temaLower = tema.toLowerCase();
  
  // Verifica se tem roteiro pronto
  if (ROTEIROS_VIRAL[temaLower]) {
    const r = ROTEIROS_VIRAL[temaLower];
    return {
      hook: r.hook,
      body: r.body,
      cta: r.cta,
      tema
    };
  }
  
  // Fallback: gera roteiro local
  return {
    hook: generateHookFallback(tema),
    body: generateBodyFallback(tema),
    cta: generateCTAFallback(tema),
    tema
  };
}

export function validateScript(script: ViralScript): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const fullText = `${script.hook} ${script.body} ${script.cta}`.toLowerCase();

  const forbidden = [
    'receita médica',
    'posologia',
    'dose',
    'mg/kg',
    'automedicação',
    'cure',
    'tratamento definitivo',
    'substitui remédio',
    'sem contraindicação'
  ];

  forbidden.forEach(term => {
    if (fullText.includes(term)) {
      errors.push(`Termo proibido: ${term}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * MAIN - Gera roteiro para CLI
 */
export async function main() {
  const tema = process.argv[2] || 'vitamina d';
  
  console.log('='.repeat(50));
  console.log('📝 GERADOR DE ROTEIRO VIRAL - PROFISSIONAL');
  console.log('='.repeat(50));
  console.log('');
  console.log('TEMA:', tema);
  console.log('');
  
  const roteiro = await generateRoteiro(tema);
  const validation = validateScript(roteiro);
  
  console.log('━'.repeat(50));
  console.log('📣 HOOK (3 segundos)');
  console.log('━'.repeat(50));
  console.log(roteiro.hook);
  console.log('');
  
  console.log('━'.repeat(50));
  console.log('📄 BODY (30 segundos)');
  console.log('━'.repeat(50));
  console.log(roteiro.body);
  console.log('');
  
  console.log('━'.repeat(50));
  console.log('🔗 CALL TO ACTION');
  console.log('━'.repeat(50));
  console.log(roteiro.cta);
  console.log('');
  
  console.log('━'.repeat(50));
  console.log('✅ VALIDAÇÃO');
  console.log('━'.repeat(50));
  console.log('Válido:', validation.valid);
  if (validation.errors.length > 0) {
    console.log('Erros:', validation.errors);
  }
  
  console.log('');
  console.log('='.repeat(50));
  console.log('Pronto para gerar conteúdo!');
}
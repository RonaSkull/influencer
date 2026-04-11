
export interface ViralScript {
  hook: string;
  body: string;
  cta: string;
  tema: string;
}

export class VideoOrchestrator {
  private static forbiddenTerms = [
    "receita médica", "posologia", "dose", "automedicação",
    "cura", "trata", "cura definitiva", 
    "melhor que", "mais eficiente que", "substitui",
    "indicado para", "serve para", "não tem contraindicação",
    "não causa efeito", "compre sem receita"
  ];

  /**
   * Passo 3 & 4: Gera e valida se o roteiro é seguro
   */
  static validateScript(script: string): boolean {
    return !this.forbiddenTerms.some(term => script.toLowerCase().includes(term));
  }

  /**
   * Passo 5: Renderiza no Tavus (Geração de Vídeo MP4)
   */
  static async renderVideo(script: ViralScript) {
    const fullText = `${script.hook}\n\n${script.body}\n\n${script.cta}`;
    
    if (!this.validateScript(fullText)) {
      throw new Error("O roteiro contém termos proibidos para o nicho farmacêutico.");
    }

    const apiKey = import.meta.env.VITE_TAVUS_API_KEY;

    // ✅ CORREÇÃO: Verifica se API key existe
    if (!apiKey) {
      throw new Error("API Key da Tavus não configurada. Configure VITE_TAVUS_API_KEY no .env");
    }

    const replicaId = import.meta.env.VITE_REPLICA_ID || "rd3ba0f30551";

    console.log("🎬 Enviando para renderização na Tavus...");
    
    // ✅ CORREÇÃO ELITE: URL correta da API usando Proxy (bypass)
    const response = await fetch("/tavus-api/v2/videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        replica_id: replicaId,
        script: fullText,
        video_name: `Dra Olivia - ${script.tema}`,
      }),
    });

    if (!response.ok) {
        let errorData = "Erro Genérico HTTP " + response.status;
        const textResponse = await response.text();
        try {
            const errorJson = JSON.parse(textResponse);
            errorData = errorJson.message || JSON.stringify(errorJson);
        } catch {
            errorData = textResponse || response.statusText;
        }
        throw new Error(`Tavus API Error: ${errorData}`);
    }

    return await response.json(); // Retorna { video_id, status }
  }
}

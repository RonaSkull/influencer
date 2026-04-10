---
name: influencer-orchestrator
description: Pipeline completo para gerar vídeos virais de IA influencer (Dra. Olivia)
version: 1.0.0
---

# INFLUENCER ORCHESTRATOR SKILL

## Pipeline de 7 Passos
1. SCRAPING: farmasana.com.br + Google Trends BR
2. ANALISE: Score viral (0-10) com gatilhos Hormozi
3. ROTEIRO: Hook (3s) + Corpo (30s) + CTA
4. VALIDATE: Verifica se não tem termos proibidos
5. TAVUS: Dispara API com roteiro + voz Dra. Olivia
6. POST: Aplica filtro UGC via FFMPEG
7. EXPORT: Entrega MP4 otimizado

## Validação de Segurança
Proibidos: "receita médica", "posologia", "dose", "automedicação".

# INFLUENCER ORCHESTRATOR SKILL

## Metadata
- **name**: influencer-orchestrator
- **description**: Pipeline completo para gerar vídeos virais de IA influencer (Dra. Olivia)
- **version**: 1.0.0
- **trigger**: "gera vídeo viral sobre [tema]" ou "roda pipeline [tema]"

---

## PRÉ-REQUISITOS
- Tavus API key configurada
- Deepgram ou Cartesia para áudio
- FFMPEG instalado para pós-processamento
- .env com TAVUS_API_KEY

---

## PIPELINE (7 PASSOS)

### PASSO 1: SCRAPING DE TENDÊNCIAS
```python
async def get_trends(nicho: str) -> list[Trend]:
    # Google Trends BR
    trends = await google_trends(nicho, br=True)
    # Farmasana / Farmácias
    farmacia_trends = await scrape_farmasana()
    return merge(trends, farmacia_trends)
```

### PASSO 2: ANÁLISE VIRAL
```python
def analyze_viral(roteiro: str) -> int:
    """
    Score 0-10 baseado nos gatilhos Hormozi:
    - Autoridade (+2)
    - Curiosidade (+2)
    - Urgência (+2)
    - Escândalo (+2)
    - Utilidade (+2)
    """
    score = 0
    if contains(roteiro, ["estou te dizendo", "sou farmacêutico"]): score += 2
    if contains(roteiro, ["você não sabe", "secrets"]): score += 2
    if contains(roteiro, ["corra", "agora", "até"]): score += 2
    if contains(roteiro, ["indústria não quer"]): score += 2
    if contains(roteiro, ["guarda isso", "anota"]): score += 2
    return score
```

### PASSO 3: GERAÇÃO DE ROTEIRO
```python
def generate_roteiro(tema: str, trends: list[Trend]) -> Roteiro:
    return Roteiro(
        hook=f"💊 {tema} -Você não sabe que...",
        corpo=f"Sou a Dra. Olivia e te explico...\n{tema}...\n{get_best_trend(trends)}",
        cta=f"🔥 Salva esse post e me segue para mais!",
        duracao_total=30,  # segundos
    )
```

### PASSO 4: VALIDAÇÃO
```python
def validate_roteiro(roteiro: Roteiro) -> bool:
    proibidos = ["receita médica", "posologia", "dose", "automedicação"]
    for termo in proibidos:
        if contains(roteiro, termo):
            return False
    return True
```

### PASSO 5: TAVUS RENDER
```python
async def render_tavus(roteiro: Roteiro) -> str:
    """
    Dispara job na Tavus CVI
    Retorna URL do vídeo renderizado
    """
    response = await tavus.create_video(
        script=roteiro.hook + "\n" + roteiro.corpo,
        avatar_id="dra_olivia_cvi",
        voice_id="bella_pro",
    )
    return response["video_url"]
```

### PASSO 6: PÓS-PROCESSAMENTO UGC
```bash
#!/bin/bash
# ugc_filter.sh
ffmpeg -i $INPUT \
  -vf "eq=brightness=0.06:saturation=1.3:contrast=1.1" \
  -c:v libx264 -preset fast \
  -crf 23 -c:a copy $INTERMEDIATE

#shake effect (trepidação de câmera)
ffmpeg -i $INTERMEDIATE \
  -vf "shake=3:2" \
  -c:a copy $OUTPUT
```

### PASSO 7: EXPORTAR
```python
def export_video(video_path: str, plataforma: str) -> dict:
    if plataforma == "instagram":
        return optimize_for_ig(video_path, ratio="9:16", fps=30)
    elif plataforma == "tiktok":
        return optimize_for_tiktok(video_path, max_duration=60)
```

---

## GATILHOS DE VIRALIZAÇÃO (NICHO FARMÁCIA BR)

| Gatilho | Exemplo | Potência |
|---------|---------|---------|
| Autoridade | "Sou farmacêutica há 15 anos" | Alto |
| Curiosidade | "Você não sabia que esse remédio..." | Muito Alto |
| Urgência | "Elles estão recolhendo das prateleiras" | Alto |
| Escândalo | "A indústria não quer que você saibas" | Muito Alto |
| Utilidade | "Anota aí: o melhor remédio é..." | Médio |

---

## USO

```bash
# Via skill ou CLI
openclaw run influencer-orchestrator --tema "remédio para gripe"

# Ou dentro do código
from skills.influencer_orchestrator import run_pipeline
video_url = await run_pipeline(tema="remédio para gripe")
```

---

## CUSTOMIZAÇÃO

Para mudar a persona:
```python
PERSONA = {
    "nome": "Dra. Olivia",
    "avatar_id": "dra_olivia_cvi",
    "voice_id": "bella_pro",
    " Gatilhos": [
        "Sou farmacêutica e...",
        "Te aviso isso porque...",
        "Guarda isso:..."
    ]
}
```
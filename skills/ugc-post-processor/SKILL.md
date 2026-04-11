# UGC POST-PROCESSOR

## Metadata
- **name**: ugc-post-processor
- **description**: Aplica filtros e efeitos estilo UGC (celular) em vídeos renderizados
- **trigger**: "aplica filtro ugc em [vídeo]"

---

## INSTALAÇÃO
```bash
# FFMPEG necessário
brew install ffmpeg  # macOS
apt install ffmpeg     # Linux
```

---

## FILTROS DISPONÍVEIS

### 1. Brightness (visual de celular)
```bash
ffmpeg -i input.mp4 -vf "eq=brightness=0.06" output.mp4
```
- **Efeito**: vídeo mais Claro (como gravado no celular)

### 2. Saturação Vibrante
```bash
ffmpeg -i input.mp4 -vf "eq=saturation=1.3" output.mp4
```
- **Efeito**: cores mais vibrantes (estilo TikTok)

### 3. Contraste Profundo
```bash
ffmpeg -i input.mp4 -vf "eq=contrast=1.1" output.mp4
```
- **Efeito**: imagem mais marcada

### 4. Filtro "Calor" (amarelado)
```bash
ffmpeg -i input.mp4 -vf "colorbalance=rs=0.1:gs=-0.05:bs=0.05" output.mp4
```
- **Efeito**: tom mais quente (estilo amber)

### 5. Unsharp (nitidez mobile)
```bash
ffmpeg -i input.mp4 -vf "unsharp=5:5:0.5:3:5:0.0" output.mp4
```
- **Efeito**: nitidez de câmera de celular

### 6. Shake (trepidação)
```bash
ffmpeg -i input.mp4 -vf "shake=3:2" output.mp4
```
- **Efeito**: pequenas tremidas (naturalidade)

---

## PIPELINE COMPLETO

```bash
#!/bin/bash
# ugc_pipeline.sh

INPUT=$1
TEMP="/tmp/ugc_temp.mp4"
OUTPUT=$2

ffmpeg -i $INPUT \
  -vf "eq=brightness=0.06:saturation=1.3:contrast=1.1" \
  -c:a copy $TEMP

ffmpeg -i $TEMP \
  -vf "colorbalance=rs=0.1:gs=-0.05:bs=0.05" \
  -c:a copy $TEMP2

ffmpeg -i $TEMP2 \
  -vf "unsharp=5:5:0.5:3:5:0.0" \
  -c:a copy $OUTPUT

rm $TEMP $TEMP2
echo "UGC filter applied: $OUTPUT"
```

---

## USO

```python
from skills.ugc_post_processor import apply_ugc_filters

video_path = "dra_olivia_raw.mp4"
final_video = await apply_ugc_filters(video_path)
# Retorna: caminho do vídeo com filtros aplicados
```

---

## LEGENDAS (Estilo Hormozi)

Para adicionar legendas sincronizadas:
- Usar **Remotion** (recomendado)
- Ou **Whisper** para transcrever + Python para timing

```python
def add_captions(video_path: str, roteiro: Roteiro):
    # Gera legendas com timing
    # Fonte: Bold, colorida, com highlight nas palavras-chave
    pass
```
---
name: ugc-post-processor
description: Aplica filtros e efeitos estilo UGC (celular) em vídeos
---

# UGC POST-PROCESSOR SKILL

## Filtros FFMPEG
1. Brightness: eq=brightness=0.06
2. Saturation: eq=saturation=1.3
3. Contrast: eq=contrast=1.1
4. Warmth: colorbalance=rs=0.1:gs=-0.05:bs=0.05
5. Sharpen: unsharp=5:5:0.5:3:5:0.0
6. Shake: shake=3:2

## Pipeline de Render
Aplica brilho -> saturação -> contraste -> nitidez -> trepidação.

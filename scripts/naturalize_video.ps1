# Script para naturalizar vídeos da Tavus (Estilo UGC)
# Uso: .\scripts\naturalize_video.ps1 -input "video.mp4" -mood "alerta"

param (
    [Parameter(Mandatory=$true)][string]$input,
    [string]$output = "output_naturalizado.mp4",
    [string]$mood = "padrao" # opções: padrao, alerta, dica
)

Write-Host "🚀 Iniciando processamento UGC (Mood: $mood)..." -ForegroundColor Cyan

$filter = ""

if ($mood -eq "alerta") {
    # Tom frio, sério, institucional
    $filter = "eq=brightness=0.02:saturation=0.8:contrast=1.2,colorbalance=rs=-0.1:gs=0:bs=-0.15"
} elseif ($mood -eq "dica") {
    # Tom quente, alegre, viral
    $filter = "eq=brightness=0.1:saturation=1.5:contrast=1.05,colorbalance=rs=0.15:gs=0.05:bs=0.1"
} else {
    # Padrão UGC
    $filter = "eq=brightness=0.06:saturation=1.3:contrast=1.1,colorbalance=rs=0.1:gs=-0.05:bs=0.05"
}

$fullFilter = "$filter,unsharp=5:5:0.5:3:5:0.0"

ffmpeg -i $input -vf $fullFilter -c:v libx264 -preset fast -crf 23 -c:a copy $output -y

Write-Host "✅ Vídeo finalizado com sucesso: $output" -ForegroundColor Green

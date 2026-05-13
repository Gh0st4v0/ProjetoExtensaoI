# ============================================================
# CarneUp - Iniciar Frontend (React + Vite)
# ============================================================

$FRONTEND = "$PSScriptRoot\Source\Client\carneup-frontend"

Write-Host ""
Write-Host "Iniciando frontend React..."
Write-Host "Acesse em: http://localhost:5173"
Write-Host ""

Push-Location $FRONTEND
npm run dev
Pop-Location

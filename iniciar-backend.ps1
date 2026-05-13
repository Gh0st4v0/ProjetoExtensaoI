# ============================================================
# CarneUp - Iniciar Backend (Spring Boot)
# ============================================================

$BACKEND = "$PSScriptRoot\Source\Server\SpringBootApp"

# Sempre carrega as variaveis salvas (sobrescreve qualquer valor antigo na sessao)
$env:DB_PATH     = [System.Environment]::GetEnvironmentVariable("DB_PATH", "User")
$env:DB_USERNAME = [System.Environment]::GetEnvironmentVariable("DB_USERNAME", "User")
$env:DB_PASSWORD = [System.Environment]::GetEnvironmentVariable("DB_PASSWORD", "User")

if (-not $env:DB_PATH -or -not $env:DB_PASSWORD) {
    Write-Host "ERRO: Variaveis de ambiente nao configuradas. Execute setup.ps1 primeiro." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Iniciando backend Spring Boot..."
Write-Host "URL do banco: $env:DB_PATH"
Write-Host "Acesse a API em: http://localhost:8080"
Write-Host "Swagger UI em:   http://localhost:8080/swagger-ui.html"
Write-Host ""

Push-Location $BACKEND
& "$BACKEND\mvnw.cmd" clean spring-boot:run
Pop-Location

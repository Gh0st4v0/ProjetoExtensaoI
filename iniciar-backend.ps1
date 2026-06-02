# ============================================================
# CarneUp - Iniciar Backend (Spring Boot)
# ============================================================

$BACKEND = "$PSScriptRoot\Source\Server\SpringBootApp"

# Sempre carrega as variaveis salvas (sobrescreve qualquer valor antigo na sessao)
$env:DB_PATH     = [System.Environment]::GetEnvironmentVariable("DB_PATH", "User")
$env:DB_USERNAME = [System.Environment]::GetEnvironmentVariable("DB_USERNAME", "User")
$env:DB_PASSWORD = [System.Environment]::GetEnvironmentVariable("DB_PASSWORD", "User")

# Garantir que JAVA_HOME esta configurado
if (-not $env:JAVA_HOME) {
    $env:JAVA_HOME = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
}
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $javaDir = Get-ChildItem "C:\Program Files\Java" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "jdk*" } | Sort-Object Name -Descending | Select-Object -First 1
    if ($javaDir) { $env:JAVA_HOME = $javaDir.FullName }
}
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

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

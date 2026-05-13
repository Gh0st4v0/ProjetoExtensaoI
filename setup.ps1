# ============================================================
# CarneUp - Script de Configuracao Inicial
# Execute este script UMA VEZ para configurar o ambiente local
# ============================================================

$ErrorActionPreference = "Stop"
$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$PG_USER = "postgres"
$DB_NAME = "JuniorPrimeBeef"
$MIGRATIONS = "$PSScriptRoot\Source\Server\SpringBootApp\src\main\resources\migrations"
$FRONTEND = "$PSScriptRoot\Source\Client\carneup-frontend"

Write-Host ""
Write-Host "======================================"
Write-Host "  CarneUp - Configuracao do Ambiente  "
Write-Host "======================================"
Write-Host ""

# --- Solicitar senha do PostgreSQL ---
$pgPasswordSecure = Read-Host "Digite a senha do PostgreSQL (usuario postgres)" -AsSecureString
$pgPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPasswordSecure)
)
$env:PGPASSWORD = $pgPassword

# --- Verificar conexao com PostgreSQL ---
Write-Host ""
Write-Host "[1/4] Verificando conexao com PostgreSQL..."
$testConn = & $PSQL -U $PG_USER -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Nao foi possivel conectar ao PostgreSQL. Verifique a senha e tente novamente." -ForegroundColor Red
    exit 1
}
Write-Host "     Conexao OK!" -ForegroundColor Green

# --- Criar banco de dados ---
Write-Host ""
Write-Host "[2/4] Criando banco de dados '$DB_NAME'..."
$createDb = & $PSQL -U $PG_USER -c "CREATE DATABASE `"$DB_NAME`";" 2>&1
if ($createDb -match "already exists") {
    Write-Host "     Banco de dados ja existe, pulando criacao." -ForegroundColor Yellow
} else {
    Write-Host "     Banco criado com sucesso!" -ForegroundColor Green
}

# --- Executar migrations ---
Write-Host ""
Write-Host "[3/4] Executando migrations do banco de dados..."

Write-Host "     Executando V2 (schema principal)..."
$v2 = & $PSQL -U $PG_USER -d $DB_NAME -f "$MIGRATIONS\V2_DATABASE-MODEL.sql" 2>&1
if ($LASTEXITCODE -ne 0 -and $v2 -notmatch "already exists") {
    Write-Host "AVISO na migration V2: $v2" -ForegroundColor Yellow
} else {
    Write-Host "     V2 OK!" -ForegroundColor Green
}

Write-Host "     Executando V3 (correcao de chaves estrangeiras)..."
$v3 = & $PSQL -U $PG_USER -d $DB_NAME -f "$MIGRATIONS\V3_DATABASE-MIGRATION-ALTER-FOREIGN-KEYS.sql" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "AVISO na migration V3: $v3" -ForegroundColor Yellow
} else {
    Write-Host "     V3 OK!" -ForegroundColor Green
}

# --- Configurar variaveis de ambiente (persistentes para o usuario) ---
Write-Host ""
Write-Host "[4/4] Configurando variaveis de ambiente..."
[System.Environment]::SetEnvironmentVariable("DB_PATH", "jdbc:postgresql://localhost:5432/$DB_NAME", "User")
[System.Environment]::SetEnvironmentVariable("DB_USERNAME", $PG_USER, "User")
[System.Environment]::SetEnvironmentVariable("DB_PASSWORD", $pgPassword, "User")
Write-Host "     DB_PATH, DB_USERNAME, DB_PASSWORD configurados!" -ForegroundColor Green

# Setar na sessao atual tambem
$env:DB_PATH = "jdbc:postgresql://localhost:5432/$DB_NAME"
$env:DB_USERNAME = $PG_USER
$env:DB_PASSWORD = $pgPassword

# Limpar senha da memoria
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "======================================"
Write-Host "  Setup concluido com sucesso!"
Write-Host ""
Write-Host "  Para iniciar o projeto, use:"
Write-Host "    Backend:  .\iniciar-backend.ps1"
Write-Host "    Frontend: .\iniciar-frontend.ps1"
Write-Host "======================================"
Write-Host ""

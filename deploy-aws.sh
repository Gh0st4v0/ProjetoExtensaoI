#!/bin/bash
# ============================================================
# CarneUp - Script de Deploy para AWS Academy EC2
# ============================================================
# Uso: bash deploy-aws.sh <SENHA_DO_BANCO>
# Exemplo: bash deploy-aws.sh carneup123
# ============================================================

set -e

DB_PASSWORD="${1:-carneup123}"
REPO_URL="https://github.com/Gh0st4v0/ProjetoExtensaoI.git"
DB_NAME="juniorprimebeef"
DB_USER="postgres"
APP_DIR="/opt/carneup"

# Detecta o IP publico automaticamente
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

echo ""
echo "======================================"
echo "  CarneUp - Deploy AWS Academy"
echo "  IP detectado: $EC2_PUBLIC_IP"
echo "======================================"
echo ""

# ------ 1. Atualizar sistema ------
echo "[1/8] Atualizando sistema..."
sudo apt-get update -qq
sudo apt-get install -y git curl unzip

# ------ 2. Instalar Java 21 ------
echo "[2/8] Instalando Java 21..."
sudo apt-get install -y openjdk-21-jdk
java -version

# ------ 3. Instalar e configurar PostgreSQL ------
echo "[3/8] Instalando PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "  Configurando banco de dados..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "  Banco ja existe, continuando..."

# ------ 4. Instalar Node.js 20 ------
echo "[4/8] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
sudo apt-get install -y nodejs
node -v && npm -v

# ------ 5. Instalar Nginx ------
echo "[5/8] Instalando Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx

# ------ 6. Clonar repositório ------
echo "[6/8] Clonando repositório..."
sudo rm -rf $APP_DIR
sudo mkdir -p $APP_DIR
sudo chown ubuntu:ubuntu $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

# Executar migrations
echo "  Criando tabelas no banco..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME \
  -f Source/Server/SpringBootApp/src/main/resources/migrations/V2_DATABASE-MODEL.sql
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME \
  -f Source/Server/SpringBootApp/src/main/resources/migrations/V3_DATABASE-MIGRATION-ALTER-FOREIGN-KEYS.sql

# Inserir usuario admin
BCRYPT_HASH='$2a$10$LV.hiyw.7X2R51DjAd0LNeYMfNPY7HL5UBhvc5oq.ktK0TcwP2sz6'
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME \
  -c "INSERT INTO usuario (nome, senha, nivel_acesso, email, ultimo_email_alteracao) VALUES ('admin', '$BCRYPT_HASH', 'ADM', 'admin@carneup.com', CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING;" 2>/dev/null || true

# ------ 7. Build Frontend ------
echo "[7/8] Construindo frontend React..."
cd $APP_DIR/Source/Client/carneup-frontend
npm install --silent
VITE_API_URL="http://$EC2_PUBLIC_IP:8080" npm run build

sudo rm -rf /var/www/carneup
sudo cp -r dist /var/www/carneup
echo "  Frontend publicado em /var/www/carneup"

# ------ 8. Build e configurar Backend ------
echo "[8/8] Construindo backend Spring Boot (pode demorar alguns minutos)..."
cd $APP_DIR/Source/Server/SpringBootApp
chmod +x mvnw
./mvnw clean package -DskipTests -q

sudo mkdir -p /opt/carneup-backend
sudo cp target/SpringBootApp-0.0.1-SNAPSHOT.jar /opt/carneup-backend/app.jar
echo "  JAR copiado para /opt/carneup-backend/app.jar"

# ------ Configurar Nginx ------
echo "  Configurando Nginx..."
sudo tee /etc/nginx/sites-available/carneup > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    root /var/www/carneup;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/carneup /etc/nginx/sites-enabled/carneup
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# ------ Configurar Backend como Servico ------
echo "  Configurando servico do backend..."
sudo tee /etc/systemd/system/carneup-backend.service > /dev/null <<EOF
[Unit]
Description=CarneUp Backend Spring Boot
After=network.target postgresql.service

[Service]
User=ubuntu
Environment="DB_PATH=jdbc:postgresql://localhost:5432/$DB_NAME"
Environment="DB_USERNAME=$DB_USER"
Environment="DB_PASSWORD=$DB_PASSWORD"
Environment="RESEND_API_KEY=not-configured"
ExecStart=/usr/bin/java -jar /opt/carneup-backend/app.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable carneup-backend
sudo systemctl start carneup-backend

echo ""
echo "  Aguardando backend iniciar (30 segundos)..."
sleep 30

# Verifica se backend subiu
if sudo systemctl is-active --quiet carneup-backend; then
  echo "  Backend: RODANDO"
else
  echo "  AVISO: Backend pode estar iniciando ainda. Verifique com:"
  echo "  sudo journalctl -u carneup-backend -n 50"
fi

echo ""
echo "============================================="
echo "  Deploy concluido com sucesso!"
echo ""
echo "  Acesse a aplicacao:"
echo "  Frontend: http://$EC2_PUBLIC_IP"
echo "  Backend:  http://$EC2_PUBLIC_IP:8080"
echo "  Swagger:  http://$EC2_PUBLIC_IP:8080/swagger-ui.html"
echo ""
echo "  Login:"
echo "  Usuario: admin"
echo "  Senha:   1234"
echo "============================================="
echo ""

#!/bin/bash
# ============================================================
# CarneUp - Script de Atualização na AWS
# Execute na EC2 após fazer push das mudanças no GitHub
# ============================================================

set -e

APP_DIR="/opt/carneup"
FRONTEND="$APP_DIR/Source/Client/carneup-frontend"
BACKEND="$APP_DIR/Source/Server/SpringBootApp"
EC2_PUBLIC_IP="98.89.113.235" # Elastic IP fixo — não muda ao reiniciar

echo ""
echo "======================================"
echo "  CarneUp - Atualizando na AWS"
echo "  IP: $EC2_PUBLIC_IP"
echo "======================================"
echo ""

# 1. Baixar código atualizado
echo "[1/4] Baixando atualizações do GitHub..."
cd $APP_DIR
git fetch origin
git checkout deploy 2>/dev/null || git checkout -b deploy origin/deploy
git pull origin deploy
echo "     Código atualizado!"

# 2. Rebuild frontend
echo ""
echo "[2/4] Reconstruindo frontend..."
cd $FRONTEND
npm install --silent
VITE_API_URL="http://$EC2_PUBLIC_IP:8080" npm run build
sudo rm -rf /var/www/carneup
sudo cp -r dist /var/www/carneup
echo "     Frontend publicado!"

# 3. Rebuild backend
echo ""
echo "[3/4] Reconstruindo backend (aguarde)..."
cd $BACKEND
chmod +x mvnw
./mvnw clean package -DskipTests -q
sudo cp target/SpringBootApp-0.0.1-SNAPSHOT.jar /opt/carneup-backend/app.jar
echo "     JAR atualizado!"

# 4. Reiniciar serviços
echo ""
echo "[4/4] Reiniciando serviços..."
sudo systemctl restart carneup-backend
sudo systemctl reload nginx
sleep 8

if sudo systemctl is-active --quiet carneup-backend; then
  echo "     Backend: RODANDO"
else
  echo "     ERRO no backend. Verifique:"
  echo "     sudo journalctl -u carneup-backend -n 30"
fi

echo ""
echo "======================================"
echo "  Atualização concluída!"
echo "  Acesse: http://$EC2_PUBLIC_IP"
echo "======================================"
echo ""

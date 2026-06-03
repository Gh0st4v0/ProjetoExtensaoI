# ==========================================
# Estágio 1: Compilação (Build) da Aplicação
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copia os arquivos de dependências primeiro para aproveitar o cache de camadas do Docker
COPY package*.json ./

# Instala as dependências de forma limpa e otimizada para CI
RUN npm ci || npm install

# Copia o restante do código-fonte do frontend
COPY . .

# 🔴 O SEGREDO DO SUCESSO: Captura a Secret enviada pelo GitHub Actions
# IMPORTANTE: Se o seu projeto não usar Vite (ex: React puro antigo),
# mude "VITE_API_URL" para "REACT_APP_API_URL" tanto aqui quanto no workflow.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Executa o build estático injetando a URL real da API no código gerado
RUN npm run build

# ==========================================
# Estágio 2: Servidor Web (Produção)
# ==========================================
FROM nginx:alpine

# Copia a pasta compilada do estágio anterior para o diretório público do Nginx
# NOTA: O padrão do Vite é gerar a pasta 'dist'. Se o seu projeto gerar 'build', altere o caminho abaixo.
COPY --from=build /app/dist /usr/share/nginx/html

# Ajuste opcional para evitar erro 404 ao atualizar a página (F5) em subrotas do React Router
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || true
RUN mkdir -p /tmp/out && \
    if [ -d build ]; then cp -r build/* /tmp/out/; elif [ -d dist ]; then cp -r dist/* /tmp/out/; else echo "No build output"; fi && \
    tar -czf /tmp/out.tar.gz -C /tmp/out .

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /tmp/out.tar.gz /tmp/out.tar.gz
RUN tar -xzf /tmp/out.tar.gz -C /usr/share/nginx/html && rm /tmp/out.tar.gz
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

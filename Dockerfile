# Estágio 1: Build da aplicação React SPA
FROM node:22-alpine AS builder

WORKDIR /app

# Instala pnpm de forma estável
RUN npm install -g pnpm@9

# Copia arquivos de definição de dependência
COPY package.json pnpm-lock.yaml ./

# Instala dependências respeitando o lockfile
RUN pnpm install --frozen-lockfile

# Copia todo o código-fonte
COPY . .

# Compila o projeto com validação TypeScript
RUN pnpm run build

# Estágio 2: Nginx + Node leve para telemetria nos logs do Coolify
FROM nginx:alpine AS runner

# Instala Node.js para o monitor de telemetria
RUN apk add --no-cache nodejs

WORKDIR /app

# Remove a página padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia a configuração do Nginx com suporte a SPA e telemetria
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia a build do frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia o script de telemetria e o entrypoint
COPY telemetry.js /app/telemetry.js
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expõe as portas 80 e 3000 para compatibilidade total com o Coolify Traefik
EXPOSE 80 3000

# Executa o entrypoint que inicia Nginx e Telemetria
CMD ["/app/entrypoint.sh"]
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

# Estágio 2: Nginx para servir os arquivos estáticos
FROM nginx:alpine AS runner

# Remove a página padrão do Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia a configuração do Nginx com suporte a SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia a build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 para o proxy reverso do Coolify
EXPOSE 80

# Inicia o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]

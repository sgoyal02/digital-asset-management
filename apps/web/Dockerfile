FROM node:22
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@11.5.1 --activate
RUN apt-get update && apt-get install -y curl
ENV CI=true
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["pnpm", "--filter", "web", "dev", "--host", "0.0.0.0"]
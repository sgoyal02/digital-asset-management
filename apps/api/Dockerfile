FROM node:22
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@11.5.1 --activate
ENV CI=true
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5000
CMD ["pnpm", "--filter", "api", "dev"]
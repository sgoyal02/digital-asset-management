FROM node:22
WORKDIR /app
RUN corepack enable
ENV CI=true
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["pnpm", "--filter", "web", "dev", "--host", "0.0.0.0"]
FROM node:22 as base
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@11.5.1 --activate
ENV CI=true
#system dependencies install--for ffmpeg,sharp,prisma
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile


#--dev runtym-
FROM node:22 AS dev
WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@11.5.1 --activate
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=base /app /app

COPY . .
EXPOSE 5000
CMD ["pnpm", "--filter", "api", "dev"]
#no need cmd abv as startup control by dockercompose
# CMD ["node"]
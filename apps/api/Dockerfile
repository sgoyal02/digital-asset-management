FROM node:22
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@11.5.1 --activate
ENV CI=true
#system dependencies install--for ffmpeg,sharp,prisma
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5000
CMD ["pnpm", "--filter", "api", "dev"]
#no need cmd abv as startup control by dockercompose
# CMD ["node"]
#buildin-
FROM node:22 AS front-builder
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@11.5.1 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter web build

#nginx-
FROM nginx:alpine
COPY --from=front-builder \
     /app/apps/web/dist \
     /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
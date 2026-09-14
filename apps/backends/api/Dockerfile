FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig*.json ./
COPY apps apps
COPY packages packages
RUN pnpm install --frozen-lockfile
RUN pnpm nx prune @autodev/api

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /workspace/apps/backends/api/dist ./
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate && pnpm install --prod --frozen-lockfile
USER node
EXPOSE 3000
CMD ["node", "main.js"]

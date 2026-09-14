FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig*.json ./
COPY apps/backends/api apps/backends/api
RUN pnpm install --frozen-lockfile
RUN pnpm nx build @autodev/api --configuration=production

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
USER node
COPY --from=build --chown=node:node /workspace/apps/backends/api/dist ./
EXPOSE 3000
CMD ["node", "main.js"]

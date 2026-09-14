FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig*.json ./
COPY apps/frontends/web apps/frontends/web
RUN pnpm install --frozen-lockfile
ARG API_URL=http://api:3000
ENV API_URL=$API_URL
ENV CONTAINER_BUILD=true
RUN pnpm nx build @autodev/web

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app
USER node
COPY --from=build --chown=node:node /workspace/apps/frontends/web/.next/standalone ./
COPY --from=build --chown=node:node /workspace/apps/frontends/web/.next/static ./apps/frontends/web/.next/static
COPY --from=build --chown=node:node /workspace/apps/frontends/web/public ./apps/frontends/web/public
EXPOSE 3001
CMD ["node", "apps/frontends/web/server.js"]

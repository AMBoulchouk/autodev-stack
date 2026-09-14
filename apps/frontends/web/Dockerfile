FROM node:24-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig*.json ./
COPY apps apps
COPY packages packages
RUN pnpm install --frozen-lockfile
ARG API_URL=http://api:3000
ENV API_URL=$API_URL
ENV CONTAINER_BUILD=true
RUN pnpm nx build @autodev/web

FROM alpine:3.24 AS runtime
ENV NODE_ENV=production
ENV PORT=3001
ENV NODE_PATH=/app/node_modules/.pnpm/node_modules
WORKDIR /app
RUN apk upgrade --no-cache \
  && apk add --no-cache dumb-init libstdc++ \
  && addgroup -g 1000 node \
  && adduser -u 1000 -G node -s /bin/sh -D node
COPY --from=build /usr/local/bin/node /usr/local/bin/node
COPY --from=build --chown=node:node /workspace/apps/frontends/web/.next/standalone ./
COPY --from=build --chown=node:node /workspace/apps/frontends/web/.next/static ./apps/frontends/web/.next/static
COPY --from=build --chown=node:node /workspace/apps/frontends/web/public ./apps/frontends/web/public
USER node
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/frontends/web/server.js"]

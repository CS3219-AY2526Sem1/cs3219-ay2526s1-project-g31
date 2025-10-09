# Build and run Next.js UI with local monorepo dependency ../shared

FROM node:20-bookworm-slim AS deps
WORKDIR /app

# 1) Build shared first
COPY shared/package.json shared/tsconfig.json ./shared/
COPY shared/src ./shared/src
WORKDIR /app/shared
RUN corepack enable && corepack prepare yarn@stable --activate || true
RUN yarn install --immutable || yarn install --frozen-lockfile || yarn install
RUN yarn build

# 2) Install UI deps
WORKDIR /app/ui
COPY ui/package.json ./
COPY ui/yarn.lock ./
RUN corepack enable && corepack prepare yarn@stable --activate || true
RUN yarn install --immutable || yarn install --frozen-lockfile || yarn install

FROM node:20-bookworm-slim AS builder
WORKDIR /app/ui
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/shared /app/shared
COPY --from=deps /app/ui/node_modules ./node_modules
COPY ui .

# Build Next.js
RUN yarn build

FROM node:20-bookworm-slim AS runner
WORKDIR /app/ui
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/ui/.next ./.next
COPY --from=builder /app/ui/node_modules ./node_modules
COPY --from=builder /app/ui/package.json ./package.json
COPY --from=builder /app/ui/next.config.ts ./next.config.ts
COPY --from=builder /app/ui/public ./public

EXPOSE 3000
CMD ["yarn", "start"]

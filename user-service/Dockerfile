# Build and run the user-service with its local monorepo dependency ../shared

FROM node:20-bookworm-slim AS builder

WORKDIR /app
ENV NODE_ENV=development

# Prisma needs OpenSSL at runtime; install once in both stages
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# 1) Build the shared package
COPY shared/package.json shared/tsconfig.json ./shared/
COPY shared/src ./shared/src
WORKDIR /app/shared
RUN corepack enable && corepack prepare yarn@stable --activate || true
RUN yarn install --immutable || yarn install --frozen-lockfile || yarn install
RUN yarn build

# 2) Install and build user-service
WORKDIR /app/user-service
COPY user-service/package.json ./
COPY user-service/tsconfig.json ./
COPY user-service/prisma ./prisma
COPY user-service/src ./src

# Install deps and ensure local shared is linked
RUN corepack enable && corepack prepare yarn@stable --activate || true
RUN yarn install --immutable || yarn install --frozen-lockfile || yarn install

# Generate Prisma client and compile TS
RUN yarn build

FROM node:20-bookworm-slim AS runner
WORKDIR /app/user-service
ENV NODE_ENV=production

# OpenSSL for Prisma query engine
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Copy built artifacts and node_modules (includes shared and prisma client)
COPY --from=builder /app/user-service/dist ./dist
COPY --from=builder /app/user-service/node_modules ./node_modules
COPY --from=builder /app/user-service/package.json ./package.json
COPY --from=builder /app/user-service/prisma ./prisma

# Expose a default port (override via env USER_SERVICE_PORT)
EXPOSE 4001

CMD ["node", "dist/index.js"]

FROM node:20-alpine AS builder

WORKDIR /app

COPY ./shared/ ./shared/
COPY ./ui/ ./ui/

WORKDIR /app/ui

RUN yarn shared
RUN yarn install
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app/ui

COPY --from=builder /app/ui/.next ./.next
COPY --from=builder /app/ui/public ./public
COPY --from=builder /app/ui/node_modules ./node_modules
COPY --from=builder /app/ui/next.config.ts ./next.config.ts
COPY --from=builder /app/ui/package.json ./package.json
COPY --from=builder /app/ui/yarn.lock ./yarn.lock

EXPOSE 3000

CMD ["yarn", "start"]
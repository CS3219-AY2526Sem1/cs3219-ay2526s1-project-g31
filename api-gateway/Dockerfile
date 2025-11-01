FROM node:20-alpine AS builder

WORKDIR /app

COPY ./shared/ ./shared/
COPY ./api-gateway/ ./api-gateway/

WORKDIR /app/api-gateway

RUN yarn shared
RUN yarn install
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app/api-gateway

COPY --from=builder /app/api-gateway/dist ./dist
COPY --from=builder /app/api-gateway/node_modules ./node_modules
COPY --from=builder /app/api-gateway/package.json ./package.json
COPY --from=builder /app/api-gateway/yarn.lock ./yarn.lock

EXPOSE 4000

CMD ["yarn", "start"]
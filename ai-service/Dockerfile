FROM node:20-alpine AS builder

WORKDIR /app

COPY ./shared/ ./shared/
COPY ./ai-service/ ./ai-service/

WORKDIR /app/ai-service

RUN yarn shared
RUN yarn install
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app/ai-service

COPY --from=builder /app/ai-service/dist ./dist
COPY --from=builder /app/ai-service/node_modules ./node_modules
COPY --from=builder /app/ai-service/package.json ./package.json
COPY --from=builder /app/ai-service/yarn.lock ./yarn.lock

EXPOSE 3005

CMD ["yarn", "start"]
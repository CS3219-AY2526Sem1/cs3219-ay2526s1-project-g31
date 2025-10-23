FROM node:20-alpine AS builder

WORKDIR /app

COPY ./shared/ ./shared/
COPY ./matching-service/ ./matching-service/

WORKDIR /app/matching-service

RUN yarn shared
RUN yarn install
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app/matching-service

COPY --from=builder /app/matching-service/dist ./dist
COPY --from=builder /app/matching-service/node_modules ./node_modules
COPY --from=builder /app/matching-service/package.json ./package.json
COPY --from=builder /app/matching-service/yarn.lock ./yarn.lock

EXPOSE 3002

CMD ["yarn", "start"]
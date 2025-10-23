FROM node:20-alpine AS builder

WORKDIR /app

COPY ./shared/ ./shared/
COPY ./user-service/ ./user-service/

WORKDIR /app/user-service

RUN yarn shared
RUN yarn install
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app/user-service

COPY --from=builder /app/user-service/dist ./dist
COPY --from=builder /app/user-service/node_modules ./node_modules
COPY --from=builder /app/user-service/package.json ./package.json
COPY --from=builder /app/user-service/yarn.lock ./yarn.lock
COPY --from=builder /app/user-service/prisma ./prisma

EXPOSE 3001

CMD ["yarn", "start"]
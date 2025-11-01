FROM node:20-alpine AS builder

WORKDIR /app

COPY ./shared/ ./shared/
COPY ./question-service/ ./question-service/

WORKDIR /app/question-service

RUN yarn shared
RUN yarn install
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app/question-service

COPY --from=builder /app/question-service/dist ./dist
COPY --from=builder /app/question-service/node_modules ./node_modules
COPY --from=builder /app/question-service/package.json ./package.json
COPY --from=builder /app/question-service/yarn.lock ./yarn.lock
COPY --from=builder /app/question-service/prisma ./prisma

EXPOSE 3003

CMD ["yarn", "start"]
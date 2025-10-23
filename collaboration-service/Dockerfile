FROM node:20-alpine AS builder

WORKDIR /app

COPY ./shared/ ./shared/
COPY ./collaboration-service/ ./collaboration-service/

WORKDIR /app/collaboration-service

RUN yarn shared
RUN yarn install
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app/collaboration-service

COPY --from=builder /app/collaboration-service/dist ./dist
COPY --from=builder /app/collaboration-service/node_modules ./node_modules
COPY --from=builder /app/collaboration-service/package.json ./package.json
COPY --from=builder /app/collaboration-service/yarn.lock ./yarn.lock

EXPOSE 3004

CMD ["yarn", "start"]
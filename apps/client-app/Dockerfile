FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .

FROM base AS prune
RUN npm install -g turbo && turbo prune --scope=client-app --docker

FROM node:20-alpine AS install
WORKDIR /app
COPY --from=prune /app/out/json/ .
RUN npm install
COPY --from=prune /app/out/full/ .

RUN npm run build --workspace=client-app

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=install /app/apps/client-app/next.config.js ./apps/client-app/next.config.js
COPY --from=install /app/apps/client-app/package.json ./apps/client-app/package.json
COPY --from=install /app/apps/client-app/.next ./apps/client-app/.next
COPY --from=install /app/packages ./packages
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=client-app"]

FROM node:20-alpine AS base
WORKDIR /app
COPY . .
RUN npm install -g turbo

ARG APP_NAME
RUN turbo prune --scope=$APP_NAME --docker

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=base /app/out/json/ .
RUN npm install
COPY --from=base /app/out/full/ .
RUN npm run build --workspace=$APP_NAME

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/$APP_NAME/.next ./apps/$APP_NAME/.next
COPY --from=build /app/apps/$APP_NAME/package.json ./apps/$APP_NAME/package.json
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=$APP_NAME"]

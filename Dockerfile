# Use Node.js LTS as base image
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

# Set working directory
WORKDIR /app

# Copy package manager files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy app package.json
COPY apps/client-app/package.json ./apps/client-app/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm and wget for healthcheck
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate && \
    apk add --no-cache wget

# Copy necessary files from base
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/pnpm-workspace.yaml ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/client-app/node_modules ./apps/client-app/node_modules

# Copy built application from builder
COPY --from=builder /app/apps/client-app/.next ./apps/client-app/.next
COPY --from=builder /app/apps/client-app/public ./apps/client-app/public
COPY --from=builder /app/apps/client-app/package.json ./apps/client-app/
COPY --from=builder /app/apps/client-app/next.config.mjs ./apps/client-app/

# Copy turbo config
COPY --from=builder /app/turbo.json ./

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["pnpm", "--filter", "client-app", "start"]


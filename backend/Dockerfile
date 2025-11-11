# Multi-stage Dockerfile for NestJS applications
# Optimized for production with minimal image size

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY apps/ ./apps/
COPY common/ ./common/
COPY core/ ./core/
COPY config/ ./config/

# Build both applications
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nestjs:nodejs logs

USER nestjs

# Default to gateway (can be overridden in docker-compose)
CMD ["node", "dist/apps/gateway/main"]

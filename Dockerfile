# Multi-stage build for optimized production image
FROM node:20.18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .nvmrc ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 3000 5173

# Development command
CMD ["dumb-init", "npm", "run", "dev"]

# Build stage
FROM base AS builder

# Install all dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:20.18-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S perchance -u 1001

# Create app directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=perchance:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=perchance:nodejs /app/package*.json ./
COPY --from=builder --chown=perchance:nodejs /app/src ./src
COPY --from=builder --chown=perchance:nodejs /app/bin ./bin
COPY --from=builder --chown=perchance:nodejs /app/docs ./docs
COPY --from=builder --chown=perchance:nodejs /app/web/dist ./web/dist

# Create directories
RUN mkdir -p logs data tmp && chown -R perchance:nodejs logs data tmp

# Switch to non-root user
USER perchance

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["dumb-init", "npm", "start"]
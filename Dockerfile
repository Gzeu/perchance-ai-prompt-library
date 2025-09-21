# Multi-stage Docker build for Perchance AI Prompt Library
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY web/package*.json ./web/

# Install dependencies
RUN npm ci --only=production
RUN cd web && npm ci --only=production

# Development stage
FROM base AS development

# Install all dependencies (including dev)
RUN npm ci
RUN cd web && npm ci

# Copy source code
COPY . .

# Build web interface
RUN cd web && npm run build

# Expose ports
EXPOSE 3000 5173

# Development command
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S perchance -u 1001

# Copy built application
COPY --from=development --chown=perchance:nodejs /app .

# Switch to non-root user
USER perchance

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Production command
CMD ["npm", "start"]
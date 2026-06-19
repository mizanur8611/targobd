# TargoBD Backend — Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy source
COPY backend/ .

# Create uploads directory
RUN mkdir -p uploads/products uploads/avatars

# Non-root user (security)
RUN addgroup -g 1001 -S nodejs && adduser -S targobd -u 1001
USER targobd

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]

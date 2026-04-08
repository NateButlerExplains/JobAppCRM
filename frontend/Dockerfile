# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Build with Vite
RUN npm run build

# Runtime stage - serve built files
FROM node:18-alpine

WORKDIR /app

# Install serve to run the static build
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create logs directory (if needed)
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3000

# Environment variables
ENV VITE_API_BASE=http://localhost:5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]

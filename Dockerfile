#!/usr/bin/env docker
# Multi-stage Dockerfile for Node.js TypeScript Application
# Follows best practices: minimal runtime image, separate build stage

# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy source files and config
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Install dependencies (production only for final image, but needed for build)
RUN npm ci

# Build the TypeScript application
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:20-alpine

# Create working directory
WORKDIR /app

# Copy only the build artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./

# Install production dependencies only
RUN npm ci --production

# Set environment labels
LABEL org.opencontainers.image.source="https://github.com/your-repo"
LABEL org.opencontainers.image.version="1.0.0"

# Expose the application port
EXPOSE 3333

# Command to start the application
# Assumes start script is defined in package.json
CMD ["npm", "start"]
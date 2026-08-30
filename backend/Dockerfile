# Multi-stage Node.js Production Dockerfile for Digital Skill Passport Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install production and build dependencies
RUN npm ci

# Copy backend source code
COPY . .

# Final runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init to handle signals properly in container
RUN apk add --no-cache dumb-init

# Copy built application & node_modules
COPY --from=builder /app /app

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

EXPOSE 5000

USER node

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]

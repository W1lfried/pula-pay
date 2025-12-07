###############################################################################
# BUILDER
###############################################################################
FROM node:20-alpine AS builder

WORKDIR /app

# Install OS deps
RUN apk add --no-cache openssl

# Copy package files for better caching
COPY package*.json ./

# Install dependencies (prod + dev)
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client BEFORE copying TS (faster builds)
RUN npx prisma generate

# Copy TS sources
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript -> dist/
RUN npm run build

# Copy swagger
COPY src/docs ./dist/docs

###############################################################################
# RUNNER
###############################################################################
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

# Copy only production dependencies + dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy package.json for metadata
COPY package*.json ./

EXPOSE 3000

# Run Prisma migrations then start your server
CMD ["npm", "run", "start"]

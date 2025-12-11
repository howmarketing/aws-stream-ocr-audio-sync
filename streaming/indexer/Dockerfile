# Indexer Worker - HLS Segment Timestamp Indexing
FROM node:20-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Create storage directories
RUN mkdir -p /storage/hls /storage/index

# Default environment variables
ENV HLS_PATH="/storage/hls"
ENV INDEX_DB_PATH="/storage/index/segments.db"
ENV SEGMENT_DURATION="2"
ENV NODE_ENV="production"

# Run the indexer
CMD ["node", "dist/index.js"]

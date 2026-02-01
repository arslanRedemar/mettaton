# ============================================================
# Stage 1: Build native modules (better-sqlite3)
# ============================================================
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ============================================================
# Stage 2: Runtime (no build tools)
# ============================================================
FROM node:20-slim

# Chromium + Korean fonts for puppeteer-core
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# gosu for entrypoint privilege drop (separate layer, small)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gosu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy pre-compiled node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY . .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Ensure app ownership for node user
RUN chown -R node:node /app

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Entrypoint fixes data dir permissions then drops to node user via gosu
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "src/index.js"]

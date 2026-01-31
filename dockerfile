
FROM node:lts-slim

# Install build dependencies for better-sqlite3 and Chromium for puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ chromium \
    && rm -rf /var/lib/apt/lists/*


# Create app directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Remove build dependencies to reduce image size
RUN apt-get purge -y python3 make g++ && apt-get autoremove -y

# Copy source code
COPY . .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Run as non-root user for security
RUN groupadd -g 1001 botuser && \
    useradd -u 1001 -g botuser botuser && \
    chown -R botuser:botuser /app
USER botuser

# Start the bot
CMD ["node", "src/index.js"]

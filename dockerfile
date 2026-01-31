
FROM node:20-slim

# Install build dependencies for better-sqlite3 and Chromium for puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ chromium gosu \
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

# Ensure app ownership for node user
RUN chown -R node:node /app

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Entrypoint fixes data dir permissions then drops to node user via gosu
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "src/index.js"]

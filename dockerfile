
FROM node:20-slim

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

# Run as non-root user for security (node user uid=1000 matches host pi user)
RUN chown -R node:node /app
USER node

# Start the bot
CMD ["node", "src/index.js"]

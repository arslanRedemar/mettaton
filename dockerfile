FROM node:lts-alpine3.23

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Remove build dependencies to reduce image size
RUN apk del python3 make g++

# Copy source code
COPY . .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Run as non-root user for security
RUN addgroup -g 1001 -S botuser && \
    adduser -S botuser -u 1001 -G botuser && \
    chown -R botuser:botuser /app
USER botuser

# Start the bot
CMD ["node", "src/index.js"]

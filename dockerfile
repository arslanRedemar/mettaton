FROM node:lts-alpine3.23

# Create app directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Run as non-root user for security
RUN addgroup -g 1001 -S botuser && \
    adduser -S botuser -u 1001 -G botuser && \
    chown -R botuser:botuser /app
USER botuser

# Start the bot
CMD ["node", "src/index.js"]

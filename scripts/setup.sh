#!/bin/bash

# Mettaton Discord Bot - Raspberry Pi Setup Script
# Bare-metal (no Docker) automated setup with auto-update pipeline

set -e

echo "=========================================="
echo "  Mettaton Discord Bot Setup (Bare-metal)"
echo "=========================================="

PROJECT_DIR="/home/pi/mettaton"
NODE_MAJOR=20

# 1. System update
echo "[1/10] Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Node.js 20.x LTS
echo "[2/10] Installing Node.js ${NODE_MAJOR}.x..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt "$NODE_MAJOR" ]; then
    sudo apt-get install -y ca-certificates curl gnupg
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" \
        | sudo tee /etc/apt/sources.list.d/nodesource.list
    sudo apt-get update
    sudo apt-get install -y nodejs
    echo "Node.js $(node -v) installed"
else
    echo "Node.js $(node -v) already installed"
fi

# 3. Install build tools (required for better-sqlite3 native compilation)
echo "[3/10] Installing build tools..."
sudo apt-get install -y python3 make g++ build-essential

# 4. Install Chromium and Korean fonts (required for puppeteer)
echo "[4/10] Installing Chromium and fonts..."
sudo apt-get install -y chromium-browser fonts-noto-cjk

# 5. Setup project directory
echo "[5/10] Setting up project directory..."
if [ ! -d "$PROJECT_DIR" ]; then
    echo "Please clone the project first:"
    echo "  git clone https://github.com/arslanRedemar/mettaton.git $PROJECT_DIR"
    echo "Then re-run this script."
    exit 1
fi

# 6. Create data directories
echo "[6/10] Creating data directories..."
mkdir -p "$PROJECT_DIR/data"
mkdir -p "$PROJECT_DIR/moon_calendars"
mkdir -p "$PROJECT_DIR/backups"
mkdir -p "$PROJECT_DIR/logs"

# 7. Create environment file
echo "[7/10] Setting up environment variables..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cat > "$PROJECT_DIR/.env" << 'EOF'
TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
GREETING_CHANNEL_ID=your_greeting_channel_id
SCHEDULE_CHANNEL_ID=your_schedule_channel_id
QUESTION_CHANNEL_ID=your_question_channel_id
PRACTICE_CHANNEL_ID=your_practice_channel_id
DB_PATH=./data/mettaton.db
CHROMIUM_PATH=/usr/bin/chromium-browser
EOF
    echo ".env file created. Please edit the values:"
    echo "  nano $PROJECT_DIR/.env"
fi

# 8. Install npm dependencies
echo "[8/10] Installing npm dependencies..."
cd "$PROJECT_DIR"
npm ci --only=production

# 9. Register systemd services
echo "[9/10] Registering systemd services..."
sudo cp "$PROJECT_DIR/scripts/mettaton.service" /etc/systemd/system/
sudo cp "$PROJECT_DIR/scripts/mettaton-update.service" /etc/systemd/system/
sudo cp "$PROJECT_DIR/scripts/mettaton-update.timer" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mettaton.service
sudo systemctl enable mettaton-update.timer

# 10. Configure git for auto-updates
echo "[10/10] Configuring git for auto-updates..."
cd "$PROJECT_DIR"
git config pull.rebase false
chmod +x "$PROJECT_DIR/scripts/update.sh"
chmod +x "$PROJECT_DIR/scripts/start.sh"
chmod +x "$PROJECT_DIR/scripts/stop.sh"

sudo systemctl start mettaton-update.timer

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano $PROJECT_DIR/.env"
echo "2. Start the bot: sudo systemctl start mettaton"
echo "3. View bot logs: journalctl -u mettaton -f"
echo "4. Check DB: sqlite3 $PROJECT_DIR/data/mettaton.db"
echo "5. Check auto-update timer: systemctl status mettaton-update.timer"
echo "6. View deploy logs: tail -f $PROJECT_DIR/logs/deploy.log"
echo "7. Manual update: bash $PROJECT_DIR/scripts/update.sh --force --verbose"
echo ""

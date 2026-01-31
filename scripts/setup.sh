#!/bin/bash

# Mettaton Discord Bot - Raspberry Pi Setup Script
# Raspbian OS automated setup with auto-update pipeline

set -e

echo "=========================================="
echo "  Mettaton Discord Bot 설치 스크립트"
echo "=========================================="

# 1. System update
echo "[1/10] Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
echo "[2/10] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker installed"
else
    echo "Docker already installed"
fi

# 3. Verify Docker Compose
echo "[3/10] Verifying Docker Compose..."
if ! docker compose version &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
fi

# 4. Setup project directory
echo "[4/10] Setting up project directory..."
PROJECT_DIR="/home/pi/mettaton"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "Please clone the project to $PROJECT_DIR:"
    echo "git clone https://github.com/arslanRedemar/mettaton.git $PROJECT_DIR"
fi

# 5. Create data directories
echo "[5/10] Creating data directories..."
mkdir -p "$PROJECT_DIR/data"
mkdir -p "$PROJECT_DIR/moon_calendars"

# 6. Create environment file
echo "[6/10] Setting up environment variables..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cat > "$PROJECT_DIR/.env" << 'EOF'
TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
GREETING_CHANEL_ID=your_greeting_channel_id
DB_PATH=/app/data/mettaton.db
EOF
    echo ".env file created. Please edit the values:"
    echo "  nano $PROJECT_DIR/.env"
fi

# 7. Register systemd bot service
echo "[7/10] Registering bot service for auto-start..."
sudo cp "$PROJECT_DIR/scripts/mettaton.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mettaton.service

# 8. Create backup and log directories
echo "[8/10] Creating backup and log directories..."
mkdir -p "$PROJECT_DIR/backups"
mkdir -p "$PROJECT_DIR/logs"

# 9. Configure git for auto-updates
echo "[9/10] Configuring git for auto-updates..."
cd "$PROJECT_DIR"
git config pull.rebase false
chmod +x "$PROJECT_DIR/scripts/update.sh"

# 10. Enable auto-update timer
echo "[10/10] Enabling auto-update timer..."
sudo cp "$PROJECT_DIR/scripts/mettaton-update.service" /etc/systemd/system/
sudo cp "$PROJECT_DIR/scripts/mettaton-update.timer" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mettaton-update.timer
sudo systemctl start mettaton-update.timer

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano $PROJECT_DIR/.env"
echo "2. Reboot or start service: sudo systemctl start mettaton"
echo "3. View bot logs: docker logs -f mettaton-bot"
echo "4. Check DB: sqlite3 $PROJECT_DIR/data/mettaton.db"
echo "5. Check auto-update timer: systemctl status mettaton-update.timer"
echo "6. View deploy logs: tail -f $PROJECT_DIR/logs/deploy.log"
echo "7. Manual update: bash $PROJECT_DIR/scripts/update.sh --force --verbose"
echo ""
echo "* Reboot recommended for Docker group changes: sudo reboot"

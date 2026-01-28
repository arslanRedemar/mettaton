#!/bin/bash

# Mettaton Discord Bot - Raspberry Pi Setup Script
# Raspbian OS용 자동 설치 스크립트

set -e

echo "=========================================="
echo "  Mettaton Discord Bot 설치 스크립트"
echo "=========================================="

# 1. 시스템 업데이트
echo "[1/6] 시스템 업데이트 중..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Docker 설치
echo "[2/6] Docker 설치 중..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker 설치 완료"
else
    echo "Docker 이미 설치됨"
fi

# 3. Docker Compose 설치 확인
echo "[3/6] Docker Compose 확인 중..."
if ! docker compose version &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
fi

# 4. 프로젝트 디렉토리 설정
echo "[4/6] 프로젝트 설정 중..."
PROJECT_DIR="/home/pi/mettaton"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "프로젝트를 $PROJECT_DIR 에 클론하세요"
    echo "git clone https://github.com/arslanRedemar/mettaton.git $PROJECT_DIR"
fi

# 5. 환경변수 파일 생성
echo "[5/6] 환경변수 설정..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cat > "$PROJECT_DIR/.env" << 'EOF'
TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
GREETING_CHANEL_ID=your_greeting_channel_id
EOF
    echo ".env 파일이 생성되었습니다. 값을 수정하세요:"
    echo "  nano $PROJECT_DIR/.env"
fi

# 6. systemd 서비스 등록
echo "[6/6] 부팅 시 자동 실행 설정..."
sudo cp "$PROJECT_DIR/scripts/mettaton.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable mettaton.service

echo ""
echo "=========================================="
echo "  설치 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "1. .env 파일 수정: nano $PROJECT_DIR/.env"
echo "2. 재부팅하거나 서비스 시작: sudo systemctl start mettaton"
echo "3. 로그 확인: docker logs -f mettaton-bot"
echo ""
echo "* Docker 그룹 적용을 위해 재부팅을 권장합니다: sudo reboot"

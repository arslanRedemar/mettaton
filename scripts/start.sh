#!/bin/bash

# 수동 시작 스크립트
cd /home/pi/mettaton
docker compose up -d --build
echo "Mettaton bot started!"
docker logs -f mettaton-bot

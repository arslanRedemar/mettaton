#!/bin/bash

# Mettaton Discord Bot - Manual Stop Script

echo "Stopping Mettaton bot..."

if sudo systemctl is-active --quiet mettaton; then
    sudo systemctl stop mettaton
    echo "Mettaton bot stopped (via systemd)."
else
    PID=$(pgrep -f "node src/index.js")
    if [ -n "$PID" ]; then
        kill "$PID"
        echo "Mettaton bot stopped (PID: $PID)."
    else
        echo "Mettaton bot is not running."
    fi
fi

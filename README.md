# Mettaton

Raspberry Pi 3B+에서 동작하는 Discord 서버 관리 봇.

## Tech Stack

- **Runtime**: Node.js LTS (Alpine)
- **Framework**: discord.js v14
- **Database**: better-sqlite3 (SQLite, WAL mode)
- **Tools**: puppeteer-core, axios, node-cron
- **Test**: Jest
- **Infra**: Docker, Docker Compose, systemd

## Features

| Category | Commands |
|----------|----------|
| Schedule | `/schedule register`, `/schedule delete`, `/schedule list` |
| Question | `/question register`, `/question delete`, `/question list`, `/question answer` |
| Meeting | `/meeting config` |
| Points | `/point myPoints`, `/point ranking`, `/point config` |
| Inactive | `/inactive list`, `/inactive kick`, `/inactive config`, `/inactive configView` |
| Admin | `/string config`, `/sync sync` |

Event handlers: `guildMemberAdd`, `messageCreate`, `messageDelete`, `messageReactionAdd`, `messageReactionRemove`

---

## Prerequisites

- Raspberry Pi 3B+ (Raspbian OS)
- Git
- Internet connection
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))

---

## 1. Initial Setup

### 1-1. Clone the repository

```bash
git clone https://github.com/arslanRedemar/mettaton.git /home/pi/mettaton
cd /home/pi/mettaton
```

### 1-2. Run the setup script

```bash
bash scripts/setup.sh
```

This script performs the following 10 steps automatically:

| Step | Action |
|------|--------|
| 1 | System update (`apt-get update && upgrade`) |
| 2 | Docker installation |
| 3 | Docker Compose verification |
| 4 | Project directory setup |
| 5 | Data directories creation (`data/`, `moon_calendars/`) |
| 6 | `.env` template generation |
| 7 | Bot systemd service registration (`mettaton.service`) |
| 8 | Backup and log directories creation (`backups/`, `logs/`) |
| 9 | Git config for auto-updates + `update.sh` permission |
| 10 | Auto-update timer registration and activation |

### 1-3. Configure environment variables

```bash
nano /home/pi/mettaton/.env
```

```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
GREETING_CHANNEL_ID=your_greeting_channel_id
SCHEDULE_CHANNEL_ID=your_schedule_channel_id
QUESTION_CHANNEL_ID=your_question_channel_id
PRACTICE_CHANNEL_ID=your_practice_channel_id
DB_PATH=/app/data/mettaton.db
```

| Variable | Description |
|----------|-------------|
| `TOKEN` | Discord bot token |
| `CLIENT_ID` | Discord application client ID |
| `GUILD_ID` | Target Discord server ID |
| `GREETING_CHANNEL_ID` | Channel for welcome messages |
| `SCHEDULE_CHANNEL_ID` | Channel for schedule announcements |
| `QUESTION_CHANNEL_ID` | Channel for Q&A |
| `PRACTICE_CHANNEL_ID` | Channel for practice sessions |
| `DB_PATH` | SQLite DB path inside container |

### 1-4. Start the bot

```bash
sudo reboot
```

After reboot, the bot starts automatically via systemd. Alternatively:

```bash
sudo systemctl start mettaton
```

### 1-5. Verify

```bash
# Check container status
docker ps

# View bot logs
docker logs -f mettaton-bot

# Check auto-update timer
systemctl status mettaton-update.timer
```

---

## 2. CI/CD Pipeline

### Architecture

```
GitHub (main branch)
  |
  +-- GitHub Actions -----> Test + Docker build verification
  |                         (runs on GitHub servers)
  |
  +-- Raspberry Pi (polls every 5 min)
       +-- systemd timer --> update.sh
            +-- git fetch & detect changes
            +-- backup DB + data
            +-- git pull + docker compose rebuild
            +-- health check (60s)
            +-- rollback on failure
            +-- cleanup old images
```

### How Auto-Update Works

The systemd timer (`mettaton-update.timer`) triggers `update.sh` every 5 minutes:

1. **Change detection**: `git fetch origin main` + compare local/remote HEAD
2. **Backup**: Copy `data/` and `moon_calendars/` to `backups/backup_<timestamp>_<commit>/`
3. **Deploy**: `git pull` + `docker compose down` + `docker compose up -d --build`
4. **Health check**: Verify container is running with no crash loops (6 retries, 10s interval)
5. **On failure**: Automatic rollback (restore code via `git reset --hard` + restore data from backup)
6. **Cleanup**: Rotate backups (keep last 5), prune unused Docker images

### GitHub Actions CI

On every push to `main` or PR targeting `main`, GitHub Actions runs:

1. **Test job**: Install dependencies, run Jest unit tests, run shell script tests
2. **Docker build job**: Verify `Dockerfile` builds successfully (runs only after tests pass)

---

## 3. Manual Operations

### Start / Stop

```bash
# Start
bash /home/pi/mettaton/scripts/start.sh

# Stop
bash /home/pi/mettaton/scripts/stop.sh
```

### Force Deploy

Skip the change-detection check and deploy immediately:

```bash
bash /home/pi/mettaton/scripts/update.sh --force --verbose
```

| Flag | Description |
|------|-------------|
| `--force` | Skip new-commit check, deploy immediately |
| `--verbose` | Print detailed output to stdout |
| `--help` | Show usage |

### View Deploy Logs

```bash
tail -f /home/pi/mettaton/logs/deploy.log
```

Example log output:

```
[2026-01-31 14:00:02] [INFO] ========== Update check started ==========
[2026-01-31 14:00:03] [INFO] Checking for updates on main...
[2026-01-31 14:00:04] [INFO] Update available: a1b2c3d4 -> e5f6g7h8
[2026-01-31 14:00:04] [INFO] Creating backup: backup_20260131_140004_a1b2c3d
[2026-01-31 14:00:05] [INFO] Pulling latest code...
[2026-01-31 14:00:06] [INFO] Code updated to: e5f6g7h
[2026-01-31 14:00:06] [INFO] Stopping current container...
[2026-01-31 14:00:08] [INFO] Building and starting container...
[2026-01-31 14:00:45] [INFO] Container healthy. No restarts detected.
[2026-01-31 14:00:45] [INFO] Deployment successful! (e5f6g7h)
[2026-01-31 14:00:46] [INFO] ========== Update check finished ==========
```

### Check systemd Services

```bash
# Bot service status
systemctl status mettaton

# Auto-update timer status
systemctl status mettaton-update.timer

# Auto-update service logs (journalctl)
journalctl -u mettaton-update.service --no-pager -n 20

# Disable auto-updates
sudo systemctl stop mettaton-update.timer
sudo systemctl disable mettaton-update.timer

# Re-enable auto-updates
sudo systemctl enable mettaton-update.timer
sudo systemctl start mettaton-update.timer
```

### Manage Backups

```bash
# List backups
ls -lt /home/pi/mettaton/backups/

# Manual backup restore
cp -a /home/pi/mettaton/backups/backup_20260131_140004_a1b2c3d/data/ /home/pi/mettaton/data/
```

Backups are automatically rotated to keep the last 5.

---

## 4. Project Structure

```
scripts/
  setup.sh                    # Initial Pi setup (10 steps)
  start.sh                    # Manual start
  stop.sh                     # Manual stop
  update.sh                   # Auto-update with backup & rollback
  mettaton.service             # systemd: bot auto-start on boot
  mettaton-update.service      # systemd: update script wrapper
  mettaton-update.timer        # systemd: 5-min polling timer

.github/workflows/
  ci.yml                      # GitHub Actions: test + Docker build

core/
  config/                     # Environment config
  di/                         # Dependency injection
  errors/                     # Custom errors
  types/                      # Type definitions
  utils/                      # Utilities

src/
  data/
    datasource/               # DB + Discord client init
    mappers/                  # Entity <-> Model mappers
    models/                   # DB schemas
    repositories/             # Repository implementations
  domain/
    entities/                 # Business entities
    repositories/             # Repository interfaces
    usecases/                 # Business logic services
  presentation/
    controllers/              # Slash command handlers
    dto/                      # Data transfer objects
    interfaces/               # Discord event handlers
    views/                    # Response formatters

tests/
  unit/                       # Jest unit tests
  integration/                # Shell script tests
```

---

## 5. Development

### Run Tests

```bash
# Unit tests
npm test

# Shell script tests
bash tests/integration/scripts/run_all_tests.sh

# All tests
npm run test:all

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Local Development (without Docker)

```bash
npm install
cp .env.example .env
# Edit .env with your values
npm start
```

---

## 6. Data Persistence

The following data survives deployments through Docker volume mounts:

| Host Path | Container Path | Content |
|-----------|---------------|---------|
| `./data/` | `/app/data/` | SQLite database (`mettaton.db`) |
| `./moon_calendars/` | `/app/moon_calendars/` | Calendar image files |

The database uses WAL mode and contains 11 tables including `questions`, `settings`, `meeting_config`, `bot_strings`, `member_activity`, `activity_points`, and more.

---

## 7. Raspberry Pi Protections

| Protection | Mechanism |
|------------|-----------|
| CPU priority | `Nice=19` (lowest) on update service |
| I/O priority | `IOSchedulingClass=idle` on update service |
| Memory limit | `MemoryMax=256M` on update service |
| SD card wear | `RandomizedDelaySec=30s` on timer |
| Disk space | `docker image prune` after each deploy |
| Backup limit | Keep last 5, auto-rotate older ones |
| Concurrent run | Lock file prevents overlapping updates |

---

## Troubleshooting

**Bot not starting after reboot**
```bash
systemctl status mettaton
docker logs mettaton-bot
```

**Auto-update not working**
```bash
systemctl status mettaton-update.timer
tail -20 /home/pi/mettaton/logs/deploy.log
```

**Container crash loop**
```bash
docker inspect --format='{{.RestartCount}}' mettaton-bot
docker logs --tail 50 mettaton-bot
```

**Manual rollback**
```bash
cd /home/pi/mettaton
ls backups/                           # Find a backup
docker compose down
git reset --hard <commit_hash>
cp -a backups/<backup_name>/data/ data/
docker compose up -d --build
```

**Disk space full**
```bash
docker system prune -a
ls -lh backups/
```

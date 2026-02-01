# Mettaton

Raspberry Pi 3B+에서 동작하는 Discord 서버 관리 봇

## 기술 스택

- **런타임**: Node.js 20.x LTS
- **프레임워크**: discord.js v14
- **데이터베이스**: better-sqlite3 (SQLite, WAL mode)
- **도구**: puppeteer-core, axios, node-cron
- **테스트**: Jest
- **인프라**: systemd (Bare-metal, Docker 미사용)

## 기능

| 카테고리 | 명령어 |
|----------|--------|
| 스케줄 | `/schedule register`, `/schedule delete`, `/schedule list` |
| 질문 | `/question register`, `/question delete`, `/question list`, `/question answer` |
| 회의 | `/meeting config` |
| 포인트 | `/point myPoints`, `/point ranking`, `/point config` |
| 비활성 관리 | `/inactive list`, `/inactive kick`, `/inactive config`, `/inactive configView` |
| 관리자 | `/string config`, `/sync sync` |

이벤트 핸들러: `guildMemberAdd`, `messageCreate`, `messageDelete`, `messageReactionAdd`, `messageReactionRemove`

---

## 사전 요구사항

- Raspberry Pi 3B+ (Raspbian OS)
- Git
- 인터넷 연결
- Discord 봇 토큰 ([Discord Developer Portal](https://discord.com/developers/applications))

---

## 1. 초기 설치

### 1-1. 프로젝트 클론

```bash
git clone https://github.com/arslanRedemar/mettaton.git /home/pi/mettaton
cd /home/pi/mettaton
```

### 1-2. 설치 스크립트 실행

```bash
bash scripts/setup.sh
```

설치 스크립트가 자동으로 수행하는 작업:

| 단계 | 작업 |
|------|------|
| 1 | 시스템 업데이트 (`apt-get update && upgrade`) |
| 2 | Node.js 20.x 설치 (NodeSource 저장소) |
| 3 | 빌드 도구 설치 (python3, make, g++, build-essential) |
| 4 | Chromium 브라우저 및 한국어 폰트 설치 |
| 5 | 프로젝트 디렉터리 확인 |
| 6 | 데이터 디렉터리 생성 (`data/`, `moon_calendars/`, `backups/`, `logs/`) |
| 7 | `.env` 템플릿 생성 |
| 8 | npm 의존성 설치 (`npm ci`) |
| 9 | systemd 서비스 등록 (봇 + 자동 업데이트) |
| 10 | Git 설정 및 자동 업데이트 타이머 활성화 |

### 1-3. 환경 변수 설정

```bash
nano /home/pi/mettaton/.env
```

```env
TOKEN=디스코드_봇_토큰
CLIENT_ID=클라이언트_ID
GUILD_ID=길드_ID
GREETING_CHANNEL_ID=인사_채널_ID
SCHEDULE_CHANNEL_ID=스케줄_채널_ID
QUESTION_CHANNEL_ID=질문_채널_ID
PRACTICE_CHANNEL_ID=연습_채널_ID
DB_PATH=./data/mettaton.db
CHROMIUM_PATH=/usr/bin/chromium-browser
```

| 변수 | 설명 |
|------|------|
| `TOKEN` | Discord 봇 토큰 |
| `CLIENT_ID` | Discord 애플리케이션 클라이언트 ID |
| `GUILD_ID` | 대상 Discord 서버 ID |
| `GREETING_CHANNEL_ID` | 환영 메시지 채널 |
| `SCHEDULE_CHANNEL_ID` | 스케줄 알림 채널 |
| `QUESTION_CHANNEL_ID` | Q&A 채널 |
| `PRACTICE_CHANNEL_ID` | 연습 세션 채널 |
| `DB_PATH` | SQLite 데이터베이스 경로 |
| `CHROMIUM_PATH` | Chromium 브라우저 실행 경로 |

### 1-4. 봇 실행

```bash
sudo reboot
```

재부팅 후 systemd가 자동으로 봇을 시작합니다. 또는 수동으로:

```bash
sudo systemctl start mettaton
```

### 1-5. 동작 확인

```bash
# 봇 서비스 상태 확인
sudo systemctl status mettaton

# 실시간 로그 확인
journalctl -u mettaton -f

# 자동 업데이트 타이머 확인
systemctl status mettaton-update.timer
```

---

## 2. CI/CD 파이프라인

### 아키텍처

```
GitHub (main 브랜치)
  |
  +-- Raspberry Pi (5분마다 폴링)
       +-- systemd 타이머 --> update.sh
            +-- git fetch로 변경 감지
            +-- DB + 데이터 백업
            +-- git pull + npm ci (의존성 변경 시)
            +-- systemctl restart로 봇 재시작
            +-- 헬스체크 (60초)
            +-- 실패 시 자동 롤백
```

### 자동 업데이트 동작 방식

systemd 타이머(`mettaton-update.timer`)가 5분마다 `update.sh`를 실행합니다:

1. **변경 감지**: `git fetch origin main` + 로컬/원격 HEAD 비교
2. **백업**: `data/`, `moon_calendars/`, `package-lock.json`을 `backups/backup_<타임스탬프>_<커밋>/`에 복사
3. **배포**: `git pull` + 의존성 변경 시 `npm ci` + `systemctl restart mettaton`
4. **헬스체크**: 서비스가 정상 실행 중인지 확인 (6회 재시도, 10초 간격)
5. **실패 시**: 자동 롤백 (`git reset --hard`로 코드 복원 + 백업에서 데이터 복원 + `npm ci` + 서비스 재시작)
6. **정리**: 백업 로테이션 (최근 5개만 유지)

---

## 3. 수동 조작

### 시작 / 중지

```bash
# systemd를 통한 시작
sudo systemctl start mettaton

# systemd를 통한 중지
sudo systemctl stop mettaton

# 재시작
sudo systemctl restart mettaton

# 수동 시작 (포그라운드, 디버깅용)
bash /home/pi/mettaton/scripts/start.sh

# 수동 중지
bash /home/pi/mettaton/scripts/stop.sh
```

### 강제 배포

변경 감지를 건너뛰고 즉시 배포:

```bash
bash /home/pi/mettaton/scripts/update.sh --force --verbose
```

| 플래그 | 설명 |
|--------|------|
| `--force` | 새 커밋 확인 건너뛰고 즉시 배포 |
| `--verbose` | 상세 출력을 stdout에 표시 |
| `--help` | 사용법 표시 |

### 배포 로그 확인

```bash
tail -f /home/pi/mettaton/logs/deploy.log
```

로그 출력 예시:

```
[2026-01-31 14:00:02] [INFO] ========== Update check started ==========
[2026-01-31 14:00:03] [INFO] Checking for updates on main...
[2026-01-31 14:00:04] [INFO] Update available: a1b2c3d4 -> e5f6g7h8
[2026-01-31 14:00:04] [INFO] Creating backup: backup_20260131_140004_a1b2c3d
[2026-01-31 14:00:05] [INFO] Pulling latest code...
[2026-01-31 14:00:06] [INFO] Code updated to: e5f6g7h
[2026-01-31 14:00:06] [INFO] Dependencies unchanged. Skipping npm ci.
[2026-01-31 14:00:07] [INFO] Restarting bot service...
[2026-01-31 14:00:17] [INFO] Bot is running. (check 1/6)
[2026-01-31 14:00:17] [INFO] Deployment successful! (e5f6g7h)
[2026-01-31 14:00:17] [INFO] ========== Update check finished ==========
```

### systemd 서비스 관리

```bash
# 봇 서비스 상태
systemctl status mettaton

# 자동 업데이트 타이머 상태
systemctl status mettaton-update.timer

# 업데이트 서비스 로그 (journalctl)
journalctl -u mettaton-update.service --no-pager -n 20

# 자동 업데이트 비활성화
sudo systemctl stop mettaton-update.timer
sudo systemctl disable mettaton-update.timer

# 자동 업데이트 다시 활성화
sudo systemctl enable mettaton-update.timer
sudo systemctl start mettaton-update.timer
```

### 백업 관리

```bash
# 백업 목록 확인
ls -lt /home/pi/mettaton/backups/

# 수동 백업 복원
cp -a /home/pi/mettaton/backups/backup_20260131_140004_a1b2c3d/data/ /home/pi/mettaton/data/
```

백업은 자동으로 로테이션되며 최근 5개만 유지됩니다.

---

## 4. 프로젝트 구조

```
scripts/
  setup.sh                    # 초기 설치 스크립트 (10단계)
  start.sh                    # 수동 시작
  stop.sh                     # 수동 중지
  update.sh                   # 자동 업데이트 (백업 + 롤백 포함)
  mettaton.service             # systemd: 부팅 시 봇 자동 시작
  mettaton-update.service      # systemd: 업데이트 스크립트 래퍼
  mettaton-update.timer        # systemd: 5분 폴링 타이머

core/
  config/                     # 환경변수 및 앱 설정
  di/                         # 의존성 주입 설정
  errors/                     # 커스텀 에러 클래스
  types/                      # 공통 타입 정의
  utils/                      # 공통 유틸리티

src/
  data/
    datasource/               # DB 연결 및 초기화
    mappers/                  # Entity <-> Model 변환
    models/                   # DB 스키마 정의
    repositories/             # Repository 구현체
  domain/
    entities/                 # 비즈니스 엔티티
    repositories/             # Repository 인터페이스 (추상)
    usecases/                 # 비즈니스 로직 서비스
  presentation/
    controllers/              # 슬래시 명령어 핸들러
    dto/                      # 데이터 전송 객체
    interfaces/               # Discord 이벤트 핸들러
    views/                    # 응답 뷰/포맷터

tests/
  unit/                       # Jest 유닛 테스트
  integration/                # 통합 테스트
```

---

## 5. 개발

### 테스트 실행

```bash
# 유닛 테스트
npm test

# 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

### 로컬 개발

```bash
npm install
# .env 파일에 환경 변수 설정
npm start
```

---

## 6. 데이터 영속성

배포 시에도 유지되는 데이터:

| 경로 | 내용 |
|------|------|
| `./data/` | SQLite 데이터베이스 (`mettaton.db`) |
| `./moon_calendars/` | 달력 이미지 파일 |

데이터베이스는 WAL 모드를 사용하며, `questions`, `settings`, `meeting_config`, `bot_strings`, `member_activity`, `activity_points` 등 테이블을 포함합니다.

---

## 7. Raspberry Pi 보호 메커니즘

| 보호 항목 | 메커니즘 |
|-----------|----------|
| CPU 우선순위 | 업데이트 서비스에 `Nice=19` (최저 우선순위) |
| I/O 우선순위 | 업데이트 서비스에 `IOSchedulingClass=idle` |
| 메모리 제한 | 봇 및 업데이트 서비스에 `MemoryMax=512M` |
| SD 카드 보호 | 타이머에 `RandomizedDelaySec=30s` |
| 백업 용량 제한 | 최근 5개만 유지, 이전 백업 자동 삭제 |
| 동시 실행 방지 | Lock 파일로 업데이트 중복 실행 차단 |
| 크래시 복구 | `Restart=on-failure`로 봇 자동 재시작 |

---

## 문제 해결

**봇이 재부팅 후 시작되지 않을 때**
```bash
sudo systemctl status mettaton
journalctl -u mettaton --no-pager -n 50
```

**자동 업데이트가 동작하지 않을 때**
```bash
systemctl status mettaton-update.timer
systemctl list-timers | grep mettaton
tail -20 /home/pi/mettaton/logs/deploy.log
```

**봇이 반복적으로 크래시할 때**
```bash
# 최근 재시작 로그 확인
journalctl -u mettaton --no-pager -n 100

# 서비스 재시작 횟수 확인
systemctl show mettaton --property=NRestarts
```

**수동 롤백**
```bash
cd /home/pi/mettaton
ls backups/                           # 백업 목록 확인
sudo systemctl stop mettaton
git reset --hard <커밋_해시>
cp -a backups/<백업_이름>/data/ data/
npm ci --only=production              # 의존성 복원
sudo systemctl start mettaton
```

**better-sqlite3 빌드 실패 시**
```bash
sudo apt-get install -y python3 make g++ build-essential
rm -rf node_modules
npm ci --only=production
```

**Chromium 경로 오류 시**
```bash
# 실제 경로 확인
which chromium-browser || which chromium
# .env 파일의 CHROMIUM_PATH를 위 결과로 수정
```

**디스크 용량 부족 시**
```bash
# 백업 확인 및 수동 정리
ls -lh backups/
rm -rf backups/backup_오래된_백업/

# npm 캐시 정리
npm cache clean --force
```

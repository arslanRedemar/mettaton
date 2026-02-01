# Feature Form: Activity Points

## Feature Name
Activity Points (활동 포인트) - Differentiated Point System

## Feature Description
서버 내 사용자의 활동을 유형별로 추적하여 차등 포인트를 자동 적립하는 기능.
7가지 활동 유형(포럼 글쓰기, 질문 답변, 수행모임 참여, 개인수행, 일반활동, 퀴즈 참가, 퀴즈 정답)에 따라 서로 다른 포인트와 독립적인 쿨다운이 적용된다.
관리자는 유형별 포인트/쿨다운/일일한도를 설정할 수 있으며, 사용자는 자신의 포인트 적립 내역을 활동 유형별 파이차트로 확인할 수 있다.

## Activity Types

| Activity Type | Key | Default Points | Default Cooldown | Daily Cap | Trigger |
|---|---|---|---|---|---|
| 포럼 글쓰기 | `FORUM_POST` | 300 | 5min | - | GuildForum 채널 스레드 메시지 자동감지 |
| 질문 답변 | `QUESTION_ANSWER` | 300 | 5min | - | `/질문답변` 명령어 실행 시 |
| 수행모임 참여 | `MEETING_ATTEND` | 250 | 5min | - | 수행모임 공지 ✅ 리액션 |
| 개인수행 | `PERSONAL_PRACTICE` | 150 | 1440min (24h) | 1 | 개인수행 체크인 (리액션 또는 `/개인수행 체크`) |
| 일반활동 | `GENERAL` | 50 | 5min | - | 메시지 전송, 리액션 추가 |
| 퀴즈 참가 | `QUIZ_PARTICIPATE` | 150 | - | 1 | 일일 퀴즈 답변 제출 (해설 공개 시 지급) |
| 퀴즈 정답 | `QUIZ_CORRECT` | 200 | - | 1 | 일일 퀴즈 정답 (해설 공개 시 지급, 참가 포인트 대체) |

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE (Auto) | - | 활동 유형별 자동 포인트 적립 (유형별 독립 쿨다운) | All Users |
| READ | `/포인트` | 본인의 현재 총 포인트 조회 (ephemeral) | All Users |
| READ | `/포인트내역` | 본인의 활동 유형별 포인트 적립 내역을 파이차트로 조회 (ephemeral) | All Users |
| READ | `/포인트랭킹` | 전체 사용자 포인트 랭킹 조회 | Admin |
| UPDATE | `/포인트설정 조정` | 특정 사용자의 총 포인트 수동 설정 | Admin |
| UPDATE | `/포인트설정 설정` | 전역 적립 포인트량 및 쿨다운 설정 (레거시) | Admin |
| UPDATE | `/포인트설정 확인` | 전역 포인트 설정 확인 (레거시) | Admin |
| UPDATE | `/포인트설정 활동설정` | 활동 유형별 포인트/쿨다운/일일한도 설정 | Admin |
| UPDATE | `/포인트설정 활동확인` | 활동 유형별 포인트 설정 목록 확인 | Admin |
| DELETE | `/포인트설정 초기화` | 전체 또는 특정 사용자 포인트 + 적립 이력 초기화 | Admin |

## Database Tables

### activity_points (기존)
| Column | Type | Description |
|--------|------|-------------|
| user_id | TEXT PK | Discord user ID |
| points | INTEGER | 총 누적 포인트 |
| last_accumulated_at | DATETIME | 마지막 적립 시각 |
| updated_at | DATETIME | 갱신 시각 |

### activity_type_config
| Column | Type | Description |
|--------|------|-------------|
| activity_type | TEXT PK | 활동 유형 키 (FORUM_POST 등) |
| points | INTEGER | 적립 포인트 |
| cooldown_minutes | INTEGER | 쿨다운(분) |
| daily_cap | INTEGER NULL | 일일 한도 (NULL=무제한) |
| enabled | INTEGER | 활성화 여부 (0/1) |
| updated_at | DATETIME | 갱신 시각 |

### point_accumulation_log
| Column | Type | Description |
|--------|------|-------------|
| user_id | TEXT | Discord user ID |
| activity_type | TEXT | 활동 유형 키 |
| last_accumulated_at | DATETIME | 마지막 적립 시각 (쿨다운 계산용) |
| daily_count | INTEGER | 오늘 적립 횟수 |
| daily_date | TEXT | 카운트 기준일 (YYYY-MM-DD) |
| PK | (user_id, activity_type) | 복합 키 |

### point_award_history (NEW)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK AUTOINCREMENT | 이력 ID |
| user_id | TEXT NOT NULL | Discord user ID |
| activity_type | TEXT NOT NULL | 활동 유형 키 |
| points_awarded | INTEGER NOT NULL | 적립된 포인트 |
| awarded_at | DATETIME DEFAULT CURRENT_TIMESTAMP | 적립 시각 |

### point_config (레거시)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK CHECK(id=1) | 싱글턴 |
| points_per_action | INTEGER | 활동당 포인트 (기본 100) |
| cooldown_minutes | INTEGER | 쿨다운(분, 기본 5) |
| updated_at | DATETIME | 갱신 시각 |

## Interface Strings

### Point Accumulation (Auto)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (auto) | (알림 없음, 자동 적립) | - | N/A |
| (cooldown) | (알림 없음, 쿨다운 시 무시) | - | N/A |
| (daily_cap) | (알림 없음, 일일한도 도달 시 무시) | - | N/A |

### READ - My Points (`/포인트`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.myPoints` | `현재 포인트: {points}P` | points | Yes |
| `point.noPoints` | `적립된 포인트가 없습니다.` | - | Yes |

### READ - Point History (`/포인트내역`) - NEW
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.historyTitle` | `📊 {user}님의 활동별 포인트 내역` | user | Yes |
| `point.historyEmpty` | `적립된 포인트 내역이 없습니다.` | - | Yes |
| `point.historyTotal` | `총 {total}P 적립` | total | Yes |
| `point.historyPeriod` | `기간: {startDate} ~ {endDate}` | startDate, endDate | Yes |
| `point.historyItem` | `{type}: {points}P ({percentage}%)` | type, points, percentage | Yes |

### READ - Ranking (`/포인트랭킹`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.rankingTitle` | `포인트 랭킹` | - | Yes |
| `point.rankingItem` | `{rank}. <@{memberId}> - {points}P` | rank, memberId, points | Yes |
| `point.rankingEmpty` | `등록된 포인트가 없습니다.` | - | Yes |

### UPDATE - Adjust (`/포인트설정 조정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.setSuccess` | `<@{memberId}>님의 포인트가 {newPoints}P로 설정되었습니다.` | memberId, newPoints | Yes |
| `point.adjustSuccess` | `<@{memberId}>님의 포인트가 {amount}P 조정되어 {newPoints}P가 되었습니다.` | memberId, amount, newPoints | Yes |
| `point.userNotFound` | `<@{memberId}> 사용자를 찾을 수 없습니다.` | memberId | Yes |

### UPDATE - Config (`/포인트설정 설정`, 레거시)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.configSaved` | `포인트 설정 완료 (적립: {pointsPerAction}P, 쿨다운: {cooldownMinutes}분)` | pointsPerAction, cooldownMinutes | Yes |
| `point.configDisplay` | `현재 설정 - 적립: {pointsPerAction}P, 쿨다운: {cooldownMinutes}분` | pointsPerAction, cooldownMinutes | Yes |

### UPDATE - Activity Config (`/포인트설정 활동설정`, `/포인트설정 활동확인`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (inline) | `✅ **{유형}** 설정 완료\n포인트: {pts} \| 쿨다운: {cd}분` | - | No (inline) |
| (inline) | `📋 **활동 유형별 포인트 설정**\n{lines}` | - | No (inline) |

### DELETE - Reset (`/포인트설정 초기화`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.resetUserConfirm` | `<@{memberId}>님의 포인트를 초기화합니다. 계속하시겠습니까?` | memberId | Yes |
| `point.resetUserSuccess` | `<@{memberId}>님의 포인트가 초기화되었습니다.` | memberId | Yes |
| `point.resetAllConfirm` | `전체 사용자의 포인트를 초기화합니다. 계속하시겠습니까?` | - | Yes |
| `point.resetAllSuccess` | `전체 포인트가 초기화되었습니다.` | - | Yes |
| `point.resetCancelled` | `초기화가 취소되었습니다.` | - | Yes |
| `point.resetTimeout` | `초기화 요청이 시간 초과되었습니다.` | - | Yes |

## `/포인트내역` Command Detail

### Command Options
| Option | Type | Description | Required |
|--------|------|-------------|----------|
| 시작일 | String | 조회 시작일 (YYYY-MM-DD) | No |
| 종료일 | String | 조회 종료일 (YYYY-MM-DD) | No |

- 시작일/종료일 미지정 시: 전체 누적 내역 표시
- 시작일/종료일 지정 시: 해당 기간 내 적립 내역만 표시

### Pie Chart Visualization
- Puppeteer 기반 HTML -> PNG 렌더링 (PersonalPracticeGraphRenderer와 동일 방식)
- 활동 유형별 색상 구분:
  - FORUM_POST: #4CAF50 (Green)
  - QUESTION_ANSWER: #2196F3 (Blue)
  - MEETING_ATTEND: #FF9800 (Orange)
  - PERSONAL_PRACTICE: #9C27B0 (Purple)
  - GENERAL: #607D8B (Gray)
  - QUIZ_PARTICIPATE: #E91E63 (Pink)
  - QUIZ_CORRECT: #F44336 (Red)
- 차트 옆에 범례(legend) 표시: 유형명, 포인트, 비율(%)
- 총 적립 포인트 표시
- 기간 선택 시 해당 기간 표시

### Data Flow
1. `point_award_history` 테이블에서 user_id + 기간 조건으로 조회
2. activity_type별 SUM(points_awarded) 집계
3. 파이차트 HTML 생성 -> Puppeteer 렌더링 -> PNG 버퍼
4. Discord AttachmentBuilder로 ephemeral 응답

## Permission
- `/포인트`: All Users
- `/포인트내역`: All Users
- `/포인트랭킹`: Admin only (ADMINISTRATOR)
- `/포인트설정 *`: Admin only (ADMINISTRATOR)

## Response Visibility
- `/포인트`: ephemeral
- `/포인트내역`: ephemeral
- `/포인트랭킹`: ephemeral
- `/포인트설정 *`: ephemeral

## Channel
- 실행 채널 제한 없음 (모든 응답 ephemeral)

## Business Rules

### Point Accumulation
- 활동 유형 자동감지: 포럼(GuildForum 채널 스레드), 질문답변(/질문답변 명령), 수행모임(✅ 리액션), 개인수행(체크인), 일반(메시지/리액션)
- 유형별 독립 쿨다운: GENERAL 쿨다운이 활성화되어도 FORUM_POST는 독립적으로 적립 가능
- 일일한도: PERSONAL_PRACTICE는 하루 1회 제한 (daily_date로 추적)
- 봇 메시지/리액션은 포인트 적립 대상에서 제외
- 포인트는 음수가 될 수 없음 (최소 0P)
- 모든 포인트 적립은 `point_award_history` 테이블에 이력 기록

### Point History & Pie Chart
- 사용자 본인의 활동별 포인트 내역만 조회 가능
- 전체 누적 조회 (기본) 또는 기간 지정 조회
- 파이차트로 활동 유형별 비율 시각화
- 적립 이력이 없으면 빈 메시지 표시

### Admin Operations
- 포인트 초기화 시 확인 버튼 필수 (30초 타임아웃)
- 초기화 시 activity_points + point_accumulation_log + point_award_history 모두 초기화
- 활동 유형별 설정 변경은 즉시 적용

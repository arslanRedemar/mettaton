# Feature Form: Personal Practice

## Feature Name
Personal Practice (개인 수행)

## Feature Description
사용자가 개인 수행 계획(명상, 절, 독서 등)을 수행계획방 채널에 공개적으로 등록하고, 매일 ✅ 리액션 또는 `/개인수행 체크` 슬래시 커맨드로 수행 완료를 체크하며, 등록된 계획 기간 동안의 수행 현황을 달력 스탬프 또는 GitHub 스타일 히트맵 + 달성률 프로그레스 바(Puppeteer)로 확인할 수 있는 기능. 계획 기간은 최대 1년(365일)까지 등록 가능하다.
한 사용자가 여러 개의 수행 계획을 동시에 운영할 수 있으며, 매일 목표량의 단위는 사용자가 자유롭게 지정한다(분, 회, 권 등).
수행 완료는 단순 완료/미완료 방식(✅ 리액션 또는 `/개인수행 체크` 커맨드)으로 기록한다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE | `/개인수행 등록` | 개인 수행 계획 등록 (Public Embed → 수행계획방 채널) | All Users |
| READ | `/개인수행 확인` | 수행 현황 달력 스탬프 + 달성률 조회 (Ephemeral) | All Users |
| UPDATE | `/개인수행 수정` | 등록된 수행 계획 수정 (Public Embed 업데이트) | All Users (본인만) |
| DELETE | `/개인수행 삭제` | 등록된 수행 계획 삭제 (메시지 삭제) | All Users (본인만) |
| ACTION | `/개인수행 체크` | 오늘의 수행 완료 체크 (record 추가 + Embed 업데이트) | All Users (본인만) |

## Interface Strings

### CREATE - Register (`/개인수행 등록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `personalPractice.registerSuccess` | `✅ 개인 수행 계획이 등록되었습니다. (ID: {planId})` | planId | Yes |
| `personalPractice.embedTitle` | `📝 개인 수행 계획` | - | Yes |
| `personalPractice.embedDescription` | `수행자: {user}\n수행 내용: {content}\n매일 목표: {dailyGoal}{unit}\n기간: {startDate} ~ {endDate}\n진행률: {completed}/{totalDays}일 ({percentage}%)` | user, content, dailyGoal, unit, startDate, endDate, completed, totalDays, percentage | Yes |
| `personalPractice.embedFooter` | `✅ 리액션 또는 /개인수행 체크 로 오늘의 수행을 기록하세요!` | - | Yes |
| `personalPractice.invalidDateFormat` | `❌ 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)` | - | Yes |
| `personalPractice.endBeforeStart` | `❌ 종료일은 시작일 이후여야 합니다.` | - | Yes |
| `personalPractice.startInPast` | `❌ 시작일은 오늘 이후여야 합니다.` | - | Yes |
| `personalPractice.exceedsMaxDuration` | `❌ 계획 기간은 최대 1년(365일)까지 등록 가능합니다.` | - | Yes |

### READ - View (`/개인수행 확인`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `personalPractice.graphTitle` | `📊 {user}님의 '{content}' 수행 현황` | user, content | Yes |
| `personalPractice.graphProgress` | `전체 진행률: {completed}/{totalDays}일 ({percentage}%)` | completed, totalDays, percentage | Yes |
| `personalPractice.graphError` | `❌ 그래프 생성 중 오류가 발생했습니다.` | - | Yes |

### UPDATE - Edit (`/개인수행 수정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `personalPractice.editSuccess` | `✅ 수행 계획이 수정되었습니다. (ID: {planId})` | planId | Yes |

### DELETE - Delete (`/개인수행 삭제`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `personalPractice.deleteSuccess` | `✅ 수행 계획이 삭제되었습니다. (ID: {planId})` | planId | Yes |
| `personalPractice.deleteMessageFail` | `수행 계획 메시지 삭제 실패:` | - | Yes |

### ACTION - Check (`/개인수행 체크`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `personalPractice.checkSuccess` | `✅ '{content}' 오늘의 수행이 기록되었습니다! ({completed}/{totalDays}일, {percentage}%)` | content, completed, totalDays, percentage | Yes |
| `personalPractice.alreadyChecked` | `ℹ️ 오늘은 이미 '{content}' 수행 체크가 되어 있습니다.` | content | Yes |
| `personalPractice.outsidePeriod` | `❌ 오늘은 수행 계획 기간({startDate} ~ {endDate})에 포함되지 않습니다.` | startDate, endDate | Yes |

### Reaction-based Check
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (auto) | (리액션 추가/제거 시 Embed 진행률 자동 업데이트) | - | N/A |

### Common
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `personalPractice.notOwner` | `❌ 본인의 수행 계획만 수정/삭제할 수 있습니다.` | - | Yes |
| `personalPractice.notFound` | `❌ 해당 수행 계획을 찾을 수 없습니다.` | - | Yes |
| `personalPractice.alreadyEnded` | `❌ 이미 종료된 수행 계획입니다.` | - | Yes |

## Permission
- `/개인수행 등록`: All Users
- `/개인수행 확인`: All Users (본인 계획만 조회)
- `/개인수행 수정`: All Users (본인 계획만 수정)
- `/개인수행 삭제`: All Users (본인 계획만 삭제)
- `/개인수행 체크`: All Users (본인 계획만 체크, 모든 채널에서 실행 가능)

## Response Visibility
- `/개인수행 등록`: ephemeral 확인 응답 + 수행계획방 채널에 Public Embed 게시
- `/개인수행 확인`: ephemeral (실행자에게만 달력 스탬프 이미지 표시)
- `/개인수행 수정`: ephemeral 확인 응답 + 수행계획방 채널 Public Embed 업데이트
- `/개인수행 삭제`: ephemeral 확인 응답 + 수행계획방 채널 Public Embed 삭제
- `/개인수행 체크`: ephemeral 확인 응답 + 수행계획방 채널 Public Embed 진행률 업데이트

## Channel
- 등록/수정/삭제 명령어: 수행계획방 채널에서만 실행 가능
- 확인/체크 명령어: 모든 채널에서 실행 가능 (ephemeral)
- Embed 메시지: 수행계획방 채널에 게시

## Cross-Feature Integration

### Activity Points (PERSONAL_PRACTICE)
- ✅ 리액션 또는 `/개인수행 체크` 실행 시 `PERSONAL_PRACTICE` 활동 포인트 자동 적립 (기본 150P)
- `PointAccumulationService.tryAccumulate(userId, ActivityType.PERSONAL_PRACTICE)` 호출
- 두 가지 진입점:
  1. messageReactionAdd.js - ✅ 리액션으로 수행 체크 시
  2. personal-practice/index.js - `/개인수행 체크` 슬래시 커맨드 실행 시
- 쿨다운: 1440분 (24시간), 일일한도: 1회
- 상세 설정은 [ACTIVITY_POINTS.md](./ACTIVITY_POINTS.md) 참조

## Business Rules
- 한 사용자가 여러 개의 수행 계획을 동시 등록 가능
- 날짜 형식: YYYY-MM-DD (정규식 검증)
- 매일 목표량: 정수 + 사용자 지정 단위 (분, 회, 권, 시간 등)
- 등록된 계획은 수행계획방 채널에 Embed 메시지로 게시
- Embed 메시지에 ✅ 리액션 자동 추가
- ✅ 리액션 추가 시 당일 수행 완료로 기록 (하루 1회, 중복 방지)
- ✅ 리액션 제거 시 당일 수행 기록 취소
- `/개인수행 체크` 실행 시 당일 수행 완료로 기록 (리액션과 동일 로직, 모든 채널에서 가능)
- `/개인수행 체크` 시 이미 오늘 체크된 경우 `alreadyChecked` 메시지 반환
- `/개인수행 체크` 시 오늘이 계획 기간 밖이면 `outsidePeriod` 메시지 반환
- `/개인수행 체크` autocomplete에서 활성 계획(종료되지 않은 계획)만 표시
- 리액션/체크 시 Embed 메시지의 진행률 실시간 업데이트
- 계획 기간이 종료된 메시지의 리액션은 무시
- 수정 시 start_date는 변경 불가 (기록 무결성 유지)
- 계획 기간이 종료되어도 DB에서 자동 삭제하지 않음 (그래프 조회 가능)
- autocomplete에서 본인의 계획 목록을 표시 (format: `#{id} {content} ({startDate}~{endDate})`)
- 리액션 체크 시 해당 메시지가 수행 계획 메시지인지 DB로 검증
- 계획 기간 상한: 최대 1년(365일), 초과 시 등록/수정 거부
- 현황 이미지 생성: Puppeteer로 렌더링 → PNG Buffer → Discord Attachment
- 렌더링 모드 자동 선택: 기간에 따라 두 가지 레이아웃 사용
- **[모드 A] 달력 스탬프** (7개월 미만): 월별 그리드 (일~토 7열), 2열 가로 배치, 동적 높이
- 달력 셀 표시: 완료일 = 초록 스탬프(#4CAF50, ✅), 미완료일 = 회색(#E0E0E0), 오늘 = 파랑 테두리(#2196F3), 범위 밖 = 빈 셀
- **[모드 B] GitHub 히트맵** (7개월 이상): 가로 주(week) 단위 그리드, 세로 7행(일~토), 가로로 주가 나열
- 히트맵 셀: 완료일 = 초록(#4CAF50), 미완료일 = 연회색(#EBEDF0), 오늘 = 파랑 테두리(#2196F3), 범위 밖 = 투명
- 히트맵 상단에 월 라벨 표시 (1월, 2월, ...), 좌측에 요일 라벨 (월, 수, 금)
- 히트맵 이미지 크기: 800 x 200px, PNG 형식
- 프로그레스 바 (공통): 달력/히트맵 우측에 세로 막대 1개로 달성률 표시 (예: 76% 완료, 초록 채움 + 회색 잔여)
- 프로그레스 바 라벨: `{completed}/{totalDays}일 ({percentage}%)` 형식
- 달력 모드 이미지 크기: 800 x 동적 높이px, PNG 형식 (달력 영역 + 프로그레스 바 영역)
- DB 테이블: personal_practice_plans (계획), personal_practice_records (일별 수행 기록)
- 모든 동작은 로그 기록 필수 (`[personal-practice/{action}]` 형식)

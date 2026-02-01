# Feature Form: Meeting Scheduler

## Feature Name
Meeting Scheduler (수행 모임 스케줄러)

## Feature Description
지정된 시간에 자동으로 수행 모임 알림을 게시하는 기능.
관리자가 알림 채널, 시간, 장소, 활동 내용을 설정하면 매일 지정된 시간에 자동으로 모임 안내 메시지가 게시된다.
참석자는 리액션(✅/❌)으로 참석 여부를 표시하며, 6시간 후 자동으로 완료 처리된다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE | `/수행설정 설정` | 수행 모임 알림 설정 (채널, 알림시, 알림분, 시작시각, 종료시각, 장소, 활동내용) | Admin |
| READ | `/수행설정 확인` | 현재 수행 모임 설정 확인 | Admin |
| UPDATE | `/수행설정 활성화` | 수행 모임 알림 활성화 | Admin |
| UPDATE | `/수행설정 비활성화` | 수행 모임 알림 비활성화 | Admin |
| DELETE | - | 해당 없음 (비활성화로 대체) | - |

## Interface Strings

### CREATE/UPDATE - Config (`/수행설정 설정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `meeting.invalidTimeFormat` | `❌ 시간 형식이 올바르지 않습니다. (예: 23:00)` | - | Yes |
| `meeting.configSaved` | `✅ 수행 모임 설정이 저장되었습니다.\n\n📢 알림 채널: <#{channel}>\n⏰ 알림 시각: {scheduleTime}\n🕐 모임 시각: {startTime} ~ {endTime}\n📍 장소: {location}\n📝 활동 내용: {activity}\n상태: {status}` | channel, scheduleTime, startTime, endTime, location, activity, status | Yes |

### READ - View Config (`/수행설정 확인`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `meeting.noConfigView` | `❌ 설정된 수행 모임이 없습니다. /수행설정 설정 명령어로 설정해주세요.` | - | Yes |
| `meeting.configDisplay` | `📋 **현재 수행 모임 설정**\n\n📢 알림 채널: <#{channel}>\n⏰ 알림 시각: {scheduleTime}\n🕐 모임 시각: {startTime} ~ {endTime}\n📍 장소: {location}\n📝 활동 내용: {activity}\n상태: {status}` | channel, scheduleTime, startTime, endTime, location, activity, status | Yes |

### UPDATE - Enable (`/수행설정 활성화`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `meeting.noConfig` | `❌ 먼저 /수행설정 설정 명령어로 설정을 완료해주세요.` | - | Yes |
| `meeting.enableSuccess` | `✅ 수행 모임 알림이 활성화되었습니다.` | - | Yes |

### UPDATE - Disable (`/수행설정 비활성화`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `meeting.noConfigExists` | `❌ 설정된 수행 모임이 없습니다.` | - | Yes |
| `meeting.disableSuccess` | `⏸️ 수행 모임 알림이 비활성화되었습니다.` | - | Yes |

### Common
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `meeting.statusEnabled` | `✅ 활성화` | - | Yes |
| `meeting.statusDisabled` | `⏸️ 비활성화` | - | Yes |

## Permission
- `/수행설정 *`: Admin only (ADMINISTRATOR)

## Response Visibility
- `/수행설정 설정`: ephemeral (실행자에게만 표시)
- `/수행설정 활성화`: ephemeral (실행자에게만 표시)
- `/수행설정 비활성화`: ephemeral (실행자에게만 표시)
- `/수행설정 확인`: ephemeral (실행자에게만 표시)
- 모임 알림 메시지: public (모든 사용자에게 표시)

## Channel
- 슬래시 명령어: 실행 채널 제한 없음 (ephemeral 응답)
- 모임 알림 게시: 관리자가 설정한 알림 채널 (channelId)

## Cross-Feature Integration

### Activity Points (MEETING_ATTEND)
- ✅ 리액션으로 참석 표시 시 `MEETING_ATTEND` 활동 포인트 자동 적립 (기본 250P)
- `PointAccumulationService.tryAccumulate(userId, ActivityType.MEETING_ATTEND)` 호출
- SchedulerService의 리액션 수집기(ReactionCollector) 내에서 트리거
- 유형별 독립 쿨다운 적용 (기본 5분)
- 상세 설정은 [ACTIVITY_POINTS.md](./ACTIVITY_POINTS.md) 참조

## Business Rules
- node-schedule 라이브러리로 cron job 스케줄링
- 타임존: Asia/Seoul (한국 시간)
- 알림 시간: 시(0-23), 분(0-59) 정수로 설정
- 모임 시작/종료 시각: HH:MM 형식 검증 (정규식)
- 모임 안내 메시지에 ✅(참석), ❌(불참석) 리액션 자동 추가
- 리액션 수집 시간: 6시간 (6 * 60 * 60 * 1000ms)
- ✅ 리액션 시 참석자 추가, ❌ 리액션 시 참석자 제거
- ✅ 리액션 해제 시 참석자 제거
- 수집 종료 시 메시지에 [완료] 표시
- 모임 횟수(meeting_count) 자동 증가
- 설정 변경 시 활성화 상태면 스케줄 자동 재설정
- 비활성화 시 현재 스케줄 취소
- 봇 시작 시 활성화 상태면 스케줄 자동 시작
- DB 테이블: meeting_config (설정), settings (meeting_count)

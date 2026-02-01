# Feature Form: Schedule Management

## Feature Name
Schedule Management (일정 관리)

## Feature Description
서버 내 일정(일정)을 등록, 조회, 삭제하는 기능.
관리자가 일정을 등록하면 지정된 일정 채널에 Embed 메시지가 게시되며, 사용자는 리액션(✅❌)으로 참석 의사를 표시할 수 있다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE | `/일정등록` | 새 일정 등록 (제목, 날짜, 시작, 종료, 장소, 주최자) | Admin |
| READ | `/일정목록` | 현재 등록된 일정 목록 조회 | All Users |
| UPDATE | - | 해당 없음 (참석자 수는 리액션으로 자동 갱신) | - |
| DELETE | `/일정삭제` | 일정 ID로 일정 삭제 | Admin |

## Interface Strings

### CREATE - Register (`/일정등록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `schedule.registerSuccess` | `✅ 일정이 등록되었습니다.` | - | Yes |
| `schedule.registerFail` | `❌ 일정 등록 실패:\n` | - | Yes |
| `schedule.emptyTitle` | `제목이 비어 있습니다.` | - | Yes |
| `schedule.emptyLocation` | `장소가 비어 있습니다.` | - | Yes |
| `schedule.emptyTeacher` | `주최자가 비어 있습니다.` | - | Yes |
| `schedule.invalidDate` | `날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)` | - | Yes |
| `schedule.invalidStartTime` | `시작 시간 형식이 올바르지 않습니다. (HH:mm)` | - | Yes |
| `schedule.invalidEndTime` | `종료 시간 형식이 올바르지 않습니다. (HH:mm)` | - | Yes |
| `schedule.embedTitle` | `📖 [{id}] {title}` | id, title | Yes |
| `schedule.embedDescription` | `장소: {location}\n시각: {date} {start} ~ {end}\n주최자: {teacher}\n인원: {attendeeInfo}` | location, date, start, end, teacher, attendeeInfo | Yes |

### READ - List (`/일정목록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `schedule.listEmpty` | `📭 등록된 일정이 없습니다.` | - | Yes |
| `schedule.listTitle` | `📚 현재 등록된 일정 목록` | - | Yes |
| `schedule.listFieldValue` | `날짜: {date} {start}~{end}\n장소: {location}\n주최자: {teacher}\n참석자: {attendeeInfo}` | date, start, end, location, teacher, attendeeInfo | Yes |

### DELETE - Delete (`/일정삭제`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `schedule.deleteNotFound` | `❌ 일정 ID {id}를 찾을 수 없습니다.` | id | Yes |
| `schedule.deleteSuccess` | `🗑 일정 [{title}] 삭제 완료` | title | Yes |
| `schedule.deleteMessageFail` | `일정 메시지 삭제 실패:` | - | Yes |

### Attendance (Reaction-based)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `schedule.notFound` | `❌ 해당 ID의 일정이 없습니다.` | - | Yes |
| `schedule.attendSuccess` | `✅ 일정 #{id} 참석 등록 완료` | id | Yes |
| `schedule.cancelNotAttending` | `⚠️ 당신은 이 일정에 참석 등록되어 있지 않습니다.` | - | Yes |
| `schedule.cancelSuccess` | `✅ 일정 **[{title}]** 참석이 취소되었습니다.` | title | Yes |

### Event - Message Delete
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `messageDelete.scheduleDeleted` | `일정이 관리자에 의해 삭제됨.` | - | Yes |

## Permission
- `/일정등록`, `/일정삭제`: Admin only (ADMINISTRATOR)
- `/일정목록`: All Users

## Response Visibility
- `/일정등록`: ephemeral (실행자에게만 표시)
- `/일정목록`: ephemeral (실행자에게만 표시)
- `/일정삭제`: ephemeral (실행자에게만 표시)
- 일정 채널 Embed: public (모든 사용자에게 표시)

## Channel
- 슬래시 명령어: 실행 채널 제한 없음 (ephemeral 응답)
- 일정 Embed 게시: 환경변수로 지정된 일정 채널 (config.channels.schedule)

## Business Rules
- 일정 등록 시 제목, 장소, 주최자는 필수 입력
- 날짜 형식: YYYY-MM-DD (정규식 검증)
- 시간 형식: HH:MM 24시간제 (정규식 검증)
- 등록된 일정은 지정된 일정 채널에 Embed 메시지로 게시
- 일정 안내 메시지에 ✅(참석), ❌(불참석) 리액션 자동 추가
- ✅ 리액션 시 Embed 메시지에 참석자 추가, ❌ 리액션 시 Embed 메시지에 참석자 제거
- ✅ 리액션 해제 시 Embed 메시지에 참석자 제거
- 일정 삭제 시 채널의 Embed 메시지도 함께 삭제
- 채널에서 메시지가 직접 삭제되면 DB에서도 자동 정리
- DB 테이블: schedules (일정 데이터), schedule_attendees (참석자 추적)

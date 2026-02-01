# Feature Form: Database Sync

## Feature Name
Database Sync (데이터베이스 동기화)

## Feature Description
디스코드 서버의 현재 상태와 데이터베이스를 동기화하는 기능.
회원 활동 기록, 강의 참석자, 메시지 ID 유효성을 3단계로 검증 및 정리한다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE | - | 해당 없음 | - |
| READ | `/동기화` | DB 동기화 실행 및 결과 표시 | Admin |
| UPDATE | (Auto) | 동기화 과정에서 DB 자동 갱신 | - |
| DELETE | (Auto) | 동기화 과정에서 유효하지 않은 데이터 자동 삭제 | - |

## Interface Strings

### Sync (`/동기화`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `sync.complete` | `✅ 동기화가 완료되었습니다.\n\n**회원 활동 동기화:**\n- 추가된 회원: {membersAdded}명\n- 제거된 회원: {membersRemoved}명\n\n**강의 참석자 정리:**\n- 제거된 참석 기록: {attendeesRemoved}건\n\n**메시지 ID 검증:**\n- 정리된 강의 메시지: {lectureMessagesCleaned}건\n- 정리된 질문 메시지: {questionMessagesCleaned}건` | membersAdded, membersRemoved, attendeesRemoved, lectureMessagesCleaned, questionMessagesCleaned | Yes |
| `sync.error` | `❌ 동기화 중 오류가 발생했습니다: {error}` | error | Yes |

## Permission
- `/동기화`: Admin only (ADMINISTRATOR)

## Response Visibility
- `/동기화`: ephemeral (실행자에게만 표시, deferReply 사용)

## Channel
- 실행 채널 제한 없음 (ephemeral 응답)

## Business Rules
- deferReply 사용 (비동기 처리로 인한 응답 지연 대비)
- **Phase 1: 회원 활동 동기화**
  - 서버에 있지만 DB에 없는 회원 → member_activity에 추가
  - DB에 있지만 서버에 없는 회원 → member_activity에서 제거
  - 봇 계정은 제외
- **Phase 2: 강의 참석자 정리**
  - 서버에 없는 회원의 강의 참석 기록 제거
- **Phase 3: 메시지 ID 검증**
  - 일정 채널에서 lecture의 message_id 유효성 확인 → 없으면 message_id 초기화
  - 질문 채널에서 question의 message_id 유효성 확인 → 없으면 message_id 초기화
- 각 Phase의 처리 건수를 결과로 표시
- 오류 발생 시 에러 메시지와 함께 상세 내용 표시

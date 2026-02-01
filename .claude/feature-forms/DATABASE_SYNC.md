# Feature Form: Database Sync

## Feature Name
Database Sync (데이터베이스 동기화)

## Feature Description
디스코드 서버의 현재 상태와 데이터베이스를 동기화하는 기능.
회원 활동 기록, 참석자 정리, 메시지 ID 유효성, 활동 포인트, 개인수행 데이터를 6단계로 검증 및 정리한다.
퀴즈 답변(quiz_answers)은 통계 무결성을 위해 동기화 대상에서 제외한다.

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
| `sync.complete` | `✅ 동기화가 완료되었습니다.\n\n**Phase 1 - 회원 활동 동기화:**\n- 추가된 회원: {membersAdded}명\n- 제거된 회원: {membersRemoved}명\n\n**Phase 2 - 참석자 정리:**\n- 제거된 일정 참석 기록: {lectureAttendeesRemoved}건\n- 제거된 질문 참석 기록: {questionAttendeesRemoved}건\n\n**Phase 3 - 메시지 ID 검증:**\n- 정리된 일정 메시지: {lectureMessagesCleaned}건\n- 정리된 질문 메시지: {questionMessagesCleaned}건\n- 정리된 수행계획 메시지: {practiceMessagesCleaned}건\n- 정리된 퀴즈 메시지: {quizMessagesCleaned}건\n\n**Phase 4 - 활동 포인트 정리:**\n- 제거된 포인트 기록: {pointsRemoved}건\n- 제거된 적립 로그: {accumulationLogsRemoved}건\n\n**Phase 5 - 개인수행 정리:**\n- 제거된 수행 계획: {practicesRemoved}건\n- 제거된 수행 기록: {practiceRecordsRemoved}건\n\n**Phase 6 - 퀴즈 출제 이력 정리:**\n- 정리된 고아 출제 이력: {quizHistoryCleaned}건` | membersAdded, membersRemoved, lectureAttendeesRemoved, questionAttendeesRemoved, lectureMessagesCleaned, questionMessagesCleaned, practiceMessagesCleaned, quizMessagesCleaned, pointsRemoved, accumulationLogsRemoved, practicesRemoved, practiceRecordsRemoved, quizHistoryCleaned | Yes |
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
- **Phase 2: 참석자 정리**
  - 서버에 없는 회원의 일정(lecture) 참석 기록 제거 (lecture_attendees)
  - 서버에 없는 회원의 질문(question) 참석 기록 제거 (question_attendees)
- **Phase 3: 메시지 ID 검증**
  - 일정 채널에서 lecture의 message_id 유효성 확인 → 없으면 message_id 초기화
  - 질문 채널에서 question의 message_id 유효성 확인 → 없으면 message_id 초기화
  - 수행계획방 채널에서 personal_practice_plans의 message_id 유효성 확인 → 없으면 message_id 초기화
  - 퀴즈 채널에서 quiz_publish_history의 message_id 유효성 확인 → 없으면 message_id 초기화
- **Phase 4: 활동 포인트 정리**
  - 서버에 없는 회원의 activity_points 기록 제거
  - 서버에 없는 회원의 point_accumulation_log 기록 제거
  - point_award_history는 적립 이력으로 보존 (통계 목적)
- **Phase 5: 개인수행 정리**
  - 서버에 없는 회원의 personal_practice_plans 제거
  - 해당 계획의 personal_practice_records도 함께 제거 (CASCADE 또는 명시적 삭제)
  - 삭제 대상 계획의 Embed 메시지가 남아있으면 수행계획방 채널에서 삭제 시도
- **Phase 6: 퀴즈 출제 이력 정리**
  - 삭제된 문제(quiz_questions에 존재하지 않는 question_id)를 참조하는 quiz_publish_history 기록 정리
  - quiz_answers는 통계 무결성(정답률, 참여자 수)을 위해 동기화 대상에서 제외
- 각 Phase의 처리 건수를 결과로 표시
- 오류 발생 시 에러 메시지와 함께 상세 내용 표시

## Sync Exclusions
다음 테이블은 동기화 대상에서 **의도적으로 제외**:
| Table | Reason |
|-------|--------|
| quiz_answers | 퀴즈 통계(정답률, 참여자 수)의 무결성 보존 |
| point_award_history | 포인트 적립 이력 보존 (통계/감사 목적) |
| quiz_questions | 문제 데이터는 서버 회원과 무관 (관리자 등록 콘텐츠) |
| quiz_config | 싱글턴 설정 데이터 |
| quiz_categories | 카테고리 마스터 데이터 |
| activity_type_config | 활동 유형 설정 데이터 |
| point_config | 포인트 전역 설정 데이터 |
| meeting_config | 수행 모임 설정 데이터 |
| bot_strings | 봇 문자열 설정 데이터 |
| settings | 전역 설정 데이터 |

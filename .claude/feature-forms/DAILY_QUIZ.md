# Feature Form: Daily Quiz

## Feature Name
Daily Quiz (일일 퀴즈) - CSAT-style Multiple Choice Question System

## Feature Description
관리자가 수능형 5지선다 객관식 문제를 등록하면, 매일 정해진 시간에 문제은행 채널에 자동으로 1문제씩 랜덤 출제되는 기능.
문제는 중복 없이 출제되며, 모든 문제가 소진되면 출제 이력을 초기화하고 처음부터 재출제한다.
해설은 관리자가 설정한 별도 시간에 자동 공개되며, 해설 공개 전까지만 답변 제출이 가능하다.
사용자는 슬래시 명령어로 답변을 제출하고, 마감 전까지 답변 수정이 가능하다.
참가 시 150P, 정답 시 200P의 포인트가 적립된다 (해설 공개 시점에 일괄 정산).
문제는 카테고리별로 분류할 수 있다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE | `/퀴즈등록` | 단일 문제 등록 (문제, 보기 5개, 정답, 해설, 카테고리) | Admin |
| CREATE | `/퀴즈일괄등록` | JSON 파일로 다수 문제 일괄 등록 | Admin |
| READ | `/퀴즈목록` | 등록된 문제 목록 조회 (ID, 카테고리, 출제 여부) | Admin |
| READ | `/퀴즈통계` | 문제별 정답률 및 참여 통계 조회 | Admin |
| READ | `/퀴즈현황` | 현재 출제 현황 (총 문제 수, 미출제 수, 오늘의 문제 등) | Admin |
| UPDATE | `/퀴즈수정` | 문제 ID로 문제 내용 수정 | Admin |
| UPDATE | `/퀴즈설정` | 출제 시간, 해설 공개 시간, 출제 채널, 카테고리 관리 | Admin |
| DELETE | `/퀴즈삭제` | 문제 ID로 문제 삭제 | Admin |
| DELETE | `/퀴즈초기화` | 출제 이력 초기화 (문제 데이터 유지) | Admin |
| - | `/답변` | 오늘의 문제에 답변 제출 (1~5번) | All Users |
| READ | `/내답변` | 오늘의 문제에 대한 내 답변 확인 | All Users |

## Database Tables

### quiz_questions
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK AUTOINCREMENT | 문제 ID |
| category | TEXT NOT NULL | 카테고리 (예: 국어, 수학, 영어) |
| question | TEXT NOT NULL | 문제 본문 |
| option_1 | TEXT NOT NULL | 보기 1번 |
| option_2 | TEXT NOT NULL | 보기 2번 |
| option_3 | TEXT NOT NULL | 보기 3번 |
| option_4 | TEXT NOT NULL | 보기 4번 |
| option_5 | TEXT NOT NULL | 보기 5번 |
| answer | INTEGER NOT NULL | 정답 번호 (1~5) |
| explanation | TEXT NOT NULL | 해설 |
| created_by | TEXT NOT NULL | 등록한 관리자 Discord user ID |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | 등록 시각 |

### quiz_config
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK CHECK(id=1) | 싱글턴 |
| quiz_channel_id | TEXT | 문제 출제 채널 ID |
| quiz_time | TEXT DEFAULT '09:00' | 문제 출제 시각 (HH:MM, 24h) |
| explanation_time | TEXT DEFAULT '21:00' | 해설 공개 시각 (HH:MM, 24h) |
| enabled | INTEGER DEFAULT 1 | 출제 활성화 여부 (0/1) |
| updated_at | DATETIME | 갱신 시각 |

### quiz_categories
| Column | Type | Description |
|--------|------|-------------|
| name | TEXT PK | 카테고리 이름 |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | 생성 시각 |

### quiz_publish_history
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK AUTOINCREMENT | 출제 이력 ID |
| question_id | INTEGER NOT NULL | 출제된 문제 ID (FK -> quiz_questions.id) |
| published_date | TEXT NOT NULL | 출제 날짜 (YYYY-MM-DD) |
| message_id | TEXT | 출제된 Discord 메시지 ID |
| explanation_revealed | INTEGER DEFAULT 0 | 해설 공개 여부 (0/1) |
| published_at | DATETIME DEFAULT CURRENT_TIMESTAMP | 출제 시각 |

### quiz_answers
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK AUTOINCREMENT | 답변 ID |
| question_id | INTEGER NOT NULL | 문제 ID (FK -> quiz_questions.id) |
| user_id | TEXT NOT NULL | 답변자 Discord user ID |
| selected_option | INTEGER NOT NULL | 선택한 번호 (1~5) |
| is_correct | INTEGER NOT NULL | 정답 여부 (0/1) |
| points_awarded | INTEGER DEFAULT 0 | 지급된 포인트 |
| submitted_at | DATETIME DEFAULT CURRENT_TIMESTAMP | 제출 시각 |
| updated_at | DATETIME | 수정 시각 |
| UNIQUE | (question_id, user_id) | 문제당 사용자별 1건 |

## Interface Strings

### CREATE - Register (`/퀴즈등록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.registerSuccess` | `✅ 퀴즈 #{id} 등록 완료 [{category}]` | id, category | Yes |
| `quiz.registerDuplicate` | `⚠️ 동일한 문제가 이미 존재합니다.` | - | Yes |
| `quiz.registerInvalidAnswer` | `❌ 정답 번호는 1~5 사이여야 합니다.` | - | Yes |
| `quiz.registerCategoryNotFound` | `❌ 카테고리 '{category}'가 존재하지 않습니다. /퀴즈설정 카테고리추가로 먼저 등록하세요.` | category | Yes |

### CREATE - Bulk Register (`/퀴즈일괄등록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.bulkSuccess` | `✅ {count}개의 문제가 등록되었습니다. (실패: {failCount}건)` | count, failCount | Yes |
| `quiz.bulkFormatError` | `❌ JSON 파일 형식이 올바르지 않습니다. 아래 형식을 참고하세요.` | - | Yes |
| `quiz.bulkEmpty` | `❌ 등록할 문제가 없습니다.` | - | Yes |

### READ - List (`/퀴즈목록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.listTitle` | `📋 등록된 퀴즈 목록 (총 {total}문제)` | total | Yes |
| `quiz.listItem` | `#{id} [{category}] {questionPreview} - {status}` | id, category, questionPreview, status | Yes |
| `quiz.listStatusPublished` | `출제완료` | - | Yes |
| `quiz.listStatusPending` | `미출제` | - | Yes |
| `quiz.listEmpty` | `📭 등록된 퀴즈가 없습니다.` | - | Yes |

### READ - Statistics (`/퀴즈통계`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.statsTitle` | `📊 퀴즈 통계` | - | Yes |
| `quiz.statsItem` | `#{id} [{category}] 참여: {participants}명 / 정답률: {correctRate}%` | id, category, participants, correctRate | Yes |
| `quiz.statsEmpty` | `📭 출제된 퀴즈가 없습니다.` | - | Yes |

### READ - Status (`/퀴즈현황`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.statusTitle` | `📊 퀴즈 현황` | - | Yes |
| `quiz.statusInfo` | `총 문제: {total} / 미출제: {remaining} / 출제완료: {published}\n출제 시간: {quizTime} / 해설 공개: {explanationTime}\n출제 채널: <#{channelId}>` | total, remaining, published, quizTime, explanationTime, channelId | Yes |
| `quiz.statusToday` | `오늘의 문제: #{id} [{category}]` | id, category | Yes |
| `quiz.statusNoToday` | `오늘은 아직 출제되지 않았습니다.` | - | Yes |

### UPDATE - Edit (`/퀴즈수정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.editSuccess` | `✅ 퀴즈 #{id} 수정 완료` | id | Yes |
| `quiz.editNotFound` | `❌ 퀴즈 #{id}를 찾을 수 없습니다.` | id | Yes |
| `quiz.editAlreadyPublished` | `⚠️ 이미 출제된 문제입니다. 수정하시겠습니까?` | - | Yes |

### UPDATE - Config (`/퀴즈설정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.configTimeSet` | `✅ 출제 시간: {quizTime} / 해설 공개: {explanationTime}` | quizTime, explanationTime | Yes |
| `quiz.configChannelSet` | `✅ 출제 채널이 <#{channelId}>로 설정되었습니다.` | channelId | Yes |
| `quiz.configEnabled` | `✅ 퀴즈 출제가 활성화되었습니다.` | - | Yes |
| `quiz.configDisabled` | `⏸️ 퀴즈 출제가 비활성화되었습니다.` | - | Yes |
| `quiz.configCategoryAdded` | `✅ 카테고리 '{category}'가 추가되었습니다.` | category | Yes |
| `quiz.configCategoryRemoved` | `✅ 카테고리 '{category}'가 삭제되었습니다.` | category | Yes |
| `quiz.configCategoryList` | `📋 등록된 카테고리: {categories}` | categories | Yes |
| `quiz.configCategoryInUse` | `❌ '{category}' 카테고리에 {count}개의 문제가 등록되어 있어 삭제할 수 없습니다.` | category, count | Yes |
| `quiz.configInvalidTime` | `❌ 시간 형식이 올바르지 않습니다. HH:MM 형식으로 입력하세요.` | - | Yes |

### DELETE - Delete (`/퀴즈삭제`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.deleteConfirm` | `⚠️ 퀴즈 #{id}를 삭제합니다. 계속하시겠습니까?` | id | Yes |
| `quiz.deleteSuccess` | `🗑️ 퀴즈 #{id} 삭제 완료` | id | Yes |
| `quiz.deleteNotFound` | `❌ 퀴즈 #{id}를 찾을 수 없습니다.` | id | Yes |
| `quiz.deleteCancelled` | `취소되었습니다.` | - | Yes |

### DELETE - Reset History (`/퀴즈초기화`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.resetConfirm` | `⚠️ 출제 이력을 초기화합니다. 문제 데이터는 유지됩니다. 계속하시겠습니까?` | - | Yes |
| `quiz.resetSuccess` | `✅ 출제 이력이 초기화되었습니다. ({count}건 초기화)` | count | Yes |
| `quiz.resetCancelled` | `초기화가 취소되었습니다.` | - | Yes |
| `quiz.resetTimeout` | `초기화 요청이 시간 초과되었습니다.` | - | Yes |

### Answer (`/답변`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.answerSuccess` | `✅ {option}번으로 답변이 제출되었습니다.` | option | Yes |
| `quiz.answerUpdated` | `✅ 답변이 {option}번으로 수정되었습니다.` | option | Yes |
| `quiz.answerNoQuiz` | `❌ 현재 출제된 문제가 없습니다.` | - | Yes |
| `quiz.answerClosed` | `❌ 답변이 마감되었습니다. (해설 공개 완료)` | - | Yes |
| `quiz.answerInvalid` | `❌ 1~5 사이의 번호를 입력하세요.` | - | Yes |

### My Answer (`/내답변`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.myAnswerTitle` | `📝 오늘의 퀴즈 내 답변` | - | Yes |
| `quiz.myAnswerInfo` | `선택한 답: {option}번\n제출 시각: {submittedAt}` | option, submittedAt | Yes |
| `quiz.myAnswerNone` | `아직 답변을 제출하지 않았습니다.` | - | Yes |
| `quiz.myAnswerNoQuiz` | `❌ 현재 출제된 문제가 없습니다.` | - | Yes |

### Auto Publish (Scheduler)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.publishTitle` | `📝 오늘의 문제 #{id}` | id | Yes |
| `quiz.publishCategory` | `[{category}]` | category | Yes |
| `quiz.publishQuestion` | `{question}` | question | Yes |
| `quiz.publishOption` | `{num}. {option}` | num, option | Yes |
| `quiz.publishFooter` | `/답변 [번호]로 답변을 제출하세요! (해설 공개: {explanationTime})` | explanationTime | Yes |
| `quiz.publishAllUsed` | `모든 문제가 출제되었습니다. 출제 이력을 초기화하고 재출제합니다.` | - | Yes |
| `quiz.publishNoQuestions` | `등록된 문제가 없어 출제를 건너뜁니다.` | - | Yes |

### Explanation Reveal (Scheduler)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.explanationTitle` | `📖 문제 #{id} 해설` | id | Yes |
| `quiz.explanationAnswer` | `정답: {answer}번` | answer | Yes |
| `quiz.explanationBody` | `{explanation}` | explanation | Yes |
| `quiz.explanationStats` | `참여자: {participants}명 / 정답률: {correctRate}%` | participants, correctRate | Yes |
| `quiz.explanationPoints` | `참가 포인트(150P): {participantCount}명 지급\n정답 포인트(200P): {correctCount}명 지급` | participantCount, correctCount | Yes |

### Common
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `quiz.noPermission` | `❌ 관리자만 사용할 수 있는 명령어입니다.` | - | Yes |
| `quiz.channelNotSet` | `❌ 출제 채널이 설정되지 않았습니다. /퀴즈설정 채널로 설정하세요.` | - | Yes |

## Bulk Register JSON Format

```json
[
  {
    "category": "국어",
    "question": "다음 중 밑줄 친 단어의 뜻으로 적절한 것은?",
    "options": ["선택1", "선택2", "선택3", "선택4", "선택5"],
    "answer": 3,
    "explanation": "정답은 3번입니다. ..."
  }
]
```

## `/퀴즈설정` Sub-commands

| Sub-command | Options | Description |
|-------------|---------|-------------|
| `시간` | 출제시간(HH:MM), 해설시간(HH:MM) | 출제 시간 및 해설 공개 시간 설정 |
| `채널` | 채널(@channel) | 문제 출제 채널 설정 |
| `활성화` | - | 퀴즈 자동 출제 활성화 |
| `비활성화` | - | 퀴즈 자동 출제 비활성화 |
| `카테고리추가` | 이름(TEXT) | 새 카테고리 추가 |
| `카테고리삭제` | 이름(TEXT) | 카테고리 삭제 (문제가 없는 경우만) |
| `카테고리목록` | - | 등록된 카테고리 목록 조회 |

## Permission
- `/퀴즈등록`, `/퀴즈일괄등록`, `/퀴즈목록`, `/퀴즈통계`, `/퀴즈현황`, `/퀴즈수정`, `/퀴즈설정`, `/퀴즈삭제`, `/퀴즈초기화`: Admin only (ADMINISTRATOR)
- `/답변`, `/내답변`: All Users

## Response Visibility
- 관리자 명령어: 모두 ephemeral
- `/답변`: ephemeral
- `/내답변`: ephemeral
- 자동 출제 메시지: public (채널에 게시)
- 해설 공개 메시지: public (채널에 게시)

## Channel
- 슬래시 명령어: 실행 채널 제한 없음 (ephemeral)
- 문제 출제 & 해설 공개: quiz_config.quiz_channel_id에 설정된 채널

## Cross-Feature Integration

### Activity Points (QUIZ_PARTICIPATE, QUIZ_CORRECT)
- 해설 공개 시점에 답변 제출자 전원에게 참가 포인트 150P 적립
- 정답자에게는 정답 포인트 200P 적립 (참가 포인트 대신, 중복 지급 아님)
- `PointAccumulationService.tryAccumulate(userId, ActivityType.QUIZ_PARTICIPATE)` 호출
- `PointAccumulationService.tryAccumulate(userId, ActivityType.QUIZ_CORRECT)` 호출
- Activity Types 테이블에 QUIZ_PARTICIPATE(150P), QUIZ_CORRECT(200P) 추가 필요
- 상세 설정은 [ACTIVITY_POINTS.md](./ACTIVITY_POINTS.md) 참조

## Business Rules

### Question Management
- 문제 본문, 보기 5개, 정답(1~5), 해설, 카테고리는 모두 필수 입력
- 카테고리는 사전에 `/퀴즈설정 카테고리추가`로 등록해야 사용 가능
- 문제 수정 시 이미 출제된 문제도 수정 가능 (경고 표시)
- 문제 삭제 시 확인 버튼 필수 (30초 타임아웃)
- 일괄 등록 시 JSON 형식 검증 후 유효한 문제만 등록

### Auto Publish (Scheduler)
- 매일 quiz_config.quiz_time에 설정된 시각에 자동 출제
- 미출제 문제 중 랜덤으로 1문제 선택
- 출제 시 quiz_publish_history에 기록
- 모든 문제가 출제된 경우 이력 초기화 후 재출제 (자동)
- 출제 채널 미설정 시 출제 건너뜀 (로그 기록)
- enabled=0이면 출제 건너뜀

### Explanation Reveal (Scheduler)
- 매일 quiz_config.explanation_time에 설정된 시각에 해설 자동 공개
- 해설 공개 시 quiz_publish_history.explanation_revealed = 1로 갱신
- 해설 공개 시점에 포인트 일괄 정산
- 해당 날짜에 출제된 문제가 없으면 건너뜀

### Answer Submission
- 사용자는 `/답변 [1~5]` 명령어로 답변 제출
- 해설 공개 전까지 답변 수정 가능 (quiz_answers UPDATE)
- 해설 공개 후 답변 제출/수정 불가
- 한 문제에 사용자당 1건만 허용 (UNIQUE 제약)

### Point Calculation
- 참가 포인트: 답변을 제출한 모든 사용자에게 150P
- 정답 포인트: 정답을 맞춘 사용자에게 200P (참가 포인트 대신)
- 포인트는 해설 공개 시점에 일괄 지급
- 정답자: 200P만 지급 (150P + 200P가 아님)
- 오답자: 150P 지급

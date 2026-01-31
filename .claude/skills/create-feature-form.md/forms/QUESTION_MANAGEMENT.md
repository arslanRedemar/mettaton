# Feature Form: Question Management

## Feature Name
Question Management (질문 관리)

## Feature Description
서버 내 질문을 등록, 조회, 삭제, 답변하는 기능.
사용자가 질문을 등록하면 지정된 질문 채널에 Embed 메시지가 게시되며, 답변이 등록되면 Embed가 업데이트된다.
사용자는 체크 리액션(✅)으로 해당 질문에 관심을 표시할 수 있다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE | `/질문등록` | 새 질문 등록 (내용) | All Users |
| READ | `/질문목록` | 현재 등록된 질문 목록 조회 (답변 상태 표시) | All Users |
| UPDATE | `/질문답변` | 질문에 답변 등록 (id, 내용) | All Users |
| DELETE | `/질문삭제` | 질문 ID로 질문 삭제 | All Users |

## Interface Strings

### CREATE - Register (`/질문등록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `question.registerSuccess` | `✅ 질문이 등록되었습니다.` | - | Yes |
| `question.channelMessage` | `❓ **질문 #{id}**\n{question}\n작성자: <@{author}>` | id, question, author | Yes |
| `question.embedTitle` | `❓ 질문 #{id}` | id | Yes |
| `question.embedDescription` | `{question}\n\n작성자: <@{author}>\n참석자: {attendeeInfo}` | question, author, attendeeInfo | Yes |

### READ - List (`/질문목록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `question.listEmpty` | `📭 등록된 질문이 없습니다.` | - | Yes |
| `question.listTitle` | `💬 현재 질문 목록` | - | Yes |
| `question.listFieldValue` | `작성자: <@{author}>\n상태: {status}\n참석자: {attendeeInfo}` | author, status, attendeeInfo | Yes |
| `question.statusAnswered` | `✅ 답변완료` | - | Yes |
| `question.statusUnanswered` | `❌ 미답변` | - | Yes |

### UPDATE - Answer (`/질문답변`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `question.answerNotFound` | `❌ 해당 ID의 질문이 없습니다.` | - | Yes |
| `question.answerSuccess` | `✅ 질문 #{id}에 답변 등록 완료` | id | Yes |
| `question.channelMessageAnswered` | `❓ **질문 #{id}**\n{question}\n작성자: <@{author}>\n\n✅ **답변:** {answer}\n(답변자: <@{answeredBy}>)` | id, question, author, answer, answeredBy | Yes |
| `question.embedDescriptionAnswered` | `{question}\n\n작성자: <@{author}>\n\n✅ **답변:** {answer}\n(답변자: <@{answeredBy}>)\n참석자: {attendeeInfo}` | question, author, answer, answeredBy, attendeeInfo | Yes |

### DELETE - Delete (`/질문삭제`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `question.deleteNotFound` | `❌ 질문 ID {id}를 찾을 수 없습니다.` | id | Yes |
| `question.deleteSuccess` | `🗑 질문 #{id} 삭제 완료` | id | Yes |
| `question.deleteMessageFail` | `질문 메시지 삭제 실패:` | - | Yes |

### Event - Message Delete
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `messageDelete.questionDeleted` | `질문이 관리자에 의해 삭제됨.` | - | Yes |

## Permission
- `/질문등록`, `/질문목록`, `/질문답변`, `/질문삭제`: All Users

## Response Visibility
- `/질문등록`: public (채널에 표시)
- `/질문목록`: ephemeral (실행자에게만 표시)
- `/질문답변`: public (채널에 표시)
- `/질문삭제`: ephemeral (실행자에게만 표시)
- 질문 채널 Embed: public (모든 사용자에게 표시)

## Channel
- 슬래시 명령어: 실행 채널 제한 없음
- 질문 Embed 게시: 환경변수로 지정된 질문 채널 (config.channels.question)

## Business Rules
- 질문 등록 시 내용은 필수 입력
- 등록된 질문은 지정된 질문 채널에 Embed 메시지로 게시
- 미답변 질문: 주황색 Embed (0xffaa00)
- 답변 완료 질문: 녹색 Embed (0x00cc66)
- 답변 등록 시 채널의 Embed 메시지가 자동으로 업데이트
- Embed에 ✅ 리액션으로 질문 관심 표시 가능
- 리액션 추가/제거 시 Embed의 참석자 수 자동 갱신
- 질문 삭제 시 채널의 Embed 메시지도 함께 삭제
- 채널에서 메시지가 직접 삭제되면 DB에서도 자동 정리
- DB 테이블: questions (질문 데이터)

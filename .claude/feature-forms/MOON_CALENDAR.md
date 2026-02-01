# Feature Form: Moon Calendar

## Feature Name
Moon Calendar (달 위상 달력)

## Feature Description
현재 월의 달 위상 달력을 크롤링하여 이미지로 표시하는 기능.
텍스트 명령어(`!달위상`)로 실행되며, puppeteer를 사용해 외부 웹사이트에서 달력 이미지를 캡처한다.
월별 캐싱으로 중복 크롤링을 방지한다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE | - | 해당 없음 | - |
| READ | `!달위상` | 현재 월 달 위상 달력 이미지 조회 (텍스트 명령어) | All Users |
| UPDATE | - | 해당 없음 | - |
| DELETE | - | 해당 없음 | - |

## Interface Strings

### READ - Moon Calendar (`!달위상`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `messageCreate.moonCommand` | `!달위상` | - | Yes |
| `messageCreate.moonLoading` | `⏳ 달력 가져오는 중...` | - | Yes |
| `messageCreate.moonTitle` | `🌙 달 위상 달력` | - | Yes |
| `messageCreate.moonDescription` | `서울 기준 달력입니다.` | - | Yes |
| `messageCreate.moonFooter` | `출처: Rhythm of Nature` | - | Yes |
| `messageCreate.moonError` | `⚠️ 달력 가져오기에 실패했습니다.` | - | Yes |
| `messageCreate.moonErrorLog` | `⚠️ 달력 전송 오류:` | - | Yes |

## Permission
- `!달위상`: All Users

## Response Visibility
- `!달위상`: public (채널에 Embed + 이미지 첨부)

## Channel
- 실행 채널 제한 없음

## Business Rules
- 텍스트 명령어 방식 (슬래시 명령어가 아님)
- 봇 메시지는 무시 (message.author.bot)
- puppeteer-core 사용하여 웹 크롤링
- 대상 웹사이트: https://kr.rhythmofnature.net/dal-uiwisang
- 월별 캐싱: YYYY-MM.png 파일명으로 캐시 저장
- 캐시 존재 시 크롤링 없이 캐시 반환
- Headless 브라우저: no-sandbox 모드 (Raspberry Pi 호환)
- Chromium 경로: CHROMIUM_PATH 환경변수로 설정 가능
- 스크린샷 대상: #moon-calendar 셀렉터 (실패 시 전체 페이지)
- 로딩 메시지 → Embed+이미지로 교체 (edit)
- Embed 색상: 금색 (#FFD700)
- 이미지는 attachment://moon_calendar.png로 Embed에 삽입
- 크롤링 실패 시 에러 메시지 표시 및 콘솔 로깅

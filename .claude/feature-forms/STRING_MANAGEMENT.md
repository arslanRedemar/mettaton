# Feature Form: String Management

## Feature Name
String Management (문자열 설정)

## Feature Description
봇의 모든 UI 문자열을 관리자가 조회, 수정, 초기화할 수 있는 기능.
110개 이상의 기본 문자열이 등록되어 있으며, DB 오버라이드 방식으로 커스터마이즈할 수 있다.
템플릿 변수({param}) 검증을 통해 필수 파라미터 누락을 방지한다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE | - | 해당 없음 (기본값이 코드에 등록됨) | - |
| READ | `/문자열설정 목록` | 등록된 문자열 목록 조회 (카테고리 필터 가능) | Admin |
| READ | `/문자열설정 확인` | 특정 문자열의 현재값/기본값/상태 확인 | Admin |
| UPDATE | `/문자열설정 수정` | 문자열 값 수정 (키, 값) | Admin |
| DELETE | `/문자열설정 초기화` | 문자열을 기본값으로 초기화 | Admin |

## Interface Strings

### READ - List (`/문자열설정 목록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (inline) | `등록된 문자열이 없습니다.` | - | No |
| (inline) | Embed title: `봇 문자열 목록` | - | No |

### READ - View (`/문자열설정 확인`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (inline) | `알 수 없는 문자열 키: {key}` | key | No |
| (inline) | Embed title: `문자열 상세: {key}` | key | No |

### UPDATE - Edit (`/문자열설정 수정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (inline) | `알 수 없는 문자열 키: {key}` | key | No |
| (inline) | `템플릿 변수가 누락되었습니다: {missing}` | missing | No |
| (inline) | `문자열이 수정되었습니다.\n\n키: {key}\n이전: {old}\n변경: {new}` | key, old, new | No |

### DELETE - Reset (`/문자열설정 초기화`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (inline) | `알 수 없는 문자열 키: {key}` | key | No |
| (inline) | `{key} 문자열이 기본값으로 초기화되었습니다.\n기본값: {default}` | key, default | No |

## Permission
- `/문자열설정 *`: Admin only (ADMINISTRATOR)

## Response Visibility
- `/문자열설정 목록`: ephemeral (Embed 형태)
- `/문자열설정 수정`: ephemeral
- `/문자열설정 초기화`: ephemeral
- `/문자열설정 확인`: ephemeral (Embed 형태)

## Channel
- 실행 채널 제한 없음 (모든 응답 ephemeral)

## Business Rules
- 110개 이상의 기본 문자열이 StringService에 등록
- 문자열 카테고리: ready, guildMemberAdd, interactionCreate, messageCreate, messageDelete, lecture, question, meeting, inactive, sync, point, personalPractice
- DB 오버라이드 방식: DB에 값이 있으면 우선 사용, 없으면 기본값 fallback
- 수정 시 autocomplete 지원 (키 검색, 수정된 키 표시)
- 수정 시 필수 템플릿 변수({param}) 누락 검증
- 목록 조회 시 카테고리별 그룹핑
- 목록에서 수정된 문자열은 `*수정됨*` 표시
- 목록에서 템플릿 변수 표시 (예: `{param1}, {param2}`)
- 확인 시 Embed 색상: 수정됨(주황, 0xffa500) / 기본값(녹색, 0x00cc66)
- 봇 시작 시 DB에서 오버라이드된 문자열 캐시 로드
- 메모리 캐시(Map)로 문자열 관리, DB 변경 시 캐시 즉시 갱신
- 문자열 조회 시 {param} 패턴을 실제 값으로 치환
- DB 테이블: bot_strings (key, value, params, updated_at)

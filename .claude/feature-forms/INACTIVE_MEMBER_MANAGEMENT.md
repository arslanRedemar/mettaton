# Feature Form: Inactive Member Management

## Feature Name
Inactive Member Management (비활동 사용자 관리)

## Feature Description
서버 내 설정된 기간 이상 활동이 없는 사용자를 조회하고 추방하는 기능.
기본 90일 기준으로 비활동 회원을 탐지하며, 관리자가 기준 일수를 변경할 수 있다.
추방 전 확인 버튼을 통한 안전장치가 포함되어 있다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE (Auto) | - | 메시지 전송 시 자동으로 활동 시간 기록 | All Users |
| READ | `/비활동목록` | 비활동 회원 목록 조회 | Admin |
| READ | `/비활동설정확인` | 현재 비활동 기준 설정 확인 | Admin |
| UPDATE | `/비활동설정` | 비활동 기준 기간 설정 (일수: 1~365) | Admin |
| DELETE | `/비활동추방` | 비활동 회원 추방 실행 | Admin |

## Interface Strings

### CREATE (Auto) - Activity Tracking
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (auto) | (알림 없음, 메시지 전송 시 자동 기록) | - | N/A |

### READ - List (`/비활동목록`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `inactive.listEmpty` | `✅ 비활동 회원이 없습니다.` | - | Yes |
| `inactive.listHeader` | `📋 {days}일 이상 비활동 회원 ({count}명):` | days, count | Yes |
| `inactive.listItem` | `<@{memberId}> - 마지막 활동: {lastActive}` | memberId, lastActive | Yes |

### READ - Config View (`/비활동설정확인`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `inactive.configDisplay` | `📋 현재 비활동 기준: {days}일` | days | Yes |

### UPDATE - Config (`/비활동설정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `inactive.configSaved` | `✅ 비활동 기준이 {days}일로 설정되었습니다.` | days | Yes |

### DELETE - Kick (`/비활동추방`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `inactive.kickNoTarget` | `✅ 추방할 비활동 회원이 없습니다.` | - | Yes |
| `inactive.kickConfirm` | `⚠️ {count}명의 비활동 회원을 추방합니다. 계속하시겠습니까?` | count | Yes |
| `inactive.kickProgress` | `⏳ 추방 진행 중... ({current}/{total})` | current, total | Yes |
| `inactive.kickSuccess` | `✅ {count}명의 비활동 회원이 추방되었습니다.` | count | Yes |
| `inactive.kickPartialFail` | `⚠️ {success}명 추방 완료, {fail}명 추방 실패 (권한 부족 등)` | success, fail | Yes |
| `inactive.kickCancelled` | `❌ 추방이 취소되었습니다.` | - | Yes |
| `inactive.kickTimeout` | `⏰ 시간이 초과되어 추방이 취소되었습니다.` | - | Yes |

## Permission
- `/비활동목록`, `/비활동추방`, `/비활동설정`, `/비활동설정확인`: Admin only (ADMINISTRATOR)

## Response Visibility
- `/비활동목록`: ephemeral (실행자에게만 표시)
- `/비활동추방`: ephemeral (실행자에게만 표시, 확인 버튼 포함)
- `/비활동설정`: ephemeral (실행자에게만 표시)
- `/비활동설정확인`: ephemeral (실행자에게만 표시)

## Channel
- 실행 채널 제한 없음 (모든 응답 ephemeral)

## Business Rules
- 활동 감지: 메시지 전송 시 자동으로 last_active_at 타임스탬프 갱신
- 기본 비활동 기준: 90일 (관리자 설정 가능, 1~365일)
- 봇 계정은 비활동 목록에서 제외
- 서버 소유자는 비활동 목록 및 추방 대상에서 제외
- 봇보다 역할이 높은 사용자는 추방 불가 (역할 계층 확인)
- 추방 전 확인(Danger)/취소(Secondary) 버튼 필수 (30초 타임아웃)
- 추방 진행 시 5명마다 진행률 메시지 업데이트
- 추방 결과에 성공/실패 카운트 표시
- 추방 사유: "비활동 {days}일 이상"
- 목록이 2000자 초과 시 자동 잘림 처리
- 활동 기록 없는 회원도 비활동으로 간주
- 마지막 활동 날짜: 한국어 로캘(ko-KR)로 표시
- DB 테이블: member_activity (활동 추적), settings (inactive_days)

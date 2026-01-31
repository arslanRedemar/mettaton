# Feature Form: Activity Points

## Feature Name
Activity Points (활동 포인트)

## Feature Description
서버 내 모든 사용자의 활동을 실시간으로 추적하여, 활동이 감지되면 자동으로 포인트를 적립하는 기능.
5분 쿨다운 기반으로 최대 100포인트를 적립하며, 관리자는 포인트 관리 및 설정을 변경할 수 있다.

## CRUD Definition

| Category | Command | Description | Permission |
|----------|---------|-------------|------------|
| CREATE (Auto) | - | 사용자 활동 감지 시 자동으로 포인트 적립 (5분 쿨다운, 기본 100P) | All Users |
| READ | `/포인트` | 본인의 현재 포인트 조회 (ephemeral) | All Users |
| READ | `/포인트랭킹` | 전체 사용자 포인트 랭킹 조회 | Admin |
| UPDATE | `/포인트설정 조정` | 특정 사용자의 포인트 수동 조정 | Admin |
| UPDATE | `/포인트설정 설정` | 적립 포인트량 및 쿨다운 시간 설정 변경 | Admin |
| UPDATE | `/포인트설정 확인` | 현재 적립 설정 확인 | Admin |
| DELETE | `/포인트설정 초기화` | 전체 또는 특정 사용자 포인트 초기화 | Admin |

## Interface Strings

### Point Accumulation
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| (auto) | (알림 없음, 자동 적립) | - | N/A |
| (cooldown) | (알림 없음, 무시) | - | N/A |

### Read - My Points (`/포인트`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.myPoints` | `현재 포인트: {points}P` | points | Yes |

### Read - Ranking (`/포인트랭킹`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.rankingTitle` | `포인트 랭킹 (Top {count}):` | count | Yes |
| `point.rankingEntry` | `{rank}. {user} - {points}P` | rank, user, points | Yes |
| `point.rankingEmpty` | `등록된 포인트가 없습니다.` | - | Yes |

### Update - Adjust (`/포인트설정 조정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.adjustSuccess` | `{user}님의 포인트가 {points}P로 조정되었습니다.` | user, points | Yes |

### Update - Config (`/포인트설정 설정`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.configSaved` | `포인트 설정이 변경되었습니다. (적립: {points}P, 쿨다운: {cooldown}분)` | points, cooldown | Yes |
| `point.configView` | `현재 설정 - 적립: {points}P, 쿨다운: {cooldown}분` | points, cooldown | Yes |

### Delete - Reset (`/포인트설정 초기화`)
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.resetConfirm` | `전체 사용자의 포인트를 초기화합니다. 계속하시겠습니까?` | - | Yes |
| `point.resetComplete` | `포인트가 초기화되었습니다.` | - | Yes |
| `point.resetUserComplete` | `{user}님의 포인트가 초기화되었습니다.` | user | Yes |

### Common
| Key | String | Params | Customizable |
|-----|--------|--------|:---:|
| `point.noPermission` | `관리자만 사용할 수 있는 명령어입니다.` | - | Yes |

## Permission
- `/포인트`: All Users
- `/포인트랭킹`, `/포인트설정 *`: Admin only (ADMINISTRATOR)

## Response Visibility
- `/포인트`: ephemeral (실행자에게만 표시)
- `/포인트랭킹`: ephemeral (실행자에게만 표시)
- `/포인트설정 *`: ephemeral (실행자에게만 표시)

## Channel
- 실행 채널 제한 없음 (모든 응답 ephemeral)

## Business Rules
- 활동 감지: 메시지 전송, 리액션 추가 등 모든 서버 활동
- 쿨다운: 기본 5분 (관리자 설정 가능)
- 적립량: 기본 100P (관리자 설정 가능)
- 봇 메시지는 포인트 적립 대상에서 제외
- 포인트는 음수가 될 수 없음 (최소 0P)
- 초기화 시 확인 버튼 필수

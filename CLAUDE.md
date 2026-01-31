# Project: a discord bot for discord server

## Tech Stack
- Frontend: discord.js
- Backend: discord.js
- DB: better-sqlite3
- Tools: puppeteer
- Test: Jest

## Code Style
- Functional components
- Airbnb ESLint
- JSDoc for public functions
- 한글 주석은 영어로 변환

## Directory Structure


```
Scripts/                # Config for Raspberry PI 3B+ hardware and shell scripts for raspberry Pi

core/
├── config/             # 환경변수 및 앱 설정
├── di/                 # 의존성 주입 설정
├── errors/             # 커스텀 에러/예외 클래스
├── types/              # 공통 타입 정의
└── utils/              # 공통 유틸리티

src/
├── data/                       # DataLayer (외부 시스템 구현)
│   ├── datasource/            # DB Connect or Initialize
│   ├── mappers/               # Entity ↔ Model 변환
│   ├── models/                # DB 모델 (Table Schema)
│   └── repositories/          # Repository 구현체
│
├── domain/                     # Domain Layer (Core Business Logic)
│   ├── entities/              # Business Entity
│   ├── repositories/          # Repository Interfaces(Abstract)
│   └── usecases/              # Business Usecases
│
└── presentation/               # Presentation Layer (External imports/exports)
    ├── controllers/           # Request Handler
    ├── dto/                   # Data Transfer Objects
    ├── interfaces/            # UI Interfaces
    └── views/                 # 응답 뷰/포맷터

tests/
├── unit/                      # Unit Test
└── integration/               # Integration Test
```

## Important Notes

- Every Feature must be **logged**!
- Every Feature must be **Testable**.

# 신용 점수 리포트 React 앱

LLM 기반 신용 분석 리포트를 표시하는 React 웹 애플리케이션입니다.

## 기능

- 랜덤 신용정보 기반 AI 리포트 생성
- 모바일 최적화된 UI
- 신용점수 시각화 (막대 그래프, 사용률 그래프)
- 맞춤형 액션 플랜 제공
- 실시간 리포트 생성

## 기술 스택

- React 18
- TypeScript
- Vite
- CSS3 (반응형 디자인)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 백엔드 API 서버 실행

React 앱을 실행하기 전에 먼저 백엔드 API 서버가 실행되어야 합니다.

프로젝트 루트 디렉토리에서:

```bash
# 환경 변수 설정 (.env 파일에 ANTHROPIC_API_KEY 추가)
npm run dev
```

백엔드 서버는 `http://localhost:3000`에서 실행됩니다.

### 3. React 개발 서버 실행

client 디렉토리에서:

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

## 프로젝트 구조

```
client/
├── src/
│   ├── components/
│   │   ├── CreditReport.tsx       # 메인 리포트 컴포넌트
│   │   ├── CreditReport.css
│   │   ├── LoadingSpinner.tsx     # 로딩 UI
│   │   ├── LoadingSpinner.css
│   │   ├── ErrorMessage.tsx       # 에러 UI
│   │   └── ErrorMessage.css
│   ├── services/
│   │   └── api.ts                 # API 서비스
│   ├── types/
│   │   └── index.ts               # TypeScript 타입 정의
│   ├── App.tsx                    # 메인 앱 컴포넌트
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── vite.config.ts                 # Vite 설정 (프록시 포함)
└── package.json
```

## API 엔드포인트

React 앱은 다음 백엔드 API를 사용합니다:

- `GET /api/report/llm-json` - 랜덤 신용 리포트 생성 (JSON)

## 빌드

프로덕션 빌드:

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

## 프리뷰

빌드된 앱을 로컬에서 프리뷰:

```bash
npm run preview
```

## 주의사항

- 백엔드 API 서버가 실행 중이어야 합니다
- ANTHROPIC_API_KEY가 설정되어 있어야 리포트가 생성됩니다
- 개발 시에는 Vite 프록시를 통해 CORS 문제를 해결합니다

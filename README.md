# 신용 분석 리포트 생성 서비스

AI 기반 2-Stage LLM 파이프라인을 활용한 개인 맞춤형 신용 분석 리포트 생성 서비스

## 🎯 주요 기능

- **2-Stage LLM 분석**
  - Stage 1 (Analyzer): 신용 데이터 분석 및 페르소나 파악
  - Stage 2 (Writer): 사용자 친화적 메시지 작성
- **React 기반 UI**: 모바일 최적화된 사용자 친화적 인터페이스
- **실시간 분석**: 사용자 입력 즉시 AI 분석 결과 제공

## 🏗️ 프로젝트 구조

```
credit-score-api-clean/
├── src/                              # 백엔드 소스
│   ├── server.ts                    # Express 서버 메인
│   ├── types.ts                     # TypeScript 타입 정의
│   └── services/
│       └── claudeService.ts         # Claude API 통합 및 2-Stage LLM
├── client/                           # React 프론트엔드
│   ├── src/
│   │   ├── App.tsx                  # 메인 앱 컴포넌트
│   │   ├── components/              # UI 컴포넌트
│   │   │   ├── CreditInfoForm.tsx  # 신용정보 입력 폼
│   │   │   ├── CreditReport.tsx    # 리포트 표시
│   │   │   ├── LoadingSpinner.tsx  # 로딩 UI
│   │   │   └── ErrorMessage.tsx    # 에러 메시지
│   │   ├── services/
│   │   │   └── api.ts              # API 통신
│   │   └── types/
│   │       └── index.ts            # 타입 정의
│   └── package.json
├── PROMPT_STAGE1_ANALYZER_V2.md     # Stage 1 프롬프트 템플릿
├── PROMPT_STAGE2_WRITER_V2.md       # Stage 2 프롬프트 템플릿
├── TERMS_DICTIONARY.md              # 금융 용어 사전
├── WRITER_COPY_GUIDE.md             # 문장 작성 가이드
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 시작하기

### 1. 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# ANTHROPIC_API_KEY 설정
# .env 파일을 열어서 API 키 입력
ANTHROPIC_API_KEY=your_api_key_here
```

### 2. 백엔드 실행

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 또는 빌드 후 프로덕션 실행
npm run build
npm start
```

백엔드 서버: http://localhost:3000

### 3. 프론트엔드 실행

```bash
# client 디렉토리로 이동
cd client

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 앱: http://localhost:5173

## 📡 API 엔드포인트

### `POST /api/reports/analyze`

사용자 입력 신용정보를 분석하여 AI 리포트 생성

**요청 본문:**
```json
{
  "name": "홍길동",
  "age": 30,
  "estimatedAnnualIncome": 5000,
  "creditScore": 750,
  "totalLoans": 2,
  "totalLoanAmount": 3000,
  "overdueCount": 0,
  "overdueAmount": 0,
  "totalCards": 3,
  "totalLimit": 500,
  "monthlyUsage": 150,
  "usageRate": 30
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "creditInfo": { ... },
    "llmAnalysis": {
      "keyIssueTitle": "신용 관리 정말 잘하고 계세요!",
      "keyIssueDescription": "...",
      "actionTitle": "좋은 습관 지키는 3가지",
      "actions": ["...", "...", "..."],
      "ctaText": "우대 혜택 찾아보기",
      "ctaDescription": "...",
      "topStrength": "...",
      "showGraph": true,
      "graphType": "score"
    }
  }
}
```

## 🧠 2-Stage LLM 파이프라인

### Stage 1: Analyzer
- **목적**: 신용 데이터 분석 및 사용자 페르소나 파악
- **프롬프트**: `PROMPT_STAGE1_ANALYZER_V2.md`
- **출력**: 신용 상태 분석, 핵심 이슈 파악, 페르소나 분류

### Stage 2: Writer
- **목적**: 사용자 친화적이고 공감되는 메시지 작성
- **프롬프트**: `PROMPT_STAGE2_WRITER_V2.md`
- **출력**: 핵심 메시지, 액션 플랜, CTA, 강점 강조
- **가이드라인**: `WRITER_COPY_GUIDE.md` (긍정적 톤, 쉬운 용어)

## 🎨 UI/UX 특징

- **모바일 우선**: 375px 기준 최적화
- **1스크롤 완결**: 핵심 정보를 한 화면에
- **긍정적 메시징**: 부정적 표현 없이 개선 기회 강조
- **시각화**: 신용점수, 카드 사용률, 대출 비교 그래프

## 🌐 배포

### Backend (Railway)
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start"
  }
}
```

환경 변수 설정:
- `ANTHROPIC_API_KEY`: Claude API 키
- `PORT`: 3000 (자동 설정됨)

### Frontend (Vercel)

client 디렉토리를 Vercel에 배포

환경 변수:
- `VITE_API_URL`: 백엔드 API URL (Railway 배포 URL)

## 📦 기술 스택

### Backend
- Node.js + Express
- TypeScript
- Anthropic Claude API (Sonnet 4.5)

### Frontend
- React 18
- TypeScript
- Vite
- CSS3 (모바일 최적화)

## 📝 라이센스

ISC

---

**Co-Authored-By:** Claude Sonnet 4.5 <noreply@anthropic.com>

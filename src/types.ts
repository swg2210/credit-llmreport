export interface CreditInfo {
  // 기본 정보
  userId: string;
  name: string;
  age: number;
  ageGroup: string;           // 연령대 (예: "20대", "30대")

  // 신용 점수 (NICE, KCB 중 높은 점수 자동 선택)
  niceScore: number;          // NICE 신용점수 (300-900)
  kcbScore: number;           // KCB 신용점수 (300-900)
  creditScore: number;        // 둘 중 높은 점수
  creditGrade: number;        // 신용등급 (1-10, 1이 최고)

  // 소득 정보
  estimatedAnnualIncome: number; // 추정 연소득 (만원)

  // 대출 정보
  loanInfo: {
    totalLoans: number;       // 총 대출 건수
    totalLoanAmount: number;  // 총 대출 금액 (만원)
    overdueCount: number;     // 연체 횟수
    overdueAmount: number;    // 연체 금액 (만원)
  };

  // 카드 정보
  cardInfo: {
    totalCards: number;       // 보유 카드 수
    totalLimit: number;       // 총 한도 (만원)
    usageRate: number;        // 사용률 (%)
    monthlyUsage: number;     // 월 카드 사용금액 (만원)
  };

  // 신용조회 이력
  inquiryHistory: Array<{
    inquiryAt: string;        // 조회일시
    company: string;          // 금융사명
    reason: string;           // 조회사유
  }>;

  // 신용변동 내역
  creditChanges: {
    loanAccountOpened: number;        // 대출계좌 개설 건수
    loanAccountAmountChanged: number; // 대출계좌 금액 변동 건수
    loanAccountClosed: number;        // 대출계좌 해지 건수
    cardIssued: number;               // 카드 발급 건수
    cardClosed: number;               // 카드 해지 건수
  };

  // 신용점수 변동 내역
  scoreHistory: {
    currentScore: number;     // 현재 점수
    currentScoreDate: string; // 현재 점수 조회일
    previousScore: number;    // 최근 점수 (이전)
    previousScoreDate: string; // 최근 점수 조회일
    scoreChange: number;      // 점수 변동 (현재 - 이전)
  };

  // 비교 정보 (동일 연령대 기준)
  comparison: {
    avgCreditScore: number;           // 동일 연령대 평균 신용점수
    incomePercentile: number;         // 소득모형 중 내 추정소득 백분률 (0-100)
    recommendedMonthlySpending: number; // 동일 연령대 기준 월 권장 소비액 (만원)
    avgMonthlyCardUsage: number;      // 동일 연령 월 평균 카드사용액 (만원)
    avgLoanAmount: number;            // 동일 연령 대출 평균 금액 (만원)
  };

  // 생성 시간
  generatedAt: string;
}

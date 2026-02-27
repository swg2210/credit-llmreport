export interface CreditInfo {
  userId: string;
  name: string;
  age: number;
  ageGroup: string;
  niceScore: number;
  kcbScore: number;
  creditScore: number;
  creditGrade: number;
  estimatedAnnualIncome: number;
  loanInfo: {
    totalLoans: number;
    totalLoanAmount: number;
    overdueCount: number;
    overdueAmount: number;
  };
  cardInfo: {
    totalCards: number;
    totalLimit: number;
    usageRate: number;
    monthlyUsage: number;
  };
  inquiryHistory: Array<{
    inquiryAt: string;
    company: string;
    reason: string;
  }>;
  creditChanges: {
    loanAccountOpened: number;
    loanAccountAmountChanged: number;
    loanAccountClosed: number;
    cardIssued: number;
    cardClosed: number;
  };
  scoreHistory: {
    currentScore: number;
    currentScoreDate: string;
    previousScore: number;
    previousScoreDate: string;
    scoreChange: number;
  };
  comparison: {
    avgCreditScore: number;
    incomePercentile: number;
    recommendedMonthlySpending: number;
    avgMonthlyCardUsage: number;
    avgLoanAmount: number;
  };
  generatedAt: string;
}

export interface LLMPersonaAnalysis {
  keyIssueTitle: string;
  keyIssueDescription: string;
  actionTitle: string;
  actions: string[];
  ctaText: string;
  ctaDescription: string;
  topStrength: string;
  showGraph: boolean;
  graphType?: 'score' | 'card' | 'loan' | 'overdue';
}

export interface ReportResponse {
  success: boolean;
  data: {
    creditInfo: CreditInfo;
    llmAnalysis: LLMPersonaAnalysis;
  };
}

export type TestCaseType = 'random' | 'overdue' | 'low-score' | 'high-card' | 'high-loan' | 'good';

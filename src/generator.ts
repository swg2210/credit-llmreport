import { CreditInfo } from './types';

// 랜덤 숫자 생성 (min 이상 max 이하)
const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 랜덤 소수점 숫자 생성
const randomFloat = (min: number, max: number, decimals: number = 2): number => {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
};

// 한국 이름 샘플
const surnames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '신', '서', '권', '황'];
const givenNames = ['민준', '서윤', '예준', '서준', '지우', '하준', '도윤', '시우', '수빈', '지호', '우진', '지훈', '지민', '준서', '현우'];

// 연령대 계산
const getAgeGroup = (age: number): string => {
  return `${Math.floor(age / 10) * 10}대`;
};

// 신용점수에 따른 신용등급 계산 (한국식)
const calculateGrade = (score: number): number => {
  if (score >= 900) return 1;
  if (score >= 870) return 2;
  if (score >= 840) return 3;
  if (score >= 805) return 4;
  if (score >= 750) return 5;
  if (score >= 665) return 6;
  if (score >= 600) return 7;
  if (score >= 515) return 8;
  if (score >= 445) return 9;
  return 10;
};

// 연령대별 평균 신용점수
const getAvgCreditScoreByAge = (age: number): number => {
  if (age < 30) return random(650, 700);
  if (age < 40) return random(680, 730);
  if (age < 50) return random(700, 750);
  if (age < 60) return random(720, 770);
  return random(710, 760);
};

// 연령대별 평균 대출 금액
const getAvgLoanAmountByAge = (age: number): number => {
  if (age < 30) return random(1000, 3000);
  if (age < 40) return random(3000, 8000);
  if (age < 50) return random(5000, 12000);
  if (age < 60) return random(4000, 10000);
  return random(2000, 6000);
};

// 연령대별 평균 월 카드 사용액
const getAvgMonthlyCardUsageByAge = (age: number): number => {
  if (age < 30) return random(80, 150);
  if (age < 40) return random(150, 250);
  if (age < 50) return random(200, 350);
  if (age < 60) return random(180, 300);
  return random(120, 220);
};

// 연령대별 권장 월 소비액
const getRecommendedMonthlySpendingByAge = (age: number, income: number): number => {
  // 연소득의 50-60%를 12개월로 나눔
  const baseSpending = (income * randomFloat(0.5, 0.6)) / 12;
  return Math.round(baseSpending);
};

// 랜덤 신용정보 생성
export const generateRandomCreditInfo = (): CreditInfo => {
  // NICE와 KCB 점수 생성 (보통 20-50점 정도 차이)
  const baseScore = random(300, 900);
  const scoreDiff = random(-50, 50);
  const niceScore = Math.max(300, Math.min(900, baseScore));
  const kcbScore = Math.max(300, Math.min(900, baseScore + scoreDiff));
  const creditScore = Math.max(niceScore, kcbScore);
  const creditGrade = calculateGrade(creditScore);

  const age = random(20, 65);
  const ageGroup = getAgeGroup(age);

  // 신용점수에 따라 다른 프로필 생성 (점수가 높을수록 좋은 이력)
  const scoreRatio = (creditScore - 300) / 600; // 0 ~ 1 사이 값

  // 나이와 신용점수에 따른 추정 연소득
  let estimatedAnnualIncome: number;
  if (age < 30) {
    estimatedAnnualIncome = random(2500, 4500) + Math.round(scoreRatio * 2000);
  } else if (age < 40) {
    estimatedAnnualIncome = random(3500, 6500) + Math.round(scoreRatio * 3000);
  } else if (age < 50) {
    estimatedAnnualIncome = random(4500, 8500) + Math.round(scoreRatio * 3500);
  } else if (age < 60) {
    estimatedAnnualIncome = random(4000, 7500) + Math.round(scoreRatio * 3000);
  } else {
    estimatedAnnualIncome = random(3000, 6000) + Math.round(scoreRatio * 2500);
  }

  const totalLoans = random(0, Math.floor(5 - scoreRatio * 3)); // 점수 높을수록 대출 적음
  const totalLoanAmount = totalLoans > 0 ? random(500, 10000) : 0;
  const overdueCount = random(0, Math.floor(10 * (1 - scoreRatio))); // 점수 높을수록 연체 적음
  const overdueAmount = overdueCount > 0 ? random(0, Math.floor(1000 * (1 - scoreRatio))) : 0;

  const totalCards = random(1, 8);
  const totalLimit = random(200, 5000);
  const usageRate = randomFloat(5, 80 * (1 - scoreRatio * 0.5)); // 점수 높을수록 사용률 낮음
  const monthlyUsage = Math.round((totalLimit * usageRate) / 100);

  // 신용조회 이력 (0-5건)
  const inquiryCount = random(0, 5);
  const inquiryHistory = Array.from({ length: inquiryCount }, () => {
    const daysAgo = random(1, 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const companies = ['KB국민은행', '신한은행', '하나은행', '우리은행', '농협은행', 'IBK기업은행',
                       '삼성카드', '현대카드', '롯데카드', 'KB국민카드', '신한카드', 'NH농협카드'];
    const reasons = ['신용카드 발급', '대출 신청', '한도 조회', '신용정보 조회', '보증 심사'];

    return {
      inquiryAt: date.toISOString().split('T')[0],
      company: companies[random(0, companies.length - 1)],
      reason: reasons[random(0, reasons.length - 1)],
    };
  });

  // 신용변동 내역 (최근 6개월 기준)
  const creditChanges = {
    loanAccountOpened: random(0, 2),
    loanAccountAmountChanged: random(0, 3),
    loanAccountClosed: random(0, 1),
    cardIssued: random(0, 2),
    cardClosed: random(0, 1),
  };

  // 신용점수 변동 내역
  const previousScoreDaysAgo = random(30, 90);
  const previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - previousScoreDaysAgo);
  const previousScore = Math.max(300, Math.min(900, creditScore + random(-50, 30)));
  const scoreChange = creditScore - previousScore;

  const scoreHistory = {
    currentScore: creditScore,
    currentScoreDate: new Date().toISOString().split('T')[0],
    previousScore,
    previousScoreDate: previousDate.toISOString().split('T')[0],
    scoreChange,
  };

  // 비교 정보
  const avgCreditScore = getAvgCreditScoreByAge(age);
  const incomePercentile = Math.min(95, Math.max(5,
    50 + (estimatedAnnualIncome - (age < 40 ? 4000 : 6000)) / 100
  ));
  const recommendedMonthlySpending = getRecommendedMonthlySpendingByAge(age, estimatedAnnualIncome);
  const avgMonthlyCardUsage = getAvgMonthlyCardUsageByAge(age);
  const avgLoanAmount = getAvgLoanAmountByAge(age);

  return {
    userId: `USER${random(10000, 99999)}`,
    name: surnames[random(0, surnames.length - 1)] + givenNames[random(0, givenNames.length - 1)],
    age,
    ageGroup,
    niceScore,
    kcbScore,
    creditScore,
    creditGrade,
    estimatedAnnualIncome,
    loanInfo: {
      totalLoans,
      totalLoanAmount,
      overdueCount,
      overdueAmount,
    },
    cardInfo: {
      totalCards,
      totalLimit,
      usageRate,
      monthlyUsage,
    },
    inquiryHistory,
    creditChanges,
    scoreHistory,
    comparison: {
      avgCreditScore,
      incomePercentile: Math.round(incomePercentile),
      recommendedMonthlySpending,
      avgMonthlyCardUsage,
      avgLoanAmount,
    },
    generatedAt: new Date().toISOString(),
  };
};

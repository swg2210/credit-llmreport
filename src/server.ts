import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClaudeService } from './services/claudeService';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 헬스 체크
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 사용자 입력 신용정보 분석 (POST)
app.post('/api/reports/analyze', async (req: Request, res: Response) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.',
      });
    }

    const inputData = req.body;

    // 필수 필드 검증
    const requiredFields = ['name', 'age', 'estimatedAnnualIncome', 'creditScore'];
    for (const field of requiredFields) {
      if (!inputData[field] && inputData[field] !== 0) {
        return res.status(400).json({
          success: false,
          error: `필수 항목이 누락되었습니다: ${field}`,
        });
      }
    }

    // CreditInfo 형식으로 변환
    const creditInfo = {
      userId: `user_${Date.now()}`,
      name: inputData.name,
      age: parseInt(inputData.age),
      ageGroup: inputData.age < 30 ? '20대' : inputData.age < 40 ? '30대' : inputData.age < 50 ? '40대' : inputData.age < 60 ? '50대' : '60대 이상',
      niceScore: parseInt(inputData.niceScore || inputData.creditScore),
      kcbScore: parseInt(inputData.kcbScore || inputData.creditScore),
      creditScore: parseInt(inputData.creditScore),
      creditGrade: Math.ceil((1000 - parseInt(inputData.creditScore)) / 100),
      estimatedAnnualIncome: parseInt(inputData.estimatedAnnualIncome),
      loanInfo: {
        totalLoans: parseInt(inputData.totalLoans || 0),
        totalLoanAmount: parseInt(inputData.totalLoanAmount || 0),
        overdueCount: parseInt(inputData.overdueCount || 0),
        overdueAmount: parseInt(inputData.overdueAmount || 0),
      },
      cardInfo: {
        totalCards: parseInt(inputData.totalCards || 0),
        totalLimit: parseInt(inputData.totalLimit || 0),
        usageRate: parseFloat(inputData.usageRate || 0),
        monthlyUsage: parseInt(inputData.monthlyUsage || 0),
      },
      inquiryHistory: [],
      creditChanges: {
        loanAccountOpened: 0,
        loanAccountAmountChanged: 0,
        loanAccountClosed: 0,
        cardIssued: 0,
        cardClosed: 0,
      },
      scoreHistory: {
        currentScore: parseInt(inputData.creditScore),
        currentScoreDate: new Date().toISOString(),
        previousScore: parseInt(inputData.creditScore) - Math.floor(Math.random() * 20),
        previousScoreDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        scoreChange: Math.floor(Math.random() * 20),
      },
      comparison: {
        avgCreditScore: 680,
        incomePercentile: 65,
        recommendedMonthlySpending: Math.floor(parseInt(inputData.estimatedAnnualIncome) / 12 * 0.3),
        avgMonthlyCardUsage: 150,
        avgLoanAmount: 3000,
      },
      generatedAt: new Date().toISOString(),
    };

    // 2-Stage LLM 분석
    const claudeService = new ClaudeService();
    const llmAnalysis = await claudeService.analyzePersonaWithLLM(creditInfo);

    res.json({
      success: true,
      data: {
        creditInfo,
        llmAnalysis,
      },
    });
  } catch (error) {
    console.error('사용자 입력 리포트 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: '리포트 생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
});

// 404 핸들러
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '요청하신 엔드포인트를 찾을 수 없습니다.',
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`\n🚀 신용정보 분석 API 서버가 시작되었습니다!`);
  console.log(`📍 서버 주소: http://localhost:${PORT}`);
  console.log(`\n사용 가능한 엔드포인트:`);
  console.log(`  GET  /health - 헬스 체크`);
  console.log(`  POST /api/reports/analyze - 신용정보 분석 (2-Stage LLM)\n`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(`⚠️  경고: ANTHROPIC_API_KEY가 설정되지 않았습니다.`);
    console.log(`   .env 파일에 API 키를 설정해주세요.\n`);
  }
});

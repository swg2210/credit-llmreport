import Anthropic from '@anthropic-ai/sdk';
import { CreditInfo } from '../types';
import fs from 'fs';
import path from 'path';

export interface CreditReportAnalysis {
  summary: string;
  strengths: string[];
  improvements: string[]; // 개선할 점 (부정적 표현 X)
  recommendations: string[];
  warnings: string[]; // 선택사항 (중요한 경우만)
  futureOutlook: string;
}

// LLM 완전 위임 방식의 페르소나 분석 결과
export interface LLMPersonaAnalysis {
  keyIssueTitle: string;           // 핵심 이슈 제목
  keyIssueDescription: string;     // 핵심 이슈 설명
  urgencyReason: string;           // 왜 이게 가장 시급한지
  actionTitle: string;             // 액션 섹션 제목
  actions: string[];               // 구체적 액션 3개
  ctaText: string;                 // CTA 버튼 텍스트
  ctaDescription: string;          // CTA 서브텍스트
  topStrength: string;             // 가장 돋보이는 강점 1개
  showGraph: boolean;              // 그래프 표시 여부
  graphType?: 'score' | 'card' | 'loan' | 'overdue';  // 그래프 타입
  graphData?: any;                 // 그래프에 필요한 데이터
}

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다.');
    }
    this.client = new Anthropic({ apiKey });
  }

  /**
   * 신용정보를 분석하여 리포트 생성
   */
  async analyzeCreditInfo(
    creditInfo: CreditInfo
  ): Promise<CreditReportAnalysis> {
    const prompt = this.buildPrompt(creditInfo);

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return this.parseResponse(content.text);
      }

      throw new Error('예상치 못한 응답 형식입니다.');
    } catch (error) {
      console.error('Claude API 호출 실패:', error);
      throw new Error('신용정보 분석에 실패했습니다.');
    }
  }

  /**
   * 프롬프트 작성
   */
  private buildPrompt(creditInfo: CreditInfo): string {
    return `당신은 금융 전문가이자 신용 분석 전문가입니다. 다음 신용정보를 분석하여 종합적인 신용 리포트를 작성해주세요.

## 신용정보

**기본 정보**
- 이름: ${creditInfo.name}
- 나이: ${creditInfo.age}세 (${creditInfo.ageGroup})
- 추정 연소득: ${creditInfo.estimatedAnnualIncome.toLocaleString()}만원

**신용 점수**
- NICE 신용점수: ${creditInfo.niceScore}점
- KCB 신용점수: ${creditInfo.kcbScore}점
- 최종 신용점수: ${creditInfo.creditScore}점 (둘 중 높은 점수)
- 신용등급: ${creditInfo.creditGrade}등급 (1-10, 1이 최고)

**대출 정보**
- 총 대출 건수: ${creditInfo.loanInfo.totalLoans}건
- 총 대출 금액: ${creditInfo.loanInfo.totalLoanAmount.toLocaleString()}만원
- 연체 횟수: ${creditInfo.loanInfo.overdueCount}회
- 연체 금액: ${creditInfo.loanInfo.overdueAmount.toLocaleString()}만원

**카드 정보**
- 보유 카드 수: ${creditInfo.cardInfo.totalCards}개
- 총 한도: ${creditInfo.cardInfo.totalLimit.toLocaleString()}만원
- 카드 사용률: ${creditInfo.cardInfo.usageRate.toFixed(1)}%
- 월 카드 사용금액: ${creditInfo.cardInfo.monthlyUsage.toLocaleString()}만원

**비교 정보 (${creditInfo.ageGroup} 평균)**
- ${creditInfo.ageGroup} 평균 신용점수: ${creditInfo.comparison.avgCreditScore}점
- 소득 백분위: 상위 ${100 - creditInfo.comparison.incomePercentile}%
- ${creditInfo.ageGroup} 평균 월 카드사용액: ${creditInfo.comparison.avgMonthlyCardUsage.toLocaleString()}만원
- ${creditInfo.ageGroup} 평균 대출 금액: ${creditInfo.comparison.avgLoanAmount.toLocaleString()}만원
- ${creditInfo.ageGroup} 기준 월 권장 소비액: ${creditInfo.comparison.recommendedMonthlySpending.toLocaleString()}만원

---

다음 형식으로 JSON 응답을 생성해주세요. 반드시 유효한 JSON 형식이어야 하며, 다른 텍스트는 포함하지 마세요:

{
  "summary": "신용상태 종합 평가 (2-3문장, 핵심만 간결하게, 연령대 평균 비교 포함)",
  "strengths": ["잘하고 계신 점 1", "잘하고 계신 점 2"],
  "improvements": ["개선하면 좋은 점 1 (긍정적 표현)", "개선하면 좋은 점 2"],
  "recommendations": ["실천 가능한 구체적 방법 1", "방법 2", "방법 3"],
  "warnings": [],
  "futureOutlook": "긍정적인 신용점수 전망 (2문장, 격려하는 톤)"
}

**작성 원칙 (매우 중요):**
- 모바일 환경: 각 항목은 2-3개로 제한, 1-2줄로 간결하게
- 부정적 표현 절대 금지: "심각", "위험", "문제", "낮다", "부족" 등 사용 금지
- 긍정적 톤: "개선 기회", "성장 가능성", "~하면 더 좋아요", "~해보세요" 등 격려
- 팩트 전달: 수치와 비교는 객관적으로, 하지만 표현은 중립적/긍정적으로
- 쉬운 용어: 금융 전문용어 최소화, 초등학생도 이해 가능하게
- improvements는 "이렇게 하면 더 좋아질 수 있어요" 관점으로 작성
- warnings는 정말 중요한 경우만 (대부분 빈 배열로)
- 모든 문장은 짧고 명확하게 (한 문장 최대 30자 권장)`;
  }

  /**
   * Claude 응답 파싱
   */
  private parseResponse(response: string): CreditReportAnalysis {
    try {
      // JSON 부분만 추출 (코드 블록이 있는 경우 제거)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || '',
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        recommendations: parsed.recommendations || [],
        warnings: parsed.warnings || [],
        futureOutlook: parsed.futureOutlook || '',
      };
    } catch (error) {
      console.error('응답 파싱 실패:', error);
      throw new Error('분석 결과를 처리하는데 실패했습니다.');
    }
  }

  /**
   * 완전 LLM 위임: 페르소나 분석부터 메시지 생성까지 (2-Stage Pipeline)
   */
  async analyzePersonaWithLLM(
    creditInfo: CreditInfo
  ): Promise<LLMPersonaAnalysis> {
    // Stage 1: 데이터 분석 (Analyzer)
    const stage1Result = await this.executeStage1Analysis(creditInfo);

    // Stage 2: 사용자 메시지 작성 (Writer)
    const stage2Result = await this.executeStage2Writing(creditInfo, stage1Result);

    return stage2Result;
  }

  /**
   * Stage 1: 신용 데이터 분석 (Analyzer)
   */
  private async executeStage1Analysis(creditInfo: CreditInfo): Promise<any> {
    const prompt = this.buildStage1Prompt(creditInfo);

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        // JSON 응답 파싱
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Stage 1: JSON 형식을 찾을 수 없습니다.');
        }
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Stage 1: 예상치 못한 응답 형식입니다.');
    } catch (error) {
      console.error('Stage 1 분석 실패:', error);
      throw new Error('신용 데이터 분석에 실패했습니다.');
    }
  }

  /**
   * Stage 2: 사용자 친화적 메시지 작성 (Writer)
   */
  private async executeStage2Writing(
    creditInfo: CreditInfo,
    stage1Analysis: any
  ): Promise<LLMPersonaAnalysis> {
    const prompt = this.buildStage2Prompt(creditInfo, stage1Analysis);

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return this.parsePersonaResponse(content.text);
      }

      throw new Error('Stage 2: 예상치 못한 응답 형식입니다.');
    } catch (error) {
      console.error('Stage 2 작성 실패:', error);
      throw new Error('리포트 메시지 생성에 실패했습니다.');
    }
  }

  /**
   * Stage 1 프롬프트 생성 (Analyzer)
   */
  private buildStage1Prompt(creditInfo: CreditInfo): string {
    // Stage 1 템플릿 파일 읽기
    const templatePath = path.join(__dirname, '../../PROMPT_STAGE1_ANALYZER_V2.md');
    let template = fs.readFileSync(templatePath, 'utf-8');

    // 공통 용어 사전 읽기
    const termsDictPath = path.join(__dirname, '../../TERMS_DICTIONARY.md');
    const termsDict = fs.readFileSync(termsDictPath, 'utf-8');

    // 계산된 값들
    const scoreVsAvg = creditInfo.creditScore - creditInfo.comparison.avgCreditScore;
    const loanVsAvg = creditInfo.loanInfo.totalLoanAmount - creditInfo.comparison.avgLoanAmount;

    // 신용조회 이력 문자열 생성
    const inquiryList = creditInfo.inquiryHistory.length > 0
      ? creditInfo.inquiryHistory.map(item =>
          `- ${item.inquiryAt} / ${item.company} / ${item.reason}`
        ).join('\n')
      : '(최근 조회 이력 없음)';

    // 템플릿 변수 치환
    const replacements: Record<string, string> = {
      '{age}': creditInfo.age.toString(),
      '{ageGroup}': creditInfo.ageGroup,
      '{estimatedAnnualIncome}': creditInfo.estimatedAnnualIncome.toLocaleString(),
      '{incomePercentile}': creditInfo.comparison.incomePercentile.toString(),
      '{creditScore}': creditInfo.creditScore.toString(),
      '{avgCreditScore}': creditInfo.comparison.avgCreditScore.toString(),
      '{scoreVsAvg}': (scoreVsAvg > 0 ? '+' : '') + scoreVsAvg.toString(),
      '{overdueCount}': creditInfo.loanInfo.overdueCount.toString(),
      '{overdueAmount}': creditInfo.loanInfo.overdueAmount.toLocaleString(),
      '{usageRate}': creditInfo.cardInfo.usageRate.toFixed(1),
      '{monthlyUsage}': creditInfo.cardInfo.monthlyUsage.toLocaleString(),
      '{totalLimit}': creditInfo.cardInfo.totalLimit.toLocaleString(),
      '{totalLoanAmount}': creditInfo.loanInfo.totalLoanAmount.toLocaleString(),
      '{avgLoanAmount}': creditInfo.comparison.avgLoanAmount.toLocaleString(),
      '{loanVsAvg}': (loanVsAvg > 0 ? '+' : '') + loanVsAvg.toLocaleString(),
      '{totalLoans}': creditInfo.loanInfo.totalLoans.toString(),
      '{inquiryList}': inquiryList,
      '{loanAccountOpened}': creditInfo.creditChanges.loanAccountOpened.toString(),
      '{loanAccountAmountChanged}': creditInfo.creditChanges.loanAccountAmountChanged.toString(),
      '{loanAccountClosed}': creditInfo.creditChanges.loanAccountClosed.toString(),
      '{cardIssued}': creditInfo.creditChanges.cardIssued.toString(),
      '{cardClosed}': creditInfo.creditChanges.cardClosed.toString(),
      '{currentScore}': creditInfo.scoreHistory.currentScore.toString(),
      '{currentScoreDate}': creditInfo.scoreHistory.currentScoreDate,
      '{previousScore}': creditInfo.scoreHistory.previousScore.toString(),
      '{previousScoreDate}': creditInfo.scoreHistory.previousScoreDate,
      '{scoreChange}': (creditInfo.scoreHistory.scoreChange > 0 ? '+' : '') + creditInfo.scoreHistory.scoreChange.toString(),
    };

    // 모든 변수 치환
    for (const [key, value] of Object.entries(replacements)) {
      template = template.replace(new RegExp(key, 'g'), value);
    }

    // 용어 사전을 프롬프트 앞에 추가
    return `${termsDict}

---

${template}`;
  }

  /**
   * Stage 2 프롬프트 생성 (Writer)
   */
  private buildStage2Prompt(creditInfo: CreditInfo, stage1Analysis: any): string {
    // 공통 용어 사전 읽기
    const termsDictPath = path.join(__dirname, '../../TERMS_DICTIONARY.md');
    const termsDict = fs.readFileSync(termsDictPath, 'utf-8');

    // Writer 문장 가이드 읽기
    const copyGuidePath = path.join(__dirname, '../../WRITER_COPY_GUIDE.md');
    const copyGuide = fs.readFileSync(copyGuidePath, 'utf-8');

    // Stage 2 템플릿 파일 읽기 (가이드라인)
    const templatePath = path.join(__dirname, '../../PROMPT_STAGE2_WRITER_V2.md');
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Stage 1 분석 결과를 JSON 문자열로 변환
    const analysisJson = JSON.stringify(stage1Analysis, null, 2);

    // 사용자 데이터 요약
    const userDataSummary = `
나이: ${creditInfo.age}세 (${creditInfo.ageGroup})
연소득: ${creditInfo.estimatedAnnualIncome.toLocaleString()}만원
신용점수: ${creditInfo.creditScore}점 (${creditInfo.ageGroup} 평균: ${creditInfo.comparison.avgCreditScore}점)
연체: ${creditInfo.loanInfo.overdueCount}건 / ${creditInfo.loanInfo.overdueAmount.toLocaleString()}만원
카드 사용률: ${creditInfo.cardInfo.usageRate.toFixed(1)}%
대출: ${creditInfo.loanInfo.totalLoans}건 / ${creditInfo.loanInfo.totalLoanAmount.toLocaleString()}만원
`.trim();

    // 용어 사전 + 문장 가이드 + 템플릿 + 실제 데이터를 결합
    return `${termsDict}

---

${copyGuide}

---

${template}

---

## 실제 입력 데이터

### Stage 1 분석 결과

\`\`\`json
${analysisJson}
\`\`\`

### 사용자 신용 데이터 요약

${userDataSummary}

---

위 분석 결과를 바탕으로 사용자 친화적인 리포트를 JSON 형식으로 작성해주세요.
반드시 순수 JSON만 출력하고, 마크다운 코드블록이나 다른 텍스트는 포함하지 마세요.`;
  }

  /**
   * 페르소나 분석 프롬프트 v4 (가드레일 강화) - 파일 기반 (Deprecated - 2-stage로 대체)
   */
  private buildPersonaPrompt(creditInfo: CreditInfo): string {
    // 템플릿 파일 읽기
    const templatePath = path.join(__dirname, '../../PROMPT_TEMPLATE.md');
    let template = fs.readFileSync(templatePath, 'utf-8');

    // 계산된 값들
    const scoreVsAvg = creditInfo.creditScore - creditInfo.comparison.avgCreditScore;
    const loanVsAvg = creditInfo.loanInfo.totalLoanAmount - creditInfo.comparison.avgLoanAmount;

    // 강점 후보 생성
    const strengthCandidates = [
      creditInfo.comparison.incomePercentile <= 20
        ? `- 상위 ${creditInfo.comparison.incomePercentile}% 소득`
        : '',
      creditInfo.cardInfo.usageRate < 30
        ? `- 카드 사용률 ${creditInfo.cardInfo.usageRate.toFixed(1)}%로 건전한 소비`
        : '',
      creditInfo.loanInfo.totalLoans <= 2
        ? `- 적은 대출 건수 (${creditInfo.loanInfo.totalLoans}건)`
        : ''
    ].filter(s => s).join('\n');

    // 신용조회 이력 문자열 생성
    const inquiryList = creditInfo.inquiryHistory.length > 0
      ? creditInfo.inquiryHistory.map(item =>
          `- ${item.inquiryAt} / ${item.company} / ${item.reason}`
        ).join('\n')
      : '(최근 조회 이력 없음)';

    // 템플릿 변수 치환
    const replacements: Record<string, string> = {
      '{age}': creditInfo.age.toString(),
      '{ageGroup}': creditInfo.ageGroup,
      '{estimatedAnnualIncome}': creditInfo.estimatedAnnualIncome.toLocaleString(),
      '{incomePercentile}': creditInfo.comparison.incomePercentile.toString(),
      '{creditScore}': creditInfo.creditScore.toString(),
      '{avgCreditScore}': creditInfo.comparison.avgCreditScore.toString(),
      '{scoreVsAvg}': (scoreVsAvg > 0 ? '+' : '') + scoreVsAvg.toString(),
      '{overdueCount}': creditInfo.loanInfo.overdueCount.toString(),
      '{overdueAmount}': creditInfo.loanInfo.overdueAmount.toLocaleString(),
      '{usageRate}': creditInfo.cardInfo.usageRate.toFixed(1),
      '{monthlyUsage}': creditInfo.cardInfo.monthlyUsage.toLocaleString(),
      '{totalLimit}': creditInfo.cardInfo.totalLimit.toLocaleString(),
      '{totalLoanAmount}': creditInfo.loanInfo.totalLoanAmount.toLocaleString(),
      '{avgLoanAmount}': creditInfo.comparison.avgLoanAmount.toLocaleString(),
      '{loanVsAvg}': (loanVsAvg > 0 ? '+' : '') + loanVsAvg.toLocaleString(),
      '{totalLoans}': creditInfo.loanInfo.totalLoans.toString(),
      // 신용조회 이력
      '{inquiryList}': inquiryList,
      // 신용변동 내역
      '{loanAccountOpened}': creditInfo.creditChanges.loanAccountOpened.toString(),
      '{loanAccountAmountChanged}': creditInfo.creditChanges.loanAccountAmountChanged.toString(),
      '{loanAccountClosed}': creditInfo.creditChanges.loanAccountClosed.toString(),
      '{cardIssued}': creditInfo.creditChanges.cardIssued.toString(),
      '{cardClosed}': creditInfo.creditChanges.cardClosed.toString(),
      // 신용점수 변동 내역
      '{currentScore}': creditInfo.scoreHistory.currentScore.toString(),
      '{currentScoreDate}': creditInfo.scoreHistory.currentScoreDate,
      '{previousScore}': creditInfo.scoreHistory.previousScore.toString(),
      '{previousScoreDate}': creditInfo.scoreHistory.previousScoreDate,
      '{scoreChange}': (creditInfo.scoreHistory.scoreChange > 0 ? '+' : '') + creditInfo.scoreHistory.scoreChange.toString(),
      // 강점 후보
      '{strengthCandidates}': strengthCandidates || '(강점 후보 없음)'
    };

    // 모든 변수 치환
    for (const [key, value] of Object.entries(replacements)) {
      template = template.replace(new RegExp(key, 'g'), value);
    }

    return template;
  }

  /**
   * 페르소나 응답 파싱
   */
  private parsePersonaResponse(response: string): LLMPersonaAnalysis {
    try {
      // JSON 부분만 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        keyIssueTitle: parsed.keyIssueTitle || '',
        keyIssueDescription: parsed.keyIssueDescription || '',
        urgencyReason: parsed.urgencyReason || '',
        actionTitle: parsed.actionTitle || '실천 방법',
        actions: parsed.actions || [],
        ctaText: parsed.ctaText || '',
        ctaDescription: parsed.ctaDescription || '',
        topStrength: parsed.topStrength || '',
        showGraph: parsed.showGraph !== false,
        graphType: parsed.graphType,
        graphData: parsed.graphData,
      };
    } catch (error) {
      console.error('페르소나 응답 파싱 실패:', error);
      throw new Error('페르소나 분석 결과를 처리하는데 실패했습니다.');
    }
  }
}

import { Card, Metric, Text, Flex, BadgeDelta, Grid, ProgressBar, BarChart, Title } from '@tremor/react';
import type { CreditInfo, LLMPersonaAnalysis } from '../types';
import './CreditReportTremor.css';

interface CreditReportProps {
  creditInfo: CreditInfo;
  llmAnalysis: LLMPersonaAnalysis;
}

export const CreditReportTremor = ({ creditInfo, llmAnalysis }: CreditReportProps) => {
  const getScoreStatus = (): 'increase' | 'moderateIncrease' | 'unchanged' | 'moderateDecrease' | 'decrease' => {
    const diff = creditInfo.scoreHistory.scoreChange;
    if (diff > 10) return 'increase';
    if (diff > 0) return 'moderateIncrease';
    if (diff === 0) return 'unchanged';
    if (diff > -10) return 'moderateDecrease';
    return 'decrease';
  };

  const getScoreLabel = () => {
    if (creditInfo.creditScore >= 800) return '최우수';
    if (creditInfo.creditScore >= 700) return '우수';
    if (creditInfo.creditScore >= 600) return '양호';
    return '주의';
  };

  const getScoreColor = () => {
    if (creditInfo.creditScore >= 800) return 'emerald';
    if (creditInfo.creditScore >= 700) return 'green';
    if (creditInfo.creditScore >= 600) return 'yellow';
    return 'red';
  };

  const scoreDiff = creditInfo.creditScore - creditInfo.comparison.avgCreditScore;

  // 카드 사용률 데이터
  const cardUsageData = [
    {
      name: '내 사용률',
      value: Math.min(creditInfo.cardInfo.usageRate, 100),
      color: creditInfo.cardInfo.usageRate > 30 ? 'red' : 'emerald'
    },
    {
      name: '30대 평균',
      value: 35,
      color: 'gray'
    },
    {
      name: '권장 수준',
      value: 30,
      color: 'slate'
    }
  ];

  // 대출 비교 데이터
  const loanComparisonData = [
    {
      category: '나의 대출',
      amount: creditInfo.loanInfo.totalLoanAmount
    },
    {
      category: '평균 대출',
      amount: creditInfo.comparison.avgLoanAmount
    }
  ];

  return (
    <div className="credit-report-tremor">
      {/* Hero 섹션 - 신용점수 */}
      <Card className="tremor-hero-card" decoration="top" decorationColor={getScoreColor()}>
        <Flex flexDirection="col" alignItems="start">
          <Text>나의 신용점수</Text>
          <Flex justifyContent="start" alignItems="baseline" className="tremor-score-row">
            <Metric>{creditInfo.creditScore}</Metric>
            <Text className="tremor-score-label">/ 1000</Text>
          </Flex>
          <Flex justifyContent="start" className="tremor-badges">
            <BadgeDelta deltaType={getScoreStatus()} size="xs">
              {creditInfo.scoreHistory.scoreChange > 0 ? '+' : ''}
              {creditInfo.scoreHistory.scoreChange}점
            </BadgeDelta>
            <Text className="tremor-score-grade">{getScoreLabel()}</Text>
          </Flex>
        </Flex>

        <Flex className="tremor-comparison">
          <div>
            <Text>또래 평균</Text>
            <Metric>{creditInfo.comparison.avgCreditScore}</Metric>
          </div>
          <div className="tremor-diff">
            <Text>차이</Text>
            <Metric className={scoreDiff > 0 ? 'positive' : 'negative'}>
              {scoreDiff > 0 ? '+' : ''}{scoreDiff}
            </Metric>
          </div>
        </Flex>
      </Card>

      {/* 핵심 인사이트 */}
      <Card className="tremor-insight-card">
        <div className="insight-header">
          <Title>{llmAnalysis.keyIssueTitle}</Title>
        </div>
        <Text className="tremor-insight-desc">{llmAnalysis.keyIssueDescription}</Text>

        {llmAnalysis.urgencyReason && (
          <div className="tremor-urgency">
            <Text className="urgency-label">⚠️ {llmAnalysis.urgencyReason}</Text>
          </div>
        )}
      </Card>

      {/* 그래프 섹션 */}
      {llmAnalysis.showGraph && llmAnalysis.graphType === 'card' && (
        <Card>
          <Title>카드 사용률 비교</Title>
          <Text>한도 대비 사용 비율</Text>

          <div className="tremor-card-usage">
            <Flex>
              <Text>월 사용액</Text>
              <Text className="tremor-value">{creditInfo.cardInfo.monthlyUsage.toLocaleString()}만원</Text>
            </Flex>
            <Flex>
              <Text>총 한도</Text>
              <Text className="tremor-value">{creditInfo.cardInfo.totalLimit.toLocaleString()}만원</Text>
            </Flex>
            <div className="tremor-usage-bar">
              <Flex>
                <Text>사용률</Text>
                <Text className={creditInfo.cardInfo.usageRate > 30 ? 'text-red-600' : 'text-emerald-600'}>
                  {creditInfo.cardInfo.usageRate.toFixed(1)}%
                </Text>
              </Flex>
              <ProgressBar
                value={Math.min(creditInfo.cardInfo.usageRate, 100)}
                color={creditInfo.cardInfo.usageRate > 30 ? 'red' : 'emerald'}
                className="tremor-progress"
              />
            </div>
          </div>

          <BarChart
            data={[
              { name: '내 사용률', value: Math.min(creditInfo.cardInfo.usageRate, 100) },
              { name: '30대 평균', value: 35 },
              { name: '권장', value: 30 }
            ]}
            index="name"
            categories={['value']}
            colors={[
              creditInfo.cardInfo.usageRate > 30 ? 'red' : 'emerald'
            ]}
            valueFormatter={(value) => `${value}%`}
            yAxisWidth={48}
            showAnimation={true}
            className="tremor-bar-chart"
          />
        </Card>
      )}

      {/* 대출 비교 */}
      {llmAnalysis.graphType === 'loan' && (
        <Card>
          <Title>대출 현황 비교</Title>
          <BarChart
            data={loanComparisonData}
            index="category"
            categories={['amount']}
            colors={['blue']}
            valueFormatter={(value) => `${value.toLocaleString()}만원`}
            yAxisWidth={80}
            showAnimation={true}
          />
        </Card>
      )}

      {/* 액션 카드 */}
      <Card className="tremor-action-card" decoration="left" decorationColor="indigo">
        <Flex flexDirection="col" alignItems="start">
          <Title>{llmAnalysis.actionTitle}</Title>
          <ul className="tremor-actions">
            {llmAnalysis.actions.map((action, idx) => (
              <li key={idx}>
                <Text>{action}</Text>
              </li>
            ))}
          </ul>
        </Flex>
      </Card>

      {/* CTA */}
      <div className="tremor-cta">
        <a
          href={llmAnalysis.ctaText ? '#' : 'https://score.pay.naver.com'}
          className="tremor-cta-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          {llmAnalysis.ctaText || '네이버페이 신용점수 확인하기'}
        </a>
        {llmAnalysis.ctaDescription && (
          <Text className="tremor-cta-desc">{llmAnalysis.ctaDescription}</Text>
        )}
      </div>
    </div>
  );
};

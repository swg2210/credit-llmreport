import type { CreditInfo, LLMPersonaAnalysis } from '../types';
import './CreditReport.css';

interface CreditReportProps {
  creditInfo: CreditInfo;
  llmAnalysis: LLMPersonaAnalysis;
}

export const CreditReport = ({ creditInfo, llmAnalysis }: CreditReportProps) => {
  const getScoreStatus = () => {
    if (creditInfo.creditScore >= 800) return 'excellent';
    if (creditInfo.creditScore >= 700) return 'good';
    if (creditInfo.creditScore >= 600) return 'fair';
    return 'poor';
  };

  const getScoreLabel = () => {
    if (creditInfo.creditScore >= 800) return '최우수';
    if (creditInfo.creditScore >= 700) return '우수';
    if (creditInfo.creditScore >= 600) return '양호';
    return '주의';
  };

  const scoreDiff = creditInfo.creditScore - creditInfo.comparison.avgCreditScore;

  // 페르소나별 CTA URL 결정
  const getCtaUrl = () => {
    const { loanInfo, cardInfo } = creditInfo;

    // 1. 연체가 있는 경우 - 대환 대출
    if (loanInfo.overdueAmount > 0) {
      return 'https://loan.pay.naver.com/n/credit';
    }

    // 2. 대출이 많은 경우 - 대환 대출
    if (loanInfo.totalLoanAmount > creditInfo.comparison.avgLoanAmount * 1.5) {
      return 'https://loan.pay.naver.com/n/credit';
    }

    // 3. 카드 한도가 낮은 경우 (500만원 미만) - 한도 높은 카드
    if (cardInfo.totalLimit > 0 && cardInfo.totalLimit < 500) {
      return 'https://card.pay.naver.com/home/pre-inquiry/agreement';
    }

    // 4. 카드 사용률이 높은 경우 (30% 초과) - 혜택 카드
    if (cardInfo.usageRate > 30) {
      return 'https://card.pay.naver.com/home?from=pc_financetab';
    }

    // 5. 카드가 없거나 사용이 없는 경우 - 혜택 카드
    if (cardInfo.totalCards === 0 || cardInfo.monthlyUsage === 0) {
      return 'https://card.pay.naver.com/home?from=pc_financetab';
    }

    // 6. 기본 - 신용점수 메인
    return 'https://score.pay.naver.com';
  };

  // 정규분포 곡선 생성 (개선된 그래프용)
  const generateNormalDistribution = (mean: number, stdDev: number = 50) => {
    const points = [];
    for (let x = mean - 3 * stdDev; x <= mean + 3 * stdDev; x += stdDev / 5) {
      const y = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
      points.push({ x, y });
    }
    return points;
  };

  const renderGraph = () => {
    if (!llmAnalysis.showGraph) return null;

    if (llmAnalysis.graphType === 'score') {
      const avgScore = creditInfo.comparison.avgCreditScore;
      const myScore = creditInfo.creditScore;
      const normalDistPoints = generateNormalDistribution(avgScore);

      // SVG 정규분포 곡선용 계산
      const maxY = Math.max(...normalDistPoints.map(p => p.y));
      const width = 280;
      const height = 100;
      const padding = 20;

      const xScale = (x: number) => {
        const minX = avgScore - 150;
        const maxX = avgScore + 150;
        return padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding);
      };

      const yScale = (y: number) => {
        return height - padding - ((y / maxY) * (height - 2 * padding));
      };

      const pathD = normalDistPoints
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`)
        .join(' ');

      return (
        <div className="premium-graph-card">
          <div className="graph-header">
            <h3 className="graph-title">신용점수 비교</h3>
            <span className="graph-subtitle">{creditInfo.ageGroup} 평균 대비</span>
          </div>

          {/* 기존 비교 그리드 */}
          <div className="score-comparison-grid">
            <div className="score-comparison-item my-score">
              <div className="comparison-label">내 점수</div>
              <div className="comparison-value">{creditInfo.creditScore}</div>
              <div className="comparison-bar">
                <div
                  className="comparison-bar-fill green"
                  style={{ width: `${(creditInfo.creditScore / 900) * 100}%` }}
                />
              </div>
            </div>

            <div className="score-comparison-item avg-score">
              <div className="comparison-label">{creditInfo.ageGroup} 평균</div>
              <div className="comparison-value">{creditInfo.comparison.avgCreditScore}</div>
              <div className="comparison-bar">
                <div
                  className="comparison-bar-fill gray"
                  style={{ width: `${(creditInfo.comparison.avgCreditScore / 900) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="score-insight">
            <div className="insight-icon">
              {scoreDiff > 0 ? '📈' : scoreDiff < 0 ? '📉' : '➡️'}
            </div>
            <div className="insight-text">
              {scoreDiff > 0
                ? `평균보다 ${Math.abs(scoreDiff)}점 높아요`
                : scoreDiff < 0
                ? `평균보다 ${Math.abs(scoreDiff)}점 낮아요`
                : '평균과 같아요'}
            </div>
          </div>

          {/* 새로 추가: 정규분포 곡선 */}
          <div className="distribution-section">
            <div className="distribution-header">
              <h4 className="distribution-title">
                {creditInfo.ageGroup} 중{' '}
                <span className="highlight-green">상위 {100 - creditInfo.comparison.incomePercentile}%</span>
              </h4>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="distribution-svg">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00DE5A" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00DE5A" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* 곡선 아래 영역 */}
              <path
                d={`${pathD} L ${xScale(normalDistPoints[normalDistPoints.length - 1].x)} ${height - padding} L ${xScale(normalDistPoints[0].x)} ${height - padding} Z`}
                fill="url(#areaGradient)"
              />

              {/* 곡선 */}
              <path
                d={pathD}
                stroke="#00DE5A"
                strokeWidth="2"
                fill="none"
              />

              {/* 평균 점수 */}
              <line
                x1={xScale(avgScore)}
                y1={padding}
                x2={xScale(avgScore)}
                y2={height - padding}
                stroke="#BDBDBD"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* 내 점수 */}
              <line
                x1={xScale(myScore)}
                y1={padding}
                x2={xScale(myScore)}
                y2={height - padding}
                stroke="#00DE5A"
                strokeWidth="2"
              />

              {/* 마커 */}
              <circle
                cx={xScale(myScore)}
                cy={yScale(normalDistPoints.find(p => Math.abs(p.x - myScore) < 15)?.y || 0.5)}
                r="4"
                fill="#00DE5A"
                stroke="white"
                strokeWidth="2"
              />
            </svg>

            <div className="distribution-labels">
              <span className="label-left">낮음</span>
              <span className="label-center">평균 {avgScore}점</span>
              <span className="label-right">높음</span>
            </div>
          </div>
        </div>
      );
    }

    if (llmAnalysis.graphType === 'card') {
      const usageRate = creditInfo.cardInfo.usageRate;
      const isHealthy = usageRate <= 30;

      return (
        <div className="premium-graph-card">
          <div className="graph-header">
            <h3 className="graph-title">카드 사용률</h3>
            <span className="graph-subtitle">한도 대비 사용 비율</span>
          </div>

          {/* 기존 원형 차트 */}
          <div className="usage-visual">
            <div className={`usage-circle ${isHealthy ? 'healthy' : 'warning'}`}>
              <svg viewBox="0 0 120 120" className="usage-circle-svg">
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00DE5A" />
                    <stop offset="100%" stopColor="#00C050" />
                  </linearGradient>
                  <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF3B30" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="54" className="usage-circle-bg" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  className="usage-circle-fill"
                  style={{
                    strokeDasharray: `${(usageRate / 100) * 339.292} 339.292`,
                  }}
                />
              </svg>
              <div className="usage-circle-content">
                <div className="usage-percentage">{usageRate.toFixed(1)}%</div>
                <div className="usage-status">{isHealthy ? '건강' : '주의'}</div>
              </div>
            </div>

            <div className="usage-details">
              <div className="usage-detail-item">
                <span className="usage-detail-label">월 사용액</span>
                <span className="usage-detail-value">{creditInfo.cardInfo.monthlyUsage.toLocaleString()}만원</span>
              </div>
              <div className="usage-detail-item">
                <span className="usage-detail-label">총 한도</span>
                <span className="usage-detail-value">{creditInfo.cardInfo.totalLimit.toLocaleString()}만원</span>
              </div>
              <div className="usage-detail-item recommendation">
                <span className="usage-detail-label">권장 사용률</span>
                <span className="usage-detail-value">30% 이하</span>
              </div>
            </div>
          </div>

          {/* 새로 추가: 또래 비교 바 차트 */}
          <div className="peer-comparison-bars">
            <h4 className="comparison-bars-title">
              {creditInfo.ageGroup} 평균 대비{' '}
              {usageRate > 30 ? (
                <span className="negative">{(usageRate - 30).toFixed(0)}%p 높음</span>
              ) : (
                <span className="positive">건전한 수준</span>
              )}
            </h4>

            <div className="bar-chart-simple">
              <div className="bar-item">
                <div className="bar-label-top">내 사용률</div>
                <div className="bar-container-vertical">
                  <div
                    className="bar-fill-vertical green"
                    style={{ height: `${Math.min(usageRate, 100)}%` }}
                  >
                    <span className="bar-value">{usageRate.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-label-top">{creditInfo.ageGroup} 평균</div>
                <div className="bar-container-vertical">
                  <div
                    className="bar-fill-vertical gray"
                    style={{ height: '35%' }}
                  >
                    <span className="bar-value">35%</span>
                  </div>
                </div>
              </div>

              <div className="bar-item">
                <div className="bar-label-top">권장</div>
                <div className="bar-container-vertical">
                  <div
                    className="bar-fill-vertical light-gray"
                    style={{ height: '30%' }}
                  >
                    <span className="bar-value">30%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (llmAnalysis.graphType === 'loan') {
      const myLoan = creditInfo.loanInfo.totalLoanAmount;
      const avgLoan = creditInfo.comparison.avgLoanAmount;
      const maxValue = Math.max(myLoan, avgLoan) * 1.2;

      return (
        <div className="premium-graph-card">
          <div className="graph-header">
            <h3 className="graph-title">대출 금액</h3>
            <span className="graph-subtitle">{creditInfo.ageGroup} 평균 대비</span>
          </div>

          {/* 개선된 가로 바 차트 */}
          <div className="loan-comparison">
            <div className="loan-item">
              <div className="loan-item-header">
                <span className="loan-label">내 대출</span>
                <span className="loan-amount">{myLoan.toLocaleString()}만원</span>
              </div>
              <div className="loan-bar-container">
                <div
                  className="loan-bar my-loan"
                  style={{ width: `${(myLoan / maxValue) * 100}%` }}
                >
                  <span className="loan-bar-label">{creditInfo.loanInfo.totalLoans}건</span>
                </div>
              </div>
            </div>

            <div className="loan-item">
              <div className="loan-item-header">
                <span className="loan-label">{creditInfo.ageGroup} 평균</span>
                <span className="loan-amount">{avgLoan.toLocaleString()}만원</span>
              </div>
              <div className="loan-bar-container">
                <div
                  className="loan-bar avg-loan"
                  style={{ width: `${(avgLoan / maxValue) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 인사이트 */}
          <div className="loan-insight">
            <div className="insight-icon">💡</div>
            <div className="insight-text">
              {myLoan < avgLoan
                ? `${creditInfo.ageGroup} 평균보다 ${(avgLoan - myLoan).toLocaleString()}만원 적습니다`
                : myLoan > avgLoan
                ? `${creditInfo.ageGroup} 평균보다 ${(myLoan - avgLoan).toLocaleString()}만원 많습니다`
                : '평균과 비슷한 수준입니다'}
            </div>
          </div>

          {creditInfo.loanInfo.overdueCount > 0 && (
            <div className="loan-alert">
              <div className="loan-alert-icon">⚠️</div>
              <div className="loan-alert-text">
                현재 {creditInfo.loanInfo.overdueCount}건의 연체가 있습니다
              </div>
            </div>
          )}
        </div>
      );
    }

    if (llmAnalysis.graphType === 'overdue') {
      const overdueCount = creditInfo.loanInfo.overdueCount;
      const overdueAmount = creditInfo.loanInfo.overdueAmount;

      return (
        <div className="premium-graph-card overdue-card">
          <div className="graph-header">
            <h3 className="graph-title">연체 현황</h3>
            <span className="graph-subtitle">즉시 해결이 필요합니다</span>
          </div>

          <div className="overdue-visual">
            <div className="overdue-alert-icon">⚠️</div>
            <div className="overdue-stats">
              <div className="overdue-stat-item">
                <div className="overdue-stat-label">연체 건수</div>
                <div className="overdue-stat-value urgent">{overdueCount}건</div>
              </div>
              <div className="overdue-stat-divider" />
              <div className="overdue-stat-item">
                <div className="overdue-stat-label">연체 금액</div>
                <div className="overdue-stat-value urgent">{overdueAmount.toLocaleString()}만원</div>
              </div>
            </div>
          </div>

          <div className="overdue-message">
            <div className="overdue-message-icon">💡</div>
            <div className="overdue-message-text">
              연체는 신용점수에 가장 큰 영향을 미치는 요소입니다.
              빠른 해결이 신용 회복의 첫 걸음입니다.
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="premium-credit-report">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-bar-content">
          <span className="status-time">
            {new Date(creditInfo.generatedAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Hero Section - 기존 구조 유지 */}
      <div className="premium-hero">
        <div className="hero-greeting">
          <span className="hero-name">{creditInfo.name}</span>님의
        </div>
        <div className="hero-title">신용점수</div>

        <div className={`score-display ${getScoreStatus()}`}>
          <div className="score-main">
            {creditInfo.creditScore}
          </div>
          <div className="score-badge">
            <span className="score-badge-text">{getScoreLabel()}</span>
          </div>
        </div>

        <div className="hero-meta">
          <div className="meta-item">
            <span className="meta-label">{creditInfo.ageGroup}</span>
          </div>
          <div className="meta-divider">·</div>
          <div className="meta-item">
            <span className="meta-label">연소득 {creditInfo.estimatedAnnualIncome.toLocaleString()}만원</span>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="premium-insight-card">
        <div className="insight-header">
          <div className="insight-icon-badge">💡</div>
          <h2 className="insight-title">{llmAnalysis.keyIssueTitle}</h2>
        </div>
        <p className="insight-description">{llmAnalysis.keyIssueDescription}</p>
      </div>

      {/* Graph - 개선됨 */}
      {renderGraph()}

      {/* Action Plan */}
      <div className="premium-action-card">
        <h3 className="action-card-title">{llmAnalysis.actionTitle}</h3>
        <div className="action-steps">
          {llmAnalysis.actions.map((action, index) => (
            <div key={index} className="action-step">
              <div className="step-number">
                <span>{index + 1}</span>
              </div>
              <div className="step-content">
                <p className="step-text">{action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <a
        href={getCtaUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="premium-cta"
      >
        <div className="cta-content">
          <span className="cta-text">{llmAnalysis.ctaText}</span>
          <span className="cta-subtitle">{llmAnalysis.ctaDescription}</span>
        </div>
        <div className="cta-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </a>

      {/* Strength */}
      <div className="premium-strength-card">
        <div className="strength-content">
          <div className="strength-icon">✨</div>
          <p className="strength-text">{llmAnalysis.topStrength}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="premium-footer">
        <p className="footer-text">AI 기반 신용 분석</p>
        <p className="footer-date">
          {new Date(creditInfo.generatedAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
};

import { useState } from 'react';
import './CreditInfoForm.css';

interface CreditInfoFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export const CreditInfoForm = ({ onSubmit, loading }: CreditInfoFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    estimatedAnnualIncome: '',
    creditScore: '',
    totalLoans: '',
    totalLoanAmount: '',
    overdueCount: '',
    overdueAmount: '',
    totalCards: '',
    totalLimit: '',
    monthlyUsage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 카드 사용률 계산
    const usageRate = formData.totalLimit && formData.monthlyUsage
      ? (parseFloat(formData.monthlyUsage) / parseFloat(formData.totalLimit)) * 100
      : 0;

    onSubmit({
      ...formData,
      usageRate,
    });
  };

  return (
    <div className="credit-form-container">
      <div className="form-hero">
        <h1 className="form-title">신용정보 입력</h1>
        <p className="form-subtitle">정보를 입력하시면 AI 기반 신용 분석 리포트를 받으실 수 있습니다</p>
      </div>

      <form onSubmit={handleSubmit} className="credit-form">
        {/* 기본 정보 */}
        <div className="form-section">
          <h2 className="section-title">기본 정보</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">이름 *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="age">나이 *</label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="30"
                min="20"
                max="100"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="estimatedAnnualIncome">연소득 (만원) *</label>
              <input
                id="estimatedAnnualIncome"
                name="estimatedAnnualIncome"
                type="number"
                value={formData.estimatedAnnualIncome}
                onChange={handleChange}
                placeholder="5000"
                min="0"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="creditScore">신용점수 *</label>
              <input
                id="creditScore"
                name="creditScore"
                type="number"
                value={formData.creditScore}
                onChange={handleChange}
                placeholder="750"
                min="300"
                max="1000"
                required
              />
            </div>
          </div>
        </div>

        {/* 대출 정보 */}
        <div className="form-section">
          <h2 className="section-title">대출 정보 (선택)</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="totalLoans">대출 건수</label>
              <input
                id="totalLoans"
                name="totalLoans"
                type="number"
                value={formData.totalLoans}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-field">
              <label htmlFor="totalLoanAmount">대출 총액 (만원)</label>
              <input
                id="totalLoanAmount"
                name="totalLoanAmount"
                type="number"
                value={formData.totalLoanAmount}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-field">
              <label htmlFor="overdueCount">연체 건수</label>
              <input
                id="overdueCount"
                name="overdueCount"
                type="number"
                value={formData.overdueCount}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-field">
              <label htmlFor="overdueAmount">연체 금액 (만원)</label>
              <input
                id="overdueAmount"
                name="overdueAmount"
                type="number"
                value={formData.overdueAmount}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* 카드 정보 */}
        <div className="form-section">
          <h2 className="section-title">카드 정보 (선택)</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="totalCards">보유 카드 수</label>
              <input
                id="totalCards"
                name="totalCards"
                type="number"
                value={formData.totalCards}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-field">
              <label htmlFor="totalLimit">총 카드 한도 (만원)</label>
              <input
                id="totalLimit"
                name="totalLimit"
                type="number"
                value={formData.totalLimit}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-field">
              <label htmlFor="monthlyUsage">월 사용액 (만원)</label>
              <input
                id="monthlyUsage"
                name="monthlyUsage"
                type="number"
                value={formData.monthlyUsage}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? '분석 중...' : '신용 리포트 받기'}
        </button>
      </form>
    </div>
  );
};

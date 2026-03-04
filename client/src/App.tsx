import { useState } from 'react';
import { CreditReport } from './components/CreditReport';
import { CreditReportTremor } from './components/CreditReportTremor';
import { CreditInfoForm } from './components/CreditInfoForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { creditApi } from './services/api';
import type { CreditInfo, LLMPersonaAnalysis } from './types';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [llmAnalysis, setLlmAnalysis] = useState<LLMPersonaAnalysis | null>(null);
  const [showForm, setShowForm] = useState(true);

  const handleFormSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await creditApi.analyzeUserInput(formData);
      setCreditInfo(response.data.creditInfo);
      setLlmAnalysis(response.data.llmAnalysis);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowForm(true);
  };

  const handleNewAnalysis = () => {
    setCreditInfo(null);
    setLlmAnalysis(null);
    setShowForm(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  if (showForm || !creditInfo || !llmAnalysis) {
    return (
      <div className="app">
        <CreditInfoForm onSubmit={handleFormSubmit} loading={loading} />
      </div>
    );
  }

  return (
    <div className="app">
      <button className="new-analysis-button" onClick={handleNewAnalysis}>
        새로운 분석하기
      </button>
      {/* Tremor 버전 사용 (기존: CreditReport) */}
      <CreditReportTremor creditInfo={creditInfo} llmAnalysis={llmAnalysis} />
    </div>
  );
}

export default App;

import './LoadingSpinner.css';

export const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <div className="loading-text">리포트 생성 중...</div>
    </div>
  );
};

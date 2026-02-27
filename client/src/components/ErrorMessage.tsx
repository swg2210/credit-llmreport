import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <div className="error-title">오류가 발생했습니다</div>
      <div className="error-message">{message}</div>
      <button className="retry-button" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  );
};

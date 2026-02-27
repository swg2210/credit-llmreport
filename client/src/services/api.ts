import type { ReportResponse, TestCaseType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const creditApi = {
  async getRandomReport(): Promise<ReportResponse> {
    const response = await fetch(`${API_BASE_URL}/api/report/llm-json`);
    if (!response.ok) {
      throw new Error('리포트 생성에 실패했습니다');
    }
    return response.json();
  },

  async getTestCaseReport(caseType: Exclude<TestCaseType, 'random'>): Promise<ReportResponse> {
    const response = await fetch(`${API_BASE_URL}/api/report/test-case-llm/${caseType}`);

    if (!response.ok) {
      throw new Error('리포트 생성에 실패했습니다');
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      throw new Error('HTML 응답이 반환되었습니다. JSON API를 사용해주세요.');
    }

    return response.json();
  },

  async analyzeUserInput(data: any): Promise<ReportResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reports/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '리포트 생성에 실패했습니다');
    }

    return response.json();
  },
};

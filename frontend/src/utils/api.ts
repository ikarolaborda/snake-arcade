import type { PaginatedScores, GameStats, ScoreEntry } from '@/types';

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getScores(limit = 10, page = 1): Promise<PaginatedScores> {
    return request(`/scores?limit=${limit}&page=${page}`);
  },

  submitScore(data: {
    name: string;
    score: number;
    duration?: number;
    moves?: number;
  }): Promise<ScoreEntry> {
    return request('/scores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStats(): Promise<GameStats> {
    return request('/scores/stats');
  },

  healthCheck(): Promise<{ status: string }> {
    return request('/health');
  },
};

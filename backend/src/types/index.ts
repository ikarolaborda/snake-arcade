export interface ScoreEntry {
  id?: number;
  name: string;
  score: number;
  duration: number;
  moves: number;
  createdAt: string;
}

export interface CreateScoreInput {
  name: string;
  score: number;
  duration?: number;
  moves?: number;
}

export interface ScoreQueryParams {
  limit?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatsResponse {
  totalGames: number;
  highestScore: number;
  averageScore: number;
  totalPlayers: number;
}

export interface ScoreRepository {
  initialize(): void;
  create(input: CreateScoreInput): ScoreEntry;
  getTopScores(limit: number, page: number): PaginatedResponse<ScoreEntry>;
  getStats(): StatsResponse;
  count(): number;
}

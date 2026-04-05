import type {
  ScoreRepository,
  ScoreEntry,
  CreateScoreInput,
  PaginatedResponse,
  StatsResponse,
} from '../types/index.js';

const MAX_NAME_LENGTH = 20;
const MIN_NAME_LENGTH = 1;
const MAX_SCORE = 999_999_999;
const MAX_DURATION = 7200;
const MAX_MOVES = 50_000;

export class ScoresService {
  constructor(private repository: ScoreRepository) {}

  createScore(input: CreateScoreInput): ScoreEntry {
    this.validateInput(input);

    const sanitized: CreateScoreInput = {
      name: this.sanitizeName(input.name),
      score: Math.floor(input.score),
      duration: Math.floor(input.duration ?? 0),
      moves: Math.floor(input.moves ?? 0),
    };

    return this.repository.create(sanitized);
  }

  getTopScores(limit: number = 10, page: number = 1): PaginatedResponse<ScoreEntry> {
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
    const safePage = Math.max(1, Math.floor(page));
    return this.repository.getTopScores(safeLimit, safePage);
  }

  getStats(): StatsResponse {
    return this.repository.getStats();
  }

  private validateInput(input: CreateScoreInput): void {
    if (!input.name || typeof input.name !== 'string') {
      throw new ValidationError('Name is required and must be a string');
    }

    const trimmed = input.name.trim();
    if (trimmed.length < MIN_NAME_LENGTH || trimmed.length > MAX_NAME_LENGTH) {
      throw new ValidationError(
        `Name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`
      );
    }

    if (typeof input.score !== 'number' || !Number.isFinite(input.score)) {
      throw new ValidationError('Score must be a valid number');
    }

    if (input.score < 0 || input.score > MAX_SCORE) {
      throw new ValidationError(`Score must be between 0 and ${MAX_SCORE}`);
    }

    if (input.duration !== undefined) {
      if (typeof input.duration !== 'number' || input.duration < 0 || input.duration > MAX_DURATION) {
        throw new ValidationError(`Duration must be between 0 and ${MAX_DURATION} seconds`);
      }
    }

    if (input.moves !== undefined) {
      if (typeof input.moves !== 'number' || input.moves < 0 || input.moves > MAX_MOVES) {
        throw new ValidationError(`Moves must be between 0 and ${MAX_MOVES}`);
      }
    }
  }

  private sanitizeName(name: string): string {
    return name.trim().replace(/[<>&"'\/\\]/g, '').substring(0, MAX_NAME_LENGTH);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteScoreRepository } from '../src/repositories/sqlite.repository.js';
import { ScoresService, ValidationError } from '../src/services/scores.service.js';

let repository: SqliteScoreRepository;
let service: ScoresService;

beforeEach(() => {
  repository = new SqliteScoreRepository(':memory:');
  service = new ScoresService(repository);
});

afterEach(() => {
  repository.close();
});

describe('ScoresService - createScore', () => {
  it('creates a valid score', () => {
    const result = service.createScore({ name: 'Player1', score: 100 });
    expect(result.name).toBe('Player1');
    expect(result.score).toBe(100);
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });

  it('creates score with optional fields', () => {
    const result = service.createScore({
      name: 'Player1',
      score: 200,
      duration: 120,
      moves: 500,
    });
    expect(result.duration).toBe(120);
    expect(result.moves).toBe(500);
  });

  it('trims and sanitizes player name', () => {
    const result = service.createScore({ name: '  <Player>  ', score: 50 });
    expect(result.name).toBe('Player');
  });

  it('rejects empty name', () => {
    expect(() => service.createScore({ name: '', score: 100 }))
      .toThrow(ValidationError);
  });

  it('rejects whitespace-only name', () => {
    expect(() => service.createScore({ name: '   ', score: 100 }))
      .toThrow(ValidationError);
  });

  it('rejects name exceeding max length', () => {
    expect(() => service.createScore({ name: 'A'.repeat(21), score: 100 }))
      .toThrow(ValidationError);
  });

  it('rejects negative score', () => {
    expect(() => service.createScore({ name: 'Test', score: -1 }))
      .toThrow(ValidationError);
  });

  it('rejects score above maximum', () => {
    expect(() => service.createScore({ name: 'Test', score: 1_000_000_000 }))
      .toThrow(ValidationError);
  });

  it('rejects NaN score', () => {
    expect(() => service.createScore({ name: 'Test', score: NaN }))
      .toThrow(ValidationError);
  });

  it('rejects Infinity score', () => {
    expect(() => service.createScore({ name: 'Test', score: Infinity }))
      .toThrow(ValidationError);
  });

  it('rejects negative duration', () => {
    expect(() => service.createScore({ name: 'Test', score: 100, duration: -1 }))
      .toThrow(ValidationError);
  });

  it('rejects negative moves', () => {
    expect(() => service.createScore({ name: 'Test', score: 100, moves: -1 }))
      .toThrow(ValidationError);
  });

  it('floors decimal score', () => {
    const result = service.createScore({ name: 'Test', score: 99.9 });
    expect(result.score).toBe(99);
  });
});

describe('ScoresService - getTopScores', () => {
  beforeEach(() => {
    const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    names.forEach((name, i) => {
      service.createScore({ name, score: (i + 1) * 100 });
    });
  });

  it('returns scores sorted by score descending', () => {
    const result = service.getTopScores(10, 1);
    expect(result.data).toHaveLength(5);
    expect(result.data[0].score).toBe(500);
    expect(result.data[4].score).toBe(100);
  });

  it('respects limit parameter', () => {
    const result = service.getTopScores(3, 1);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
  });

  it('paginates correctly', () => {
    const page1 = service.getTopScores(2, 1);
    const page2 = service.getTopScores(2, 2);
    expect(page1.data).toHaveLength(2);
    expect(page2.data).toHaveLength(2);
    expect(page1.data[0].score).toBeGreaterThan(page2.data[0].score);
  });

  it('returns correct pagination metadata', () => {
    const result = service.getTopScores(2, 1);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it('caps limit at 100', () => {
    const result = service.getTopScores(200, 1);
    expect(result.limit).toBe(100);
  });

  it('defaults limit to at least 1', () => {
    const result = service.getTopScores(0, 1);
    expect(result.limit).toBe(1);
  });
});

describe('ScoresService - getStats', () => {
  it('returns zeros for empty database', () => {
    const stats = service.getStats();
    expect(stats.totalGames).toBe(0);
    expect(stats.highestScore).toBe(0);
    expect(stats.totalPlayers).toBe(0);
  });

  it('returns correct aggregate stats', () => {
    service.createScore({ name: 'A', score: 100 });
    service.createScore({ name: 'A', score: 300 });
    service.createScore({ name: 'B', score: 200 });

    const stats = service.getStats();
    expect(stats.totalGames).toBe(3);
    expect(stats.highestScore).toBe(300);
    expect(stats.totalPlayers).toBe(2);
    expect(stats.averageScore).toBe(200);
  });
});

describe('SqliteScoreRepository', () => {
  it('counts entries correctly', () => {
    expect(repository.count()).toBe(0);
    repository.create({ name: 'Test', score: 100 });
    expect(repository.count()).toBe(1);
  });

  it('returns entries with auto-generated ids', () => {
    const entry1 = repository.create({ name: 'A', score: 100 });
    const entry2 = repository.create({ name: 'B', score: 200 });
    expect(entry1.id).toBeDefined();
    expect(entry2.id).toBeDefined();
    expect(entry2.id).toBeGreaterThan(entry1.id!);
  });
});

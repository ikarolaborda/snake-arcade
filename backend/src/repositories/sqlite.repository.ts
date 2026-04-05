import Database from 'better-sqlite3';
import { config } from '../config.js';
import type {
  ScoreRepository,
  ScoreEntry,
  CreateScoreInput,
  PaginatedResponse,
  StatsResponse,
} from '../types/index.js';

export class SqliteScoreRepository implements ScoreRepository {
  private db: Database.Database;

  constructor(dbPath?: string) {
    this.db = new Database(dbPath ?? config.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initialize();
  }

  initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        duration INTEGER NOT NULL DEFAULT 0,
        moves INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC)
    `);
  }

  create(input: CreateScoreInput): ScoreEntry {
    const stmt = this.db.prepare(`
      INSERT INTO scores (name, score, duration, moves, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(
      input.name,
      input.score,
      input.duration ?? 0,
      input.moves ?? 0
    );

    return this.getById(result.lastInsertRowid as number)!;
  }

  getTopScores(limit: number = 10, page: number = 1): PaginatedResponse<ScoreEntry> {
    const offset = (page - 1) * limit;
    const total = this.count();

    const stmt = this.db.prepare(`
      SELECT id, name, score, duration, moves, created_at as createdAt
      FROM scores
      ORDER BY score DESC, created_at ASC
      LIMIT ? OFFSET ?
    `);

    const data = stmt.all(limit, offset) as ScoreEntry[];

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  getStats(): StatsResponse {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as totalGames,
        COALESCE(MAX(score), 0) as highestScore,
        COALESCE(ROUND(AVG(score), 1), 0) as averageScore,
        COUNT(DISTINCT name) as totalPlayers
      FROM scores
    `);

    return stmt.get() as StatsResponse;
  }

  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM scores');
    return (stmt.get() as { count: number }).count;
  }

  private getById(id: number): ScoreEntry | undefined {
    const stmt = this.db.prepare(`
      SELECT id, name, score, duration, moves, created_at as createdAt
      FROM scores
      WHERE id = ?
    `);
    return stmt.get(id) as ScoreEntry | undefined;
  }

  close(): void {
    this.db.close();
  }
}

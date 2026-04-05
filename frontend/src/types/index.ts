export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'gameover';

export type SpecialFoodType = 'spider' | 'blue';

export interface SpecialFood {
  position: Position;
  type: SpecialFoodType;
  spawnedAt: number;
  lifetime: number;
}

export interface LevelDefinition {
  threshold: number;
  pointsPerFood: number;
  speed: number;
}

export const LEVEL_TABLE: readonly LevelDefinition[] = [
  { threshold: 0,       pointsPerFood: 10,  speed: 200 },
  { threshold: 500,     pointsPerFood: 15,  speed: 180 },
  { threshold: 1_500,   pointsPerFood: 20,  speed: 160 },
  { threshold: 3_500,   pointsPerFood: 30,  speed: 145 },
  { threshold: 7_000,   pointsPerFood: 40,  speed: 130 },
  { threshold: 12_000,  pointsPerFood: 55,  speed: 118 },
  { threshold: 20_000,  pointsPerFood: 75,  speed: 106 },
  { threshold: 32_000,  pointsPerFood: 100, speed: 95 },
  { threshold: 50_000,  pointsPerFood: 130, speed: 85 },
  { threshold: 75_000,  pointsPerFood: 170, speed: 76 },
  { threshold: 110_000, pointsPerFood: 220, speed: 68 },
  { threshold: 160_000, pointsPerFood: 280, speed: 62 },
  { threshold: 230_000, pointsPerFood: 350, speed: 57 },
  { threshold: 330_000, pointsPerFood: 440, speed: 53 },
  { threshold: 480_000, pointsPerFood: 550, speed: 50 },
];

export function getLevelForScore(score: number): number {
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (score >= LEVEL_TABLE[i].threshold) return i + 1;
  }
  return 1;
}

export function getLevelDefinition(level: number): LevelDefinition {
  const idx = Math.max(0, Math.min(level - 1, LEVEL_TABLE.length - 1));
  return LEVEL_TABLE[idx];
}

export interface GameConfig {
  rows: number;
  cols: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  rows: 20,
  cols: 20,
};

export const DIRECTION_DELTAS: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export interface ScoreEntry {
  id: number;
  name: string;
  score: number;
  duration: number;
  moves: number;
  createdAt: string;
}

export interface PaginatedScores {
  data: ScoreEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GameStats {
  totalGames: number;
  highestScore: number;
  averageScore: number;
  totalPlayers: number;
}

export type CellType = 'empty' | 'snake-head' | 'snake-body' | 'food' | 'spider-food' | 'blue-food';

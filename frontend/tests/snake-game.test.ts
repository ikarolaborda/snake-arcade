import { describe, it, expect } from 'vitest';
import {
  wrapPosition,
  positionsEqual,
  spawnFood,
  createInitialSnake,
} from '../src/composables/useSnakeGame';
import { DIRECTION_DELTAS, OPPOSITE_DIRECTIONS, LEVEL_TABLE, getLevelForScore, getLevelDefinition } from '../src/types';
import type { Position, Direction } from '../src/types';

describe('wrapPosition', () => {
  const rows = 20;
  const cols = 20;

  it('wraps left edge to right', () => {
    const result = wrapPosition({ x: -1, y: 5 }, rows, cols);
    expect(result).toEqual({ x: 19, y: 5 });
  });

  it('wraps right edge to left', () => {
    const result = wrapPosition({ x: 20, y: 5 }, rows, cols);
    expect(result).toEqual({ x: 0, y: 5 });
  });

  it('wraps top edge to bottom', () => {
    const result = wrapPosition({ x: 5, y: -1 }, rows, cols);
    expect(result).toEqual({ x: 5, y: 19 });
  });

  it('wraps bottom edge to top', () => {
    const result = wrapPosition({ x: 5, y: 20 }, rows, cols);
    expect(result).toEqual({ x: 5, y: 0 });
  });

  it('wraps both axes simultaneously', () => {
    const result = wrapPosition({ x: -1, y: -1 }, rows, cols);
    expect(result).toEqual({ x: 19, y: 19 });
  });

  it('does not change positions within bounds', () => {
    const result = wrapPosition({ x: 10, y: 10 }, rows, cols);
    expect(result).toEqual({ x: 10, y: 10 });
  });

  it('handles position at zero correctly', () => {
    const result = wrapPosition({ x: 0, y: 0 }, rows, cols);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('handles position at max edge correctly', () => {
    const result = wrapPosition({ x: 19, y: 19 }, rows, cols);
    expect(result).toEqual({ x: 19, y: 19 });
  });
});

describe('positionsEqual', () => {
  it('returns true for identical positions', () => {
    expect(positionsEqual({ x: 5, y: 10 }, { x: 5, y: 10 })).toBe(true);
  });

  it('returns false for different positions', () => {
    expect(positionsEqual({ x: 5, y: 10 }, { x: 5, y: 11 })).toBe(false);
  });

  it('returns false when only x differs', () => {
    expect(positionsEqual({ x: 5, y: 10 }, { x: 6, y: 10 })).toBe(false);
  });
});

describe('createInitialSnake', () => {
  it('creates a snake of length 3', () => {
    const snake = createInitialSnake(20, 20);
    expect(snake).toHaveLength(3);
  });

  it('places snake at center facing right', () => {
    const snake = createInitialSnake(20, 20);
    expect(snake[0].x).toBeGreaterThan(snake[1].x);
    expect(snake[1].x).toBeGreaterThan(snake[2].x);
    expect(snake[0].y).toBe(snake[1].y);
    expect(snake[1].y).toBe(snake[2].y);
  });

  it('positions snake in center of board', () => {
    const snake = createInitialSnake(20, 20);
    expect(snake[0].y).toBe(10);
    expect(snake[0].x).toBe(10);
  });
});

describe('spawnFood', () => {
  it('does not spawn food on the snake', () => {
    const snake: Position[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];

    for (let i = 0; i < 50; i++) {
      const food = spawnFood(snake, 20, 20);
      const onSnake = snake.some(s => positionsEqual(s, food));
      expect(onSnake).toBe(false);
    }
  });

  it('returns a valid position within bounds', () => {
    const snake: Position[] = [{ x: 0, y: 0 }];
    const food = spawnFood(snake, 20, 20);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(20);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(20);
  });

  it('handles almost-full board', () => {
    const snake: Position[] = [];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (x === 2 && y === 2) continue;
        snake.push({ x, y });
      }
    }
    const food = spawnFood(snake, 3, 3);
    expect(food).toEqual({ x: 2, y: 2 });
  });
});

describe('DIRECTION_DELTAS', () => {
  it('UP moves y by -1', () => {
    expect(DIRECTION_DELTAS.UP).toEqual({ x: 0, y: -1 });
  });

  it('DOWN moves y by +1', () => {
    expect(DIRECTION_DELTAS.DOWN).toEqual({ x: 0, y: 1 });
  });

  it('LEFT moves x by -1', () => {
    expect(DIRECTION_DELTAS.LEFT).toEqual({ x: -1, y: 0 });
  });

  it('RIGHT moves x by +1', () => {
    expect(DIRECTION_DELTAS.RIGHT).toEqual({ x: 1, y: 0 });
  });
});

describe('OPPOSITE_DIRECTIONS', () => {
  it('correctly maps all opposites', () => {
    const pairs: [Direction, Direction][] = [
      ['UP', 'DOWN'],
      ['DOWN', 'UP'],
      ['LEFT', 'RIGHT'],
      ['RIGHT', 'LEFT'],
    ];

    for (const [dir, opp] of pairs) {
      expect(OPPOSITE_DIRECTIONS[dir]).toBe(opp);
    }
  });
});

describe('LEVEL_TABLE and level helpers', () => {
  it('has strictly ascending thresholds', () => {
    for (let i = 1; i < LEVEL_TABLE.length; i++) {
      expect(LEVEL_TABLE[i].threshold).toBeGreaterThan(LEVEL_TABLE[i - 1].threshold);
    }
  });

  it('has strictly increasing pointsPerFood', () => {
    for (let i = 1; i < LEVEL_TABLE.length; i++) {
      expect(LEVEL_TABLE[i].pointsPerFood).toBeGreaterThan(LEVEL_TABLE[i - 1].pointsPerFood);
    }
  });

  it('has strictly decreasing speed (faster at higher levels)', () => {
    for (let i = 1; i < LEVEL_TABLE.length; i++) {
      expect(LEVEL_TABLE[i].speed).toBeLessThan(LEVEL_TABLE[i - 1].speed);
    }
  });

  it('first level starts at threshold 0', () => {
    expect(LEVEL_TABLE[0].threshold).toBe(0);
  });

  it('getLevelForScore returns 1 for score 0', () => {
    expect(getLevelForScore(0)).toBe(1);
  });

  it('getLevelForScore returns correct level at exact threshold', () => {
    expect(getLevelForScore(500)).toBe(2);
    expect(getLevelForScore(1_500)).toBe(3);
    expect(getLevelForScore(50_000)).toBe(9);
  });

  it('getLevelForScore returns correct level between thresholds', () => {
    expect(getLevelForScore(250)).toBe(1);
    expect(getLevelForScore(999)).toBe(2);
    expect(getLevelForScore(100_000)).toBe(10);
  });

  it('getLevelForScore returns max level for very high scores', () => {
    expect(getLevelForScore(999_999_999)).toBe(LEVEL_TABLE.length);
  });

  it('getLevelDefinition returns correct definition', () => {
    const def1 = getLevelDefinition(1);
    expect(def1.threshold).toBe(0);
    expect(def1.pointsPerFood).toBe(10);
    expect(def1.speed).toBe(200);

    const defMax = getLevelDefinition(LEVEL_TABLE.length);
    expect(defMax.speed).toBe(LEVEL_TABLE[LEVEL_TABLE.length - 1].speed);
  });

  it('getLevelDefinition clamps out-of-range levels', () => {
    expect(getLevelDefinition(0)).toEqual(LEVEL_TABLE[0]);
    expect(getLevelDefinition(100)).toEqual(LEVEL_TABLE[LEVEL_TABLE.length - 1]);
  });
});

describe('snake movement with wrap-around', () => {
  it('simulates moving right off the edge and wrapping', () => {
    const snake: Position[] = [
      { x: 19, y: 10 },
      { x: 18, y: 10 },
      { x: 17, y: 10 },
    ];

    const head = snake[0];
    const delta = DIRECTION_DELTAS.RIGHT;
    const newHead = wrapPosition(
      { x: head.x + delta.x, y: head.y + delta.y },
      20, 20
    );

    expect(newHead).toEqual({ x: 0, y: 10 });
  });

  it('simulates moving up off the edge and wrapping', () => {
    const snake: Position[] = [
      { x: 10, y: 0 },
      { x: 10, y: 1 },
      { x: 10, y: 2 },
    ];

    const head = snake[0];
    const delta = DIRECTION_DELTAS.UP;
    const newHead = wrapPosition(
      { x: head.x + delta.x, y: head.y + delta.y },
      20, 20
    );

    expect(newHead).toEqual({ x: 10, y: 19 });
  });

  it('self-collision detection works', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 6, y: 5 },
    ];

    const newHead = { x: 5, y: 6 };
    const hitsBody = snake.some((seg, i) => i > 0 && positionsEqual(seg, newHead));
    expect(hitsBody).toBe(true);
  });

  it('no false collision for normal movement', () => {
    const snake: Position[] = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];

    const newHead = { x: 6, y: 5 };
    const hitsBody = snake.some((seg, i) => i > 0 && positionsEqual(seg, newHead));
    expect(hitsBody).toBe(false);
  });
});

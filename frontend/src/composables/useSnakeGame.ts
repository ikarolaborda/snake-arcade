import { ref, computed, readonly, onUnmounted } from 'vue';
import type { Position, Direction, GameStatus, GameConfig, SpecialFood, SpecialFoodType } from '@/types';
import { DEFAULT_CONFIG, DIRECTION_DELTAS, OPPOSITE_DIRECTIONS, LEVEL_TABLE, getLevelForScore, getLevelDefinition } from '@/types';

const SPECIAL_FOOD_SPAWN_CHANCE = 0.22;
const SPECIAL_FOOD_MIN_LIFETIME = 5000;
const SPECIAL_FOOD_MAX_LIFETIME = 8000;
const BLUE_FOOD_SLOW_DURATION = 6000;
const BLUE_FOOD_SPEED_FACTOR = 1.667;
const SPIDER_FOOD_SCORE_MULTIPLIER = 3;
const COLLISION_GRACE_MS = 120;

function wrapPosition(pos: Position, rows: number, cols: number): Position {
  return {
    x: ((pos.x % cols) + cols) % cols,
    y: ((pos.y % rows) + rows) % rows,
  };
}

function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function createInitialSnake(rows: number, cols: number): Position[] {
  const midY = Math.floor(rows / 2);
  const midX = Math.floor(cols / 2);
  return [
    { x: midX, y: midY },
    { x: midX - 1, y: midY },
    { x: midX - 2, y: midY },
  ];
}

function spawnFood(snake: Position[], rows: number, cols: number, exclude?: Position): Position {
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`));
  if (exclude) occupied.add(`${exclude.x},${exclude.y}`);
  const available: Position[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) return { x: 0, y: 0 };
  return available[Math.floor(Math.random() * available.length)];
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function useSnakeGame(overrides?: Partial<GameConfig>) {
  const config: GameConfig = { ...DEFAULT_CONFIG, ...overrides };

  const snake = ref<Position[]>([]);
  const food = ref<Position>({ x: 0, y: 0 });
  const specialFood = ref<SpecialFood | null>(null);
  const direction = ref<Direction>('RIGHT');
  const status = ref<GameStatus>('idle');
  const score = ref(0);
  const moveCount = ref(0);
  const elapsedTime = ref(0);
  const bestScore = ref(0);
  const countdownValue = ref(0);
  const lastEatTime = ref(0);
  const lastSpecialEatType = ref<SpecialFoodType | null>(null);
  const blueEffectActive = ref(false);

  let gameLoopId: ReturnType<typeof setInterval> | null = null;
  let timeLoopId: ReturnType<typeof setInterval> | null = null;
  let countdownId: ReturnType<typeof setInterval> | null = null;
  let specialFoodTimerId: ReturnType<typeof setTimeout> | null = null;
  let blueEffectTimerId: ReturnType<typeof setTimeout> | null = null;
  let collisionGraceId: ReturnType<typeof setTimeout> | null = null;
  let graceHeadPos: Position | null = null;
  let gameStartTimestamp = 0;
  let pausedElapsed = 0;
  let blueEffectRemainingOnPause = 0;
  const directionQueue: Direction[] = [];

  const level = computed(() => getLevelForScore(score.value));
  const currentLevelDef = computed(() => getLevelDefinition(level.value));

  const currentSpeed = computed(() => {
    const base = currentLevelDef.value.speed;
    return blueEffectActive.value ? Math.round(base * BLUE_FOOD_SPEED_FACTOR) : base;
  });

  const levelProgress = computed(() => {
    const idx = level.value - 1;
    if (idx >= LEVEL_TABLE.length - 1) return 100;
    const currentThreshold = LEVEL_TABLE[idx].threshold;
    const nextThreshold = LEVEL_TABLE[idx + 1].threshold;
    return Math.min(100, Math.floor(((score.value - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
  });

  const isNewBest = computed(() => score.value > 0 && score.value >= bestScore.value);

  const savedBest = localStorage.getItem('snake-best-score');
  if (savedBest) bestScore.value = parseInt(savedBest, 10) || 0;

  function wouldSelfCollide(pos: Position): boolean {
    return snake.value.some((seg, i) => i > 0 && positionsEqual(seg, pos))
      || (snake.value.length > 1 && positionsEqual(snake.value[0], pos));
  }

  function headForDirection(head: Position, dir: Direction): Position {
    const delta = DIRECTION_DELTAS[dir];
    return wrapPosition(
      { x: head.x + delta.x, y: head.y + delta.y },
      config.rows, config.cols
    );
  }

  function tryRescueFromQueue(head: Position): { dir: Direction; newHead: Position } | null {
    while (directionQueue.length > 0) {
      const candidate = directionQueue.shift()!;
      if (OPPOSITE_DIRECTIONS[candidate] === direction.value) continue;

      const testHead = headForDirection(head, candidate);
      if (!wouldSelfCollide(testHead)) {
        return { dir: candidate, newHead: testHead };
      }
    }
    return null;
  }

  function initGame(): void {
    snake.value = createInitialSnake(config.rows, config.cols);
    food.value = spawnFood(snake.value, config.rows, config.cols);
    specialFood.value = null;
    direction.value = 'RIGHT';
    directionQueue.length = 0;
    score.value = 0;
    moveCount.value = 0;
    elapsedTime.value = 0;
    pausedElapsed = 0;
    lastEatTime.value = 0;
    lastSpecialEatType.value = null;
    blueEffectActive.value = false;
    blueEffectRemainingOnPause = 0;
    graceHeadPos = null;
    clearSpecialTimers();
    clearCollisionGrace();
  }

  function startGame(): void {
    stopAllTimers();
    initGame();
    status.value = 'countdown';
    countdownValue.value = 3;

    countdownId = setInterval(() => {
      countdownValue.value--;
      if (countdownValue.value <= 0) {
        if (countdownId) clearInterval(countdownId);
        countdownId = null;
        status.value = 'playing';
        gameStartTimestamp = Date.now();
        startGameLoop();
        startTimeLoop();
      }
    }, 600);
  }

  function startGameLoop(): void {
    stopGameLoop();
    gameLoopId = setInterval(tick, currentSpeed.value);
  }

  function stopGameLoop(): void {
    if (gameLoopId !== null) {
      clearInterval(gameLoopId);
      gameLoopId = null;
    }
  }

  function startTimeLoop(): void {
    stopTimeLoop();
    timeLoopId = setInterval(() => {
      if (status.value === 'playing') {
        elapsedTime.value = Math.floor((Date.now() - gameStartTimestamp) / 1000);
        checkSpecialFoodExpiry();
      }
    }, 250);
  }

  function stopTimeLoop(): void {
    if (timeLoopId !== null) {
      clearInterval(timeLoopId);
      timeLoopId = null;
    }
  }

  function clearSpecialTimers(): void {
    if (specialFoodTimerId) { clearTimeout(specialFoodTimerId); specialFoodTimerId = null; }
    if (blueEffectTimerId) { clearTimeout(blueEffectTimerId); blueEffectTimerId = null; }
  }

  function clearCollisionGrace(): void {
    if (collisionGraceId) { clearTimeout(collisionGraceId); collisionGraceId = null; }
    graceHeadPos = null;
  }

  function stopAllTimers(): void {
    stopGameLoop();
    stopTimeLoop();
    clearSpecialTimers();
    clearCollisionGrace();
    if (countdownId) { clearInterval(countdownId); countdownId = null; }
  }

  function checkSpecialFoodExpiry(): void {
    if (specialFood.value) {
      const age = Date.now() - specialFood.value.spawnedAt;
      if (age >= specialFood.value.lifetime) {
        specialFood.value = null;
      }
    }
  }

  function trySpawnSpecialFood(): void {
    if (specialFood.value) return;
    if (Math.random() > SPECIAL_FOOD_SPAWN_CHANCE) return;

    const type: SpecialFoodType = Math.random() < 0.5 ? 'spider' : 'blue';
    const lifetime = randomBetween(SPECIAL_FOOD_MIN_LIFETIME, SPECIAL_FOOD_MAX_LIFETIME);
    const position = spawnFood(snake.value, config.rows, config.cols, food.value);

    specialFood.value = {
      position,
      type,
      spawnedAt: Date.now(),
      lifetime,
    };

    specialFoodTimerId = setTimeout(() => {
      specialFood.value = null;
      specialFoodTimerId = null;
    }, lifetime);
  }

  function activateBlueEffect(): void {
    blueEffectActive.value = true;
    if (blueEffectTimerId) clearTimeout(blueEffectTimerId);

    blueEffectTimerId = setTimeout(() => {
      blueEffectActive.value = false;
      blueEffectTimerId = null;
      if (status.value === 'playing') startGameLoop();
    }, BLUE_FOOD_SLOW_DURATION);

    startGameLoop();
  }

  function applyMovement(newHead: Position): void {
    const prevSpeed = currentSpeed.value;
    const ateFood = positionsEqual(newHead, food.value);
    const ateSpecial = specialFood.value && positionsEqual(newHead, specialFood.value.position);
    const newSnake = [newHead, ...snake.value];

    if (!ateFood && !ateSpecial) {
      newSnake.pop();
    }

    if (ateFood) {
      score.value += currentLevelDef.value.pointsPerFood;
      lastEatTime.value = Date.now();
      lastSpecialEatType.value = null;
      food.value = spawnFood(
        newSnake, config.rows, config.cols,
        specialFood.value?.position
      );
      trySpawnSpecialFood();
      if (currentSpeed.value !== prevSpeed) startGameLoop();
    }

    if (ateSpecial) {
      const specialType = specialFood.value!.type;
      lastSpecialEatType.value = specialType;
      lastEatTime.value = Date.now();

      if (specialType === 'spider') {
        score.value += currentLevelDef.value.pointsPerFood * SPIDER_FOOD_SCORE_MULTIPLIER;
        if (currentSpeed.value !== prevSpeed) startGameLoop();
      } else {
        activateBlueEffect();
      }

      specialFood.value = null;
      if (specialFoodTimerId) { clearTimeout(specialFoodTimerId); specialFoodTimerId = null; }
    }

    snake.value = newSnake;
    moveCount.value++;
  }

  function enterCollisionGrace(head: Position): void {
    stopGameLoop();
    graceHeadPos = head;

    collisionGraceId = setTimeout(() => {
      collisionGraceId = null;
      if (status.value !== 'playing') { graceHeadPos = null; return; }

      const rescue = tryRescueFromQueue(head);
      if (rescue) {
        direction.value = rescue.dir;
        graceHeadPos = null;
        applyMovement(rescue.newHead);
        startGameLoop();
      } else {
        graceHeadPos = null;
        endGame();
      }
    }, COLLISION_GRACE_MS);
  }

  function tick(): void {
    if (status.value !== 'playing') return;

    if (directionQueue.length > 0) {
      const next = directionQueue.shift()!;
      if (OPPOSITE_DIRECTIONS[next] !== direction.value) {
        direction.value = next;
      }
    }

    const head = snake.value[0];
    let newHead = headForDirection(head, direction.value);

    if (wouldSelfCollide(newHead)) {
      const rescue = tryRescueFromQueue(head);
      if (rescue) {
        direction.value = rescue.dir;
        newHead = rescue.newHead;
      } else {
        enterCollisionGrace(head);
        return;
      }
    }

    applyMovement(newHead);
  }

  function changeDirection(dir: Direction): void {
    if (status.value !== 'playing') return;

    const lastDir = directionQueue.length > 0
      ? directionQueue[directionQueue.length - 1]
      : direction.value;

    if (dir !== lastDir && OPPOSITE_DIRECTIONS[dir] !== lastDir) {
      directionQueue.push(dir);
      if (directionQueue.length > 2) directionQueue.length = 2;
    }

    if (graceHeadPos) {
      const testHead = headForDirection(graceHeadPos, dir);
      if (!wouldSelfCollide(testHead)) {
        clearCollisionGrace();
        direction.value = dir;
        directionQueue.length = 0;
        applyMovement(testHead);
        startGameLoop();
      }
    }
  }

  function pause(): void {
    if (status.value !== 'playing') return;
    status.value = 'paused';
    pausedElapsed = elapsedTime.value;
    stopGameLoop();
    stopTimeLoop();
    clearCollisionGrace();

    if (blueEffectActive.value && blueEffectTimerId) {
      blueEffectRemainingOnPause = Math.max(0,
        BLUE_FOOD_SLOW_DURATION - (Date.now() - (specialFood.value?.spawnedAt ?? Date.now()))
      );
      clearTimeout(blueEffectTimerId);
      blueEffectTimerId = null;
    }
  }

  function resume(): void {
    if (status.value !== 'paused') return;
    status.value = 'playing';
    gameStartTimestamp = Date.now() - pausedElapsed * 1000;
    startGameLoop();
    startTimeLoop();

    if (blueEffectActive.value && blueEffectRemainingOnPause > 0) {
      blueEffectTimerId = setTimeout(() => {
        blueEffectActive.value = false;
        blueEffectTimerId = null;
        if (status.value === 'playing') startGameLoop();
      }, blueEffectRemainingOnPause);
    }
  }

  function togglePause(): void {
    if (status.value === 'playing') pause();
    else if (status.value === 'paused') resume();
  }

  function endGame(): void {
    status.value = 'gameover';
    stopAllTimers();
    if (score.value > bestScore.value) {
      bestScore.value = score.value;
      localStorage.setItem('snake-best-score', String(score.value));
    }
  }

  onUnmounted(stopAllTimers);

  return {
    snake: readonly(snake),
    food: readonly(food),
    specialFood: readonly(specialFood),
    direction: readonly(direction),
    status: readonly(status),
    score: readonly(score),
    level,
    moveCount: readonly(moveCount),
    elapsedTime: readonly(elapsedTime),
    bestScore: readonly(bestScore),
    countdownValue: readonly(countdownValue),
    lastEatTime: readonly(lastEatTime),
    lastSpecialEatType: readonly(lastSpecialEatType),
    blueEffectActive: readonly(blueEffectActive),
    currentSpeed,
    levelProgress,
    isNewBest,
    config,
    startGame,
    pause,
    resume,
    togglePause,
    changeDirection,
  };
}

export { wrapPosition, positionsEqual, spawnFood, createInitialSnake };

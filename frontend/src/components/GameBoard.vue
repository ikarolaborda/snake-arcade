<script setup lang="ts">
import { computed } from 'vue';
import type { Position, Direction, GameStatus, CellType, SpecialFood } from '@/types';
import { useResponsiveBoard } from '@/composables/useResponsiveBoard';

const props = defineProps<{
  snake: readonly Position[];
  food: Position;
  specialFood: SpecialFood | null;
  rows: number;
  cols: number;
  direction: Direction;
  status: GameStatus;
  blueEffectActive: boolean;
}>();

const { boardRef, cellSize, boardWidth, boardHeight } = useResponsiveBoard(props.rows, props.cols);

interface CellData {
  x: number;
  y: number;
  type: CellType;
}

const cells = computed<CellData[]>(() => {
  const snakeSet = new Map<string, number>();
  props.snake.forEach((pos, i) => {
    snakeSet.set(`${pos.x},${pos.y}`, i);
  });

  const foodKey = props.food ? `${props.food.x},${props.food.y}` : '';
  const specialKey = props.specialFood
    ? `${props.specialFood.position.x},${props.specialFood.position.y}`
    : '';
  const specialType = props.specialFood?.type;
  const result: CellData[] = [];

  for (let y = 0; y < props.rows; y++) {
    for (let x = 0; x < props.cols; x++) {
      const key = `${x},${y}`;
      let type: CellType = 'empty';

      if (snakeSet.has(key)) {
        type = snakeSet.get(key) === 0 ? 'snake-head' : 'snake-body';
      } else if (key === specialKey) {
        type = specialType === 'spider' ? 'spider-food' : 'blue-food';
      } else if (key === foodKey) {
        type = 'food';
      }

      result.push({ x, y, type });
    }
  }

  return result;
});

const headRotation = computed(() => {
  const rotations: Record<Direction, string> = {
    RIGHT: '0deg',
    DOWN: '90deg',
    LEFT: '180deg',
    UP: '270deg',
  };
  return rotations[props.direction];
});

function cellClass(type: CellType): string {
  const base = 'game-cell';
  switch (type) {
    case 'snake-head': return `${base} cell-snake-head`;
    case 'snake-body': return `${base} cell-snake-body`;
    case 'food': return `${base} cell-food`;
    case 'spider-food': return `${base} cell-spider-food`;
    case 'blue-food': return `${base} cell-blue-food`;
    default: return `${base} cell-empty`;
  }
}
</script>

<template>
  <div
    ref="boardRef"
    class="game-board-wrapper glass-panel p-0.5 inline-block"
    :class="{
      'opacity-50': status === 'gameover',
      'board-blue-effect': blueEffectActive,
    }"
  >
    <div
      class="game-board-grid"
      :style="{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gap: '1px',
        width: `${boardWidth}px`,
        height: `${boardHeight}px`,
      }"
    >
      <div
        v-for="cell in cells"
        :key="`${cell.x},${cell.y}`"
        :class="cellClass(cell.type)"
        :style="{
          width: `${cellSize}px`,
          height: `${cellSize}px`,
        }"
      >
        <!-- Snake eyes -->
        <template v-if="cell.type === 'snake-head' && cellSize >= 14">
          <div
            class="snake-eyes"
            :style="{ transform: `rotate(${headRotation})` }"
          >
            <span class="eye" />
            <span class="eye" />
          </div>
        </template>

        <!-- Pixelated spider SVG -->
        <template v-if="cell.type === 'spider-food'">
          <svg
            class="spider-pixel-art"
            viewBox="0 0 9 9"
            shape-rendering="crispEdges"
          >
            <rect x="1" y="0" width="1" height="1" />
            <rect x="7" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="6" y="1" width="1" height="1" />
            <rect x="3" y="2" width="3" height="1" />
            <rect x="0" y="3" width="1" height="1" />
            <rect x="2" y="3" width="5" height="1" />
            <rect x="8" y="3" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="3" y="4" width="3" height="1" />
            <rect x="7" y="4" width="1" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="2" y="5" width="5" height="1" />
            <rect x="8" y="5" width="1" height="1" />
            <rect x="3" y="6" width="3" height="1" />
            <rect x="2" y="7" width="1" height="1" />
            <rect x="6" y="7" width="1" height="1" />
            <rect x="1" y="8" width="1" height="1" />
            <rect x="7" y="8" width="1" height="1" />
          </svg>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board-wrapper {
  border: 2px solid rgba(0, 255, 136, 0.15);
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.05), inset 0 0 30px rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease, border-color 0.5s ease, box-shadow 0.5s ease;
}

.board-blue-effect {
  border-color: rgba(0, 204, 255, 0.3);
  box-shadow: 0 0 40px rgba(0, 204, 255, 0.1), inset 0 0 30px rgba(0, 100, 200, 0.08);
}

.snake-eyes {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 20%;
}

.eye {
  display: block;
  width: 30%;
  height: 30%;
  background: #0a0a1a;
  border-radius: 50%;
}

.spider-pixel-art {
  width: 80%;
  height: 80%;
  margin: 10%;
  fill: #e8e0f0;
  filter: drop-shadow(0 0 2px rgba(155, 89, 182, 0.8));
  image-rendering: pixelated;
}
</style>

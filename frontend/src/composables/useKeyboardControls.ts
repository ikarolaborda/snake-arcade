import { onMounted, onUnmounted } from 'vue';
import type { Direction, GameStatus } from '@/types';

interface KeyboardControlOptions {
  onDirection: (dir: Direction) => void;
  onPause: () => void;
  onStart: () => void;
  getStatus: () => GameStatus;
}

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  W: 'UP',
  s: 'DOWN',
  S: 'DOWN',
  a: 'LEFT',
  A: 'LEFT',
  d: 'RIGHT',
  D: 'RIGHT',
};

export function useKeyboardControls(options: KeyboardControlOptions) {
  function handleKeyDown(e: KeyboardEvent): void {
    const status = options.getStatus();

    // During game over, block all game-related keys so the modal stays visible
    if (status === 'gameover') return;

    const direction = KEY_MAP[e.key];

    if (direction) {
      e.preventDefault();
      if (status === 'playing') {
        options.onDirection(direction);
      } else if (status === 'idle') {
        options.onStart();
      }
      return;
    }

    if (e.key === ' ' || e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      if (status === 'playing' || status === 'paused') {
        options.onPause();
      } else if (status === 'idle') {
        options.onStart();
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown));
}

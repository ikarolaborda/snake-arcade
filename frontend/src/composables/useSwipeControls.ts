import { onMounted, onUnmounted } from 'vue';
import type { Direction } from '@/types';

interface SwipeControlOptions {
  onDirection: (dir: Direction) => void;
  threshold?: number;
}

export function useSwipeControls(options: SwipeControlOptions) {
  const threshold = options.threshold ?? 30;
  let startX = 0;
  let startY = 0;
  let tracking = false;

  function handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    tracking = true;
  }

  function handleTouchEnd(e: TouchEvent): void {
    if (!tracking) return;
    tracking = false;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < threshold) return;

    if (absDx > absDy) {
      options.onDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      options.onDirection(dy > 0 ? 'DOWN' : 'UP');
    }
  }

  onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  });

  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchend', handleTouchEnd);
  });
}

import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useResponsiveBoard(rows: number, cols: number) {
  const containerWidth = ref(0);
  const containerHeight = ref(0);
  const boardRef = ref<HTMLElement | null>(null);

  const cellSize = computed(() => {
    if (!containerWidth.value || !containerHeight.value) return 20;

    const maxCellByWidth = Math.floor((containerWidth.value - 4) / cols);
    const maxCellByHeight = Math.floor((containerHeight.value - 4) / rows);
    const size = Math.min(maxCellByWidth, maxCellByHeight);

    return Math.max(8, Math.min(size, 32));
  });

  const boardWidth = computed(() => cellSize.value * cols + 4);
  const boardHeight = computed(() => cellSize.value * rows + 4);

  function measure(): void {
    if (boardRef.value?.parentElement) {
      const parent = boardRef.value.parentElement;
      containerWidth.value = parent.clientWidth;
      containerHeight.value = Math.min(parent.clientHeight, window.innerHeight * 0.65);
    }
  }

  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    measure();
    window.addEventListener('resize', measure);

    if (boardRef.value?.parentElement) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(boardRef.value.parentElement);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', measure);
    resizeObserver?.disconnect();
  });

  return {
    boardRef,
    cellSize,
    boardWidth,
    boardHeight,
  };
}

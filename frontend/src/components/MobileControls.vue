<script setup lang="ts">
import type { Direction } from '@/types';

const emit = defineEmits<{
  direction: [dir: Direction];
}>();

function press(dir: Direction): void {
  emit('direction', dir);
}
</script>

<template>
  <div class="grid grid-cols-3 gap-1.5 w-36 sm:hidden select-none">
    <div />
    <button
      class="dpad-btn"
      @touchstart.prevent="press('UP')"
      @mousedown.prevent="press('UP')"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
      </svg>
    </button>
    <div />

    <button
      class="dpad-btn"
      @touchstart.prevent="press('LEFT')"
      @mousedown.prevent="press('LEFT')"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <div class="dpad-center" />
    <button
      class="dpad-btn"
      @touchstart.prevent="press('RIGHT')"
      @mousedown.prevent="press('RIGHT')"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div />
    <button
      class="dpad-btn"
      @touchstart.prevent="press('DOWN')"
      @mousedown.prevent="press('DOWN')"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <div />
  </div>
</template>

<style scoped>
.dpad-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(18, 18, 42, 0.8);
  border: 1px solid rgba(30, 30, 58, 0.8);
  color: #e0e0f0;
  transition: all 0.1s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.dpad-btn:active {
  background: rgba(0, 255, 136, 0.15);
  border-color: rgba(0, 255, 136, 0.4);
  transform: scale(0.92);
}

.dpad-center {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: rgba(10, 10, 26, 0.5);
  border: 1px solid rgba(30, 30, 58, 0.4);
}
</style>

<script setup lang="ts">
import type { GameStatus } from '@/types';
import { LEVEL_TABLE } from '@/types';

const SLOWEST_SPEED = LEVEL_TABLE[0].speed;
const FASTEST_SPEED = LEVEL_TABLE[LEVEL_TABLE.length - 1].speed;

defineProps<{
  score: number;
  bestScore: number;
  level: number;
  levelProgress: number;
  speed: number;
  elapsedTime: number;
  moveCount: number;
  status: GameStatus;
  blueEffectActive: boolean;
}>();

defineEmits<{
  pause: [];
}>();

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
</script>

<template>
  <div class="glass-panel p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="font-retro text-[10px] text-snake-muted uppercase tracking-widest">
        Score
      </h2>
      <button
        v-if="status === 'playing' || status === 'paused'"
        class="btn-secondary !py-1 !px-3 !text-[8px]"
        @click="$emit('pause')"
      >
        {{ status === 'paused' ? 'Resume' : 'Pause' }}
      </button>
    </div>

    <div class="text-center py-2">
      <p class="font-retro text-2xl sm:text-3xl neon-text-green">
        {{ score.toLocaleString() }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="bg-snake-bg/50 rounded-lg p-2.5 text-center">
        <p class="text-[8px] font-retro text-snake-muted uppercase mb-1">Best</p>
        <p class="font-retro text-xs neon-text-blue">
          {{ bestScore.toLocaleString() }}
        </p>
      </div>
      <div class="bg-snake-bg/50 rounded-lg p-2.5 text-center">
        <p class="text-[8px] font-retro text-snake-muted uppercase mb-1">Level</p>
        <p class="font-retro text-xs" style="color: #8b5cf6; text-shadow: 0 0 8px rgba(139,92,246,0.5)">
          {{ level }}
        </p>
        <div class="mt-1 h-1 bg-snake-bg rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            style="background: linear-gradient(90deg, #8b5cf6, #a78bfa)"
            :style="{ width: `${levelProgress}%` }"
          />
        </div>
      </div>
      <div class="bg-snake-bg/50 rounded-lg p-2.5 text-center">
        <p class="text-[8px] font-retro text-snake-muted uppercase mb-1">Time</p>
        <p class="font-retro text-xs text-snake-text">
          {{ formatTime(elapsedTime) }}
        </p>
      </div>
      <div class="bg-snake-bg/50 rounded-lg p-2.5 text-center">
        <p class="text-[8px] font-retro text-snake-muted uppercase mb-1">Moves</p>
        <p class="font-retro text-xs text-snake-text">
          {{ moveCount.toLocaleString() }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 pt-1">
      <span class="text-[8px] font-retro uppercase"
        :class="blueEffectActive ? 'neon-text-blue' : 'text-snake-muted'">
        Speed
      </span>
      <div class="flex-1 h-1.5 bg-snake-bg rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :style="{
            width: `${Math.max(0, Math.min(100, ((SLOWEST_SPEED - speed) / (SLOWEST_SPEED - FASTEST_SPEED)) * 100))}%`,
            background: blueEffectActive
              ? 'linear-gradient(90deg, #00ccff, #0088ff)'
              : 'linear-gradient(90deg, #00ff88, #00ccff)',
          }"
        />
      </div>
      <span v-if="blueEffectActive" class="text-[8px] font-retro neon-text-blue animate-pulse">
        SLOW
      </span>
    </div>
  </div>
</template>

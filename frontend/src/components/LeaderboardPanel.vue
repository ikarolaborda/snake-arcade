<script setup lang="ts">
import type { ScoreEntry } from '@/types';

defineProps<{
  scores: readonly ScoreEntry[];
  isLoading: boolean;
  error: string | null;
  lastSubmittedId: number | null;
}>();

defineEmits<{
  refresh: [];
}>();

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function getRankDisplay(index: number): string {
  const medals = ['🥇', '🥈', '🥉'];
  return medals[index] ?? `${index + 1}`;
}
</script>

<template>
  <div class="glass-panel p-4 flex-1 min-h-0">
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-retro text-[10px] text-snake-muted uppercase tracking-widest">
        Leaderboard
      </h2>
      <button
        class="text-snake-muted hover:text-snake-blue transition-colors text-xs p-1"
        title="Refresh"
        :disabled="isLoading"
        @click="$emit('refresh')"
      >
        <svg class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && scores.length === 0" class="py-8 text-center">
      <div class="inline-block w-5 h-5 border-2 border-snake-green/30 border-t-snake-green rounded-full animate-spin" />
      <p class="text-snake-muted text-xs mt-2">Loading scores...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error && scores.length === 0" class="py-6 text-center">
      <p class="text-snake-pink text-xs font-retro mb-2">Offline</p>
      <p class="text-snake-muted text-[10px]">{{ error }}</p>
      <button class="btn-secondary !text-[8px] mt-3" @click="$emit('refresh')">
        Retry
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="scores.length === 0" class="py-8 text-center">
      <p class="text-snake-muted text-xs">No scores yet</p>
      <p class="text-snake-muted text-[10px] mt-1">Be the first to play!</p>
    </div>

    <!-- Scores -->
    <div v-else class="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
      <div
        v-for="(entry, index) in scores"
        :key="entry.id"
        class="flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors"
        :class="{
          'bg-snake-green/10 border border-snake-green/20': entry.id === lastSubmittedId,
          'hover:bg-snake-surface/50': entry.id !== lastSubmittedId,
        }"
      >
        <span class="w-6 text-center text-xs shrink-0">
          {{ getRankDisplay(index) }}
        </span>
        <span class="flex-1 text-sm truncate" :class="{ 'neon-text-green': entry.id === lastSubmittedId }">
          {{ entry.name }}
        </span>
        <span class="font-retro text-[10px] text-snake-text shrink-0">
          {{ entry.score.toLocaleString() }}
        </span>
        <span class="text-[9px] text-snake-muted shrink-0 hidden sm:inline">
          {{ formatDate(entry.createdAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

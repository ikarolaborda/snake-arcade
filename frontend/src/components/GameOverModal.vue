<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  score: number;
  bestScore: number;
  isNewBest: boolean;
  moveCount: number;
  elapsedTime: number;
  level: number;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmitScore: (name: string) => Promise<boolean>;
}>();

const emit = defineEmits<{
  restart: [];
}>();

const playerName = ref(localStorage.getItem('snake-player-name') ?? '');
const submitted = ref(false);

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

async function handleSubmit(): Promise<void> {
  const name = playerName.value.trim();
  if (!name || name.length > 20) return;

  localStorage.setItem('snake-player-name', name);
  const ok = await props.onSubmitScore(name);
  if (ok) submitted.value = true;
}

function handleRestart(): void {
  submitted.value = false;
  emit('restart');
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div class="glass-panel w-full max-w-sm p-6 animate-slide-up" @click.stop>
        <div v-if="isNewBest" class="text-center mb-3">
          <span class="inline-block font-retro text-[10px] neon-text-pink uppercase tracking-widest
                       bg-snake-pink/10 px-3 py-1 rounded-full border border-snake-pink/20">
            New High Score!
          </span>
        </div>

        <h2 class="font-retro text-lg text-center neon-text-pink mb-4">
          GAME OVER
        </h2>

        <div class="text-center mb-5">
          <p class="font-retro text-3xl neon-text-green">
            {{ score.toLocaleString() }}
          </p>
          <p class="text-snake-muted text-xs mt-1">points</p>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-5">
          <div class="bg-snake-bg/50 rounded-lg p-2 text-center">
            <p class="text-[8px] font-retro text-snake-muted mb-0.5">Level</p>
            <p class="font-retro text-xs text-snake-text">{{ level }}</p>
          </div>
          <div class="bg-snake-bg/50 rounded-lg p-2 text-center">
            <p class="text-[8px] font-retro text-snake-muted mb-0.5">Time</p>
            <p class="font-retro text-xs text-snake-text">{{ formatTime(elapsedTime) }}</p>
          </div>
          <div class="bg-snake-bg/50 rounded-lg p-2 text-center">
            <p class="text-[8px] font-retro text-snake-muted mb-0.5">Moves</p>
            <p class="font-retro text-xs text-snake-text">{{ moveCount }}</p>
          </div>
        </div>

        <div v-if="!submitted && score > 0" class="mb-4">
          <form @submit.prevent="handleSubmit" class="space-y-2">
            <input
              v-model="playerName"
              type="text"
              maxlength="20"
              placeholder="Enter your name..."
              class="w-full px-3 py-2 bg-snake-bg border border-snake-border rounded-lg
                     text-snake-text text-sm placeholder-snake-muted/50
                     focus:outline-none focus:border-snake-green/50 focus:ring-1 focus:ring-snake-green/20
                     transition-colors"
              :disabled="isSubmitting"
            />
            <button
              type="submit"
              class="btn-primary w-full text-[10px]"
              :disabled="!playerName.trim() || isSubmitting"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Score' }}
            </button>
          </form>
          <p v-if="submitError" class="text-snake-pink text-[10px] mt-1.5 text-center">
            {{ submitError }}
          </p>
        </div>

        <div v-if="submitted" class="mb-4 text-center">
          <p class="neon-text-green text-xs font-retro">Score submitted!</p>
        </div>

        <button class="btn-secondary w-full text-[10px]" @click="handleRestart">
          Play Again
        </button>
      </div>
    </div>
  </Teleport>
</template>

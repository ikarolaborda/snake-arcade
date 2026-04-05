import { ref, readonly } from 'vue';
import type { ScoreEntry } from '@/types';
import { api } from '@/utils/api';

export function useLeaderboard() {
  const scores = ref<ScoreEntry[]>([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);
  const lastSubmittedId = ref<number | null>(null);

  async function fetchScores(limit = 10): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await api.getScores(limit);
      scores.value = result.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load leaderboard';
      scores.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function submitScore(data: {
    name: string;
    score: number;
    duration?: number;
    moves?: number;
  }): Promise<boolean> {
    isSubmitting.value = true;
    error.value = null;

    try {
      const entry = await api.submitScore(data);
      lastSubmittedId.value = entry.id;
      await fetchScores();
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to submit score';
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  fetchScores();

  return {
    scores: readonly(scores),
    isLoading: readonly(isLoading),
    isSubmitting: readonly(isSubmitting),
    error: readonly(error),
    lastSubmittedId: readonly(lastSubmittedId),
    fetchScores,
    submitScore,
  };
}

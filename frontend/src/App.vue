<script setup lang="ts">
import { watch } from 'vue';
import AppShell from '@/components/AppShell.vue';
import GameBoard from '@/components/GameBoard.vue';
import ScorePanel from '@/components/ScorePanel.vue';
import LeaderboardPanel from '@/components/LeaderboardPanel.vue';
import StartScreen from '@/components/StartScreen.vue';
import PauseOverlay from '@/components/PauseOverlay.vue';
import GameOverModal from '@/components/GameOverModal.vue';
import MobileControls from '@/components/MobileControls.vue';
import SoundToggle from '@/components/SoundToggle.vue';
import CountdownOverlay from '@/components/CountdownOverlay.vue';
import { useSnakeGame } from '@/composables/useSnakeGame';
import { useKeyboardControls } from '@/composables/useKeyboardControls';
import { useLeaderboard } from '@/composables/useLeaderboard';
import { useSound } from '@/composables/useSound';
import { useSwipeControls } from '@/composables/useSwipeControls';

const game = useSnakeGame();
const leaderboard = useLeaderboard();
const sound = useSound();

useKeyboardControls({
  onDirection: game.changeDirection,
  onPause: game.togglePause,
  onStart: game.startGame,
  getStatus: () => game.status.value,
});

useSwipeControls({
  onDirection: game.changeDirection,
});

watch(game.lastEatTime, () => {
  if (game.lastEatTime.value <= 0) return;
  const specialType = game.lastSpecialEatType.value;
  if (specialType === 'spider') sound.playSpiderEat();
  else if (specialType === 'blue') sound.playBlueEat();
  else sound.playEat();
});

watch(game.status, (newStatus, oldStatus) => {
  if (newStatus === 'gameover') sound.playGameOver();
  if (newStatus === 'playing' && oldStatus === 'countdown') sound.playStart();
});

watch(game.level, (newLevel, oldLevel) => {
  if (newLevel > oldLevel && oldLevel > 0) sound.playLevelUp();
});

watch(game.countdownValue, (val) => {
  if (val > 0 && game.status.value === 'countdown') sound.playCountdown();
});

async function handleSubmitScore(name: string): Promise<boolean> {
  return leaderboard.submitScore({
    name,
    score: game.score.value,
    duration: game.elapsedTime.value,
    moves: game.moveCount.value,
  });
}
</script>

<template>
  <AppShell>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h1 class="font-retro text-sm sm:text-base neon-text-green tracking-wider">
          SNAKE ARCADE
        </h1>
        <SoundToggle :enabled="sound.enabled.value" @toggle="sound.toggle" />
      </div>
    </template>

    <template #game>
      <div class="game-area relative">
        <StartScreen
          v-if="game.status.value === 'idle'"
          @start="game.startGame"
        />
        <template v-else>
          <GameBoard
            :snake="game.snake.value"
            :food="game.food.value"
            :special-food="game.specialFood.value"
            :rows="game.config.rows"
            :cols="game.config.cols"
            :direction="game.direction.value"
            :status="game.status.value"
            :blue-effect-active="game.blueEffectActive.value"
          />
          <CountdownOverlay
            v-if="game.status.value === 'countdown'"
            :value="game.countdownValue.value"
          />
          <PauseOverlay
            v-if="game.status.value === 'paused'"
            @resume="game.resume"
          />
        </template>
      </div>
    </template>

    <template #controls>
      <MobileControls @direction="game.changeDirection" />
    </template>

    <template #score>
      <ScorePanel
        :score="game.score.value"
        :best-score="game.bestScore.value"
        :level="game.level.value"
        :level-progress="game.levelProgress.value"
        :speed="game.currentSpeed.value"
        :elapsed-time="game.elapsedTime.value"
        :move-count="game.moveCount.value"
        :status="game.status.value"
        :blue-effect-active="game.blueEffectActive.value"
        @pause="game.togglePause"
      />
    </template>

    <template #leaderboard>
      <LeaderboardPanel
        :scores="leaderboard.scores.value"
        :is-loading="leaderboard.isLoading.value"
        :error="leaderboard.error.value"
        :last-submitted-id="leaderboard.lastSubmittedId.value"
        @refresh="leaderboard.fetchScores()"
      />
    </template>

    <GameOverModal
      v-if="game.status.value === 'gameover'"
      :score="game.score.value"
      :best-score="game.bestScore.value"
      :is-new-best="game.isNewBest.value"
      :move-count="game.moveCount.value"
      :elapsed-time="game.elapsedTime.value"
      :level="game.level.value"
      :is-submitting="leaderboard.isSubmitting.value"
      :submit-error="leaderboard.error.value"
      :on-submit-score="handleSubmitScore"
      @restart="game.startGame"
    />
  </AppShell>
</template>

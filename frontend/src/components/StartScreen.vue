<script setup lang="ts">
defineEmits<{
  start: [];
}>();
</script>

<template>
  <div class="glass-panel flex flex-col items-center justify-center gap-6 p-8 sm:p-12
              min-h-[300px] sm:min-h-[400px] w-full max-w-[500px] animate-fade-in">
    <div class="text-center space-y-3">
      <!-- Snake ASCII art -->
      <div class="font-retro text-snake-green text-xs sm:text-sm leading-relaxed opacity-80 animate-float">
        <pre class="inline-block text-left">
  ____
 / __ \
| |  \_\___
| |__  ___ \
 \__/ / __\ |
      \____/
        </pre>
      </div>

      <h2 class="font-retro text-lg sm:text-xl neon-text-green mt-4">
        SNAKE
      </h2>
      <p class="text-snake-muted text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
        Classic arcade action. Eat food, grow longer, survive. 
        Cross the walls Nokia-style!
      </p>
    </div>

    <button class="btn-primary text-xs sm:text-sm" @click="$emit('start')">
      Start Game
    </button>

    <div class="text-center space-y-1.5 text-[10px] text-snake-muted">
      <p><kbd class="text-snake-text">WASD</kbd> or <kbd class="text-snake-text">Arrow Keys</kbd> to move</p>
      <p><kbd class="text-snake-text">Space</kbd> to pause</p>
      <p>Swipe on mobile</p>
    </div>
  </div>
</template>

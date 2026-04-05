<script setup lang="ts">
defineEmits<{
  resume: [];
}>();
</script>

<template>
  <div
    class="absolute inset-0 flex flex-col items-center justify-center bg-black/60
           backdrop-blur-sm rounded-xl z-10 animate-fade-in"
    @click="$emit('resume')"
  >
    <div class="text-center space-y-4" @click.stop>
      <h2 class="font-retro text-xl neon-text-blue">PAUSED</h2>
      <p class="text-snake-muted text-xs">Click anywhere or press Space to resume</p>
      <button class="btn-primary text-xs" @click="$emit('resume')">
        Resume
      </button>
    </div>
  </div>
</template>

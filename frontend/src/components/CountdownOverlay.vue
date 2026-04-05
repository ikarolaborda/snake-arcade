<script setup lang="ts">
defineProps<{
  value: number;
}>();
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10">
    <span
      :key="value"
      class="font-retro text-5xl sm:text-6xl neon-text-green animate-countdown"
    >
      {{ value > 0 ? value : 'GO!' }}
    </span>
  </div>
</template>

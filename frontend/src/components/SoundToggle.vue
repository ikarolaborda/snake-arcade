<script setup lang="ts">
defineProps<{
  enabled: boolean;
}>();

defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <button
    class="p-2 rounded-lg transition-colors hover:bg-snake-surface/50"
    :title="enabled ? 'Mute sounds' : 'Enable sounds'"
    @click="$emit('toggle')"
  >
    <!-- Sound on -->
    <svg v-if="enabled" class="w-4 h-4 text-snake-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15.536 8.464a5 5 0 010 7.072M12 6l-4 4H4v4h4l4 4V6z" />
    </svg>
    <!-- Sound off -->
    <svg v-else class="w-4 h-4 text-snake-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  </button>
</template>

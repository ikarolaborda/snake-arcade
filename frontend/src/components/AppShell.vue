<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-snake-bg flex flex-col">
    <!-- Animated background grid -->
    <div class="fixed inset-0 pointer-events-none opacity-[0.03]"
         style="background-image: linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px);
                background-size: 40px 40px;" />

    <header class="relative z-10 px-4 sm:px-6 py-4 border-b border-snake-border">
      <div class="max-w-7xl mx-auto">
        <slot name="header" />
      </div>
    </header>

    <main class="relative z-10 flex-1 px-4 sm:px-6 py-4 sm:py-6">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6">
          <div class="flex flex-col items-center gap-4">
            <slot name="game" />
            <slot name="controls" />
          </div>
          <div class="flex flex-col gap-4">
            <slot name="score" />
            <slot name="leaderboard" />
          </div>
        </div>
      </div>
    </main>

    <footer class="relative z-10 px-4 py-3 text-center text-snake-muted text-xs border-t border-snake-border">
      Press <kbd class="px-1.5 py-0.5 rounded bg-snake-surface border border-snake-border text-snake-text font-mono text-xs">Space</kbd> to pause
      &middot;
      <kbd class="px-1.5 py-0.5 rounded bg-snake-surface border border-snake-border text-snake-text font-mono text-xs">WASD</kbd> or Arrows to move
    </footer>

    <slot />
  </div>
</template>

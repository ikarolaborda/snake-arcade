import { ref, readonly } from 'vue';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'square', volume = 0.1): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported
  }
}

export function useSound() {
  const enabled = ref(localStorage.getItem('snake-sound') !== 'off');

  function toggle(): void {
    enabled.value = !enabled.value;
    localStorage.setItem('snake-sound', enabled.value ? 'on' : 'off');
  }

  function playEat(): void {
    if (!enabled.value) return;
    playTone(880, 0.1, 'square', 0.08);
    setTimeout(() => playTone(1100, 0.08, 'square', 0.06), 60);
  }

  function playSpiderEat(): void {
    if (!enabled.value) return;
    playTone(220, 0.06, 'sawtooth', 0.09);
    setTimeout(() => playTone(440, 0.06, 'sawtooth', 0.09), 50);
    setTimeout(() => playTone(880, 0.06, 'sawtooth', 0.09), 100);
    setTimeout(() => playTone(1320, 0.1, 'square', 0.07), 150);
  }

  function playBlueEat(): void {
    if (!enabled.value) return;
    playTone(523, 0.15, 'sine', 0.08);
    setTimeout(() => playTone(392, 0.2, 'sine', 0.06), 120);
    setTimeout(() => playTone(330, 0.25, 'sine', 0.05), 250);
  }

  function playGameOver(): void {
    if (!enabled.value) return;
    playTone(440, 0.15, 'sawtooth', 0.08);
    setTimeout(() => playTone(330, 0.15, 'sawtooth', 0.08), 150);
    setTimeout(() => playTone(220, 0.3, 'sawtooth', 0.06), 300);
  }

  function playLevelUp(): void {
    if (!enabled.value) return;
    playTone(523, 0.1, 'square', 0.07);
    setTimeout(() => playTone(659, 0.1, 'square', 0.07), 100);
    setTimeout(() => playTone(784, 0.15, 'square', 0.07), 200);
  }

  function playCountdown(): void {
    if (!enabled.value) return;
    playTone(440, 0.12, 'sine', 0.06);
  }

  function playStart(): void {
    if (!enabled.value) return;
    playTone(523, 0.08, 'square', 0.06);
    setTimeout(() => playTone(784, 0.12, 'square', 0.06), 80);
  }

  return {
    enabled: readonly(enabled),
    toggle,
    playEat,
    playSpiderEat,
    playBlueEat,
    playGameOver,
    playLevelUp,
    playCountdown,
    playStart,
  };
}

<script setup lang="ts">
/**
 * A soft oval rising from the bottom of the screen, behind the article, whose size tracks
 * how many people are reading the page. Size follows log10(readers) so 1, 10, 100 and
 * 1,000 readers are evenly spaced steps; it eases toward that size like a tide, and each
 * tick's arrivals (or departures) nudge it outward (or inward) so individual people are felt.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  /** Readers on the page now. */
  count: number
  /** Arrivals and departures in the simulation's latest tick. */
  change: { joined: number; left: number }
}

const props = defineProps<Props>()

/** Readers at which the oval reaches full size. */
const FULL_AT = 10_000
/** Smallest visible size (as a fraction of full) for a single reader. */
const MIN_SCALE = 0.12
/** Seconds for the tide to mostly settle on a new size (critically damped, no overshoot). */
const SETTLE_S = 4
const SETTLE_S_REDUCED = 20
/** Velocity kick per net arrival, and the most one tick can add. */
const PULSE_PER_READER = 0.006
const PULSE_MAX = 0.025

const oval = ref<HTMLElement | null>(null)

function scaleFor(readers: number): number {
  if (readers <= 0) return 0
  const t = Math.min(1, Math.log10(1 + readers) / Math.log10(1 + FULL_AT))
  return MIN_SCALE + (1 - MIN_SCALE) * t
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

let size = 0
let velocity = 0
let frame = 0
let lastFrame = 0

function step(time: number) {
  const dt = Math.min(0.05, (time - lastFrame) / 1000 || 0)
  lastFrame = time
  const omega = (2 * Math.PI) / (reducedMotion.matches ? SETTLE_S_REDUCED : SETTLE_S)
  const target = scaleFor(props.count)
  velocity += (omega * omega * (target - size) - 2 * omega * velocity) * dt
  size = Math.max(0, size + velocity * dt)
  if (oval.value) {
    oval.value.style.transform = `translate(-50%, 50%) scale(${size.toFixed(4)})`
  }
  frame = requestAnimationFrame(step)
}

watch(
  () => props.change,
  ({ joined, left }) => {
    if (reducedMotion.matches) return
    const net = joined - left
    velocity += Math.max(-PULSE_MAX, Math.min(PULSE_MAX, net * PULSE_PER_READER))
  },
)

onMounted(() => {
  lastFrame = performance.now()
  frame = requestAnimationFrame(step)
})
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <div
    class="presence-tide"
    aria-hidden="true"
  >
    <div
      ref="oval"
      class="presence-tide__oval"
    />
  </div>
</template>

<style scoped>
.presence-tide {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 0;
  width: 100%;
  /* Inside MobileWrapper, stay within the phone column on wide screens. */
  max-width: var(--mobile-wrapper-max-width, 100%);
  height: 100vh;
  overflow: hidden;
  transform: translateX(-50%);
  pointer-events: none;
}

/* Centred on the bottom edge, so the visible part is the top half: a dome 80vh tall at full size. */
.presence-tide__oval {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 200%;
  height: 160vh;
  background: radial-gradient(
    closest-side,
    var(--background-color-progressive-subtle) 0%,
    var(--background-color-progressive-subtle) 40%,
    transparent 100%
  );
  transform: translate(-50%, 50%) scale(0);
  will-change: transform;
}
</style>

<script setup lang="ts">
/**
 * The crowd on this page, drawn two ways from one anchor at the bottom of the screen:
 *
 * - **Tide** (behind the article): a soft oval centred on the viewport's bottom edge, so only
 *   its top half — a dome — is ever visible. Dome height follows log10(readers), so 1, 10,
 *   100 and 1,000 readers are even steps. It eases toward that size, and each tick's
 *   arrivals (or departures) nudge it outward (or inward) so individual people are felt.
 * - **Badge** (over the article): an opaque half circle sitting flat on the bottom edge,
 *   showing the reader count over the word "reading".
 *
 * Scrolling up collapses the tide into the badge, tracking the scroll 1:1 (so it collapses
 * as fast as you scroll); scrolling down undoes it the same way. When scrolling stops, the
 * badge sinks back behind the article and the tide blooms out to its full size again.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  /** Readers on the page now. */
  count: number
  /** Arrivals and departures in the simulation's latest tick. */
  change: { joined: number; left: number }
}

const props = defineProps<Props>()

/** Visible dome height (top half of the oval), as viewport height, for 1 reader… */
const DOME_MIN_VH = 8
/** …and for FULL_AT readers or more. */
const DOME_MAX_VH = 60
const FULL_AT = 10_000
/** Oval width ÷ height. */
const ASPECT = 1.6

/** Seconds for the tide to mostly settle on a new size (critically damped, no overshoot). */
const SETTLE_S = 4
const SETTLE_S_REDUCED = 20
/** Velocity kick per net arrival, and the most one tick can add (in dome-scale units). */
const PULSE_PER_READER = 0.006
const PULSE_MAX = 0.025

/** Scroll distance that fully collapses the tide into the badge (up) or undoes it (down). */
const COLLAPSE_PX = 160
/** Single scroll jumps bigger than this are navigation, not a gesture, and are ignored. */
const MAX_GESTURE_STEP_PX = 600
/** No scroll events for this long (momentum included) counts as stopped. */
const IDLE_MS = 500
/** Seconds for the badge to sink and the tide to bloom back once scrolling stops. */
const BLOOM_S = 1.8

const tide = ref<HTMLElement | null>(null)
const badge = ref<HTMLElement | null>(null)
const label = ref<HTMLElement | null>(null)

const countText = computed(() => props.count.toLocaleString())

/**
 * Size the half circle so its curve passes `--spacing-75` (12px) from the label's top corners
 * (the text's nearest points to the curve). Radius is measured from the centre of the flat
 * bottom edge.
 */
function fitBadge() {
  if (!badge.value || !label.value) return
  const style = getComputedStyle(badge.value)
  const clearance = parseFloat(style.getPropertyValue('--spacing-75')) || 12
  const border = parseFloat(style.borderTopWidth) || 0
  const top = parseFloat(style.paddingBottom) + label.value.offsetHeight
  const radius = Math.hypot(label.value.offsetWidth / 2, top) + clearance + border
  badge.value.style.width = `${(2 * radius).toFixed(1)}px`
}

let labelObserver: ResizeObserver | null = null

/** Dome height for a reader count, as a fraction of the largest dome. */
function domeScale(readers: number): number {
  if (readers <= 0) return 0
  const t = Math.min(1, Math.log10(1 + readers) / Math.log10(1 + FULL_AT))
  return (DOME_MIN_VH + (DOME_MAX_VH - DOME_MIN_VH) * t) / DOME_MAX_VH
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

/* Tide spring state. */
let size = 0
let velocity = 0
/* Collapse progress: 0 = full tide behind the article, 1 = badge only. */
let collapse = 0
let scrolling = false
let lastScrollY = window.scrollY
let idleTimer = 0
let frame = 0
let lastFrame = 0

function onScroll() {
  const y = Math.max(0, window.scrollY)
  const dy = y - lastScrollY
  lastScrollY = y
  if (Math.abs(dy) > MAX_GESTURE_STEP_PX) return
  // Up collapses the tide into the badge; down hides the badge and lets the tide back out.
  collapse = Math.max(0, Math.min(1, collapse - dy / COLLAPSE_PX))
  if (collapse > 0) {
    scrolling = true
    window.clearTimeout(idleTimer)
    idleTimer = window.setTimeout(() => (scrolling = false), IDLE_MS)
  }
}

function step(time: number) {
  const dt = Math.min(0.05, (time - lastFrame) / 1000 || 0)
  lastFrame = time

  const omega = (2 * Math.PI) / (reducedMotion.matches ? SETTLE_S_REDUCED : SETTLE_S)
  velocity += (omega * omega * (domeScale(props.count) - size) - 2 * omega * velocity) * dt
  size = Math.max(0, size + velocity * dt)

  if (!scrolling && collapse > 0) collapse = Math.max(0, collapse - dt / BLOOM_S)
  const c = smoothstep(0, 1, collapse)

  if (tide.value) {
    // Reduced motion: fade the tide instead of shrinking and blooming it.
    const scale = reducedMotion.matches ? size : size * (1 - c)
    tide.value.style.transform = `translate(-50%, 50%) scale(${scale.toFixed(4)})`
    tide.value.style.opacity = reducedMotion.matches ? String(1 - c) : '1'
  }
  if (badge.value) {
    // Rises out of the same anchor: from below the bottom edge to sitting flat on it.
    const shown = smoothstep(0.3, 1, collapse)
    badge.value.style.transform = `translate(-50%, ${((1 - shown) * 100).toFixed(2)}%) scale(${(0.6 + 0.4 * shown).toFixed(4)})`
    badge.value.style.opacity = shown.toFixed(3)
    badge.value.style.visibility = shown > 0 ? 'visible' : 'hidden'
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
  window.addEventListener('scroll', onScroll, { passive: true })
  // Re-fit when the number's width changes or fonts load.
  labelObserver = new ResizeObserver(fitBadge)
  if (label.value) labelObserver.observe(label.value)
  fitBadge()
})
onBeforeUnmount(() => {
  labelObserver?.disconnect()
  cancelAnimationFrame(frame)
  window.clearTimeout(idleTimer)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div
    class="presence-tide"
    aria-hidden="true"
  >
    <div
      ref="tide"
      class="presence-tide__oval"
      :style="{
        '--dome-max': `${DOME_MAX_VH}vh`,
        '--aspect': ASPECT,
      }"
    />
  </div>
  <div class="presence-badge-frame">
    <div
      ref="badge"
      class="presence-badge"
    >
      <p
        ref="label"
        class="presence-badge__label"
      >
        <span class="presence-badge__count">{{ countText }}</span>
        <span class="presence-badge__noun">reading</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Both layers share the phone column's width on wide screens (inside MobileWrapper). */
.presence-tide,
.presence-badge-frame {
  position: fixed;
  bottom: 0;
  left: 50%;
  width: 100%;
  max-width: var(--mobile-wrapper-max-width, 100%);
  transform: translateX(-50%);
  pointer-events: none;
}

.presence-tide {
  z-index: 0;
  height: 100vh;
  overflow: hidden;
}

/* Centred on the bottom edge: only the top half (the dome) is ever on screen. */
.presence-tide__oval {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(var(--dome-max) * 2 * var(--aspect));
  height: calc(var(--dome-max) * 2);
  background: radial-gradient(
    closest-side,
    var(--background-color-progressive-subtle) 0%,
    var(--background-color-progressive-subtle) 40%,
    transparent 100%
  );
  transform: translate(-50%, 50%) scale(0);
  will-change: transform;
}

/* Above the article (which sits at z-index 1). */
.presence-badge-frame {
  z-index: 2;
  height: 0;
}

/*
 * A symmetrical half circle sitting flat on the bottom edge, like the tide's dome: 2:1 box,
 * corner radii of half the width across and the full height up. Width is set by fitBadge().
 */
.presence-badge {
  position: absolute;
  bottom: 0;
  left: 50%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
  aspect-ratio: 2 / 1;
  padding: 0 0 calc(var(--spacing-75) + env(safe-area-inset-bottom, 0px));
  border: var(--border-width-base) solid var(--border-color-subtle);
  border-bottom: 0;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  background-color: var(--background-color-interactive);
  /* Codex's large shadow geometry, in the progressive-subtle colour. */
  box-shadow:
    var(--box-shadow-outset-large-below) var(--background-color-progressive-subtle),
    var(--box-shadow-outset-large-around) var(--background-color-progressive-subtle);
  transform: translate(-50%, 100%) scale(0.6);
  transform-origin: 50% 100%;
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity;
}

.presence-badge__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  text-align: center;
  white-space: nowrap;
}

/*
 * Codex Heading 2 and Body text styles, except both lines use the x-small line height so the
 * two sit tight together (a deliberate design override of the styles' own line heights).
 */
.presence-badge__count {
  color: var(--color-base);
  font-family: var(--font-family-serif);
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-x-small);
  font-variant-numeric: tabular-nums;
}

.presence-badge__noun {
  color: var(--color-neutral);
  font-family: var(--font-family-base);
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-x-small);
}
</style>

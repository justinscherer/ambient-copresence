import { onBeforeUnmount, reactive, ref, watch, type Ref } from 'vue'

import { createRoomSound, type RoomSound } from './room-sound'
import { defaultTuning, loadTuning, saveTuning } from './tuning'

/** Time constant of the smoothed arrival and departure rates. */
const RATE_WINDOW_S = 2

/** Round to a whole number of cues, keeping the fraction as a probability. */
function stochasticRound(x: number): number {
  const whole = Math.floor(x)
  return whole + (Math.random() < x - whole ? 1 : 0)
}

/**
 * Plays the simulation as a room: `count` sizes the room, and each tick's arrivals and
 * departures (`change`) play as cues. Quiet pages hear every arrival and a share of
 * departures; busy pages are thinned to a steady patter (most cues per second, in `tuning`).
 * Sound starts off; `toggle()` must run inside a tap, since browsers only unlock audio from
 * a user gesture.
 *
 * `tuning` holds every sound-design value. It's saved in this browser and applied live.
 */
export function useRoomSound(count: Ref<number>, change: Ref<{ joined: number; left: number }>) {
  const on = ref(false)
  const tuning = reactive(loadTuning())
  let sound: RoomSound | null = null

  let lastTick = performance.now()
  const rate = { joined: 0, left: 0 }

  function toggle(value = !on.value) {
    on.value = value
    if (!value) {
      void sound?.stop()
      return
    }
    // Let iOS play even with the silent switch on (Safari 17+).
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
    if (session) session.type = 'playback'
    sound ??= createRoomSound(tuning)
    sound.setReaders(count.value)
    void sound.start()
  }

  /**
   * Play up to `keep` of `n` events, thinned further to at most `max` per second, spread
   * across the tick.
   */
  function cue(
    n: number,
    smoothedRate: number,
    max: number,
    dt: number,
    play: (delay: number) => void,
    keep = 1,
  ) {
    if (n <= 0) return
    const share = Math.min(keep, max / Math.max(smoothedRate, 1e-6))
    // The cap also covers the first ticks, before the smoothed rate has caught up.
    const plays = Math.min(stochasticRound(n * share), Math.ceil(max * dt * 2))
    for (let i = 0; i < plays; i++) play(Math.random() * dt)
  }

  watch(change, ({ joined, left }) => {
    const now = performance.now()
    const dt = Math.max(0.05, (now - lastTick) / 1000)
    lastTick = now
    const k = 1 - Math.exp(-dt / RATE_WINDOW_S)
    rate.joined += k * (joined / dt - rate.joined)
    rate.left += k * (left / dt - rate.left)

    if (!sound || !on.value || document.hidden) return
    sound.setReaders(count.value)
    cue(joined, rate.joined, tuning.arrivalRate, dt, sound.arrive)
    cue(left, rate.left, tuning.departureRate, dt, sound.leave, tuning.departureShare)
  })

  watch(tuning, () => {
    saveTuning(tuning)
    sound?.retune()
  })

  function resetTuning() {
    Object.assign(tuning, defaultTuning())
  }

  function onVisibility() {
    if (!sound || !on.value) return
    if (document.hidden) void sound.stop()
    else void sound.start()
  }

  document.addEventListener('visibilitychange', onVisibility)
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    void sound?.close()
  })

  return { on, toggle, tuning, resetTuning }
}

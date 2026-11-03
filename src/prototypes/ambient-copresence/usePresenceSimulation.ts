import { computed, onBeforeUnmount, ref, shallowRef, watch, type Ref } from 'vue'

import {
  DAYS_IN_MONTH,
  DWELL_CAP_S,
  arrivalRate,
  dayIndexFor,
  expectedReaders,
  poisson,
  sampleDwellSeconds,
  utcHourOf,
  type ArticleTraffic,
} from './presence-model'

/** Most reader dots drawn at once; above this each dot stands for several readers. */
export const MAX_DOTS = 48

const TICK_MS = 200
/** Largest slice of simulated time drawn with a single arrival rate. */
const STEP_S = 5

interface Reader {
  id: number
  leaveAt: number
  /** Uniform 0–1, fixed per reader: decides whether this reader is drawn as a dot. */
  u: number
  hue: number
}

export interface ReaderDot {
  id: number
  hue: number
}

export interface ClockState {
  live: boolean
  /** 0-based October day. */
  dayIndex: number
  /** UTC hour of day, fractional. */
  utcHour: number
  /** Simulated seconds per real second. */
  speed: number
}

/**
 * Plays out arrivals (Poisson at the modelled rate) and departures (log-normal dwell) for
 * one article. Time runs on a simulated October clock: live mode follows the viewer's real
 * UTC time-of-day on the same day-of-month; otherwise a chosen day/hour at a chosen speed.
 */
export function usePresenceSimulation(article: Ref<ArticleTraffic | undefined>) {
  const now = new Date()
  const clock = ref<ClockState>({
    live: true,
    dayIndex: dayIndexFor(now),
    utcHour: utcHourOf(now),
    speed: 1,
  })

  const count = ref(0)
  const dots = shallowRef<ReaderDot[]>([])
  const dotScale = ref(1)
  const joinedRecently = ref(0)
  const leftRecently = ref(0)

  let readers: Reader[] = []
  let nextId = 1
  /** Simulated seconds since the start of the chosen day. */
  let simSeconds = 0
  let dotProbability = 1
  let recent: { at: number; joined: number; left: number }[] = []
  let lastTick = performance.now()

  const expectedNow = computed(() =>
    article.value ? expectedReaders(article.value, clock.value.dayIndex, clock.value.utcHour) : 0,
  )

  function rateAt(seconds: number): number {
    if (!article.value) return 0
    const day = clock.value.dayIndex + Math.floor(seconds / 86400)
    const hour = (((seconds % 86400) + 86400) % 86400) / 3600
    // Before the 1st, reuse the 1st; after the last day, reuse the last.
    const clampedDay = Math.max(0, Math.min(article.value.dailyViews.length - 1, day))
    return arrivalRate(article.value, clampedDay, hour)
  }

  function addArrivals(from: number, to: number, keepIfLeavesAfter: number): number {
    const a = article.value
    if (!a) return 0
    let added = 0
    for (let t = from; t < to; t += STEP_S) {
      const step = Math.min(STEP_S, to - t)
      const n = poisson(rateAt(t + step / 2) * step)
      for (let i = 0; i < n; i++) {
        const arriveAt = t + Math.random() * step
        const leaveAt = arriveAt + sampleDwellSeconds(a)
        if (leaveAt <= keepIfLeavesAfter) continue
        readers.push({
          id: nextId++,
          leaveAt,
          u: Math.random(),
          hue: Math.floor(Math.random() * 360),
        })
        added++
      }
    }
    return added
  }

  /** Start fresh at the clock's current time, already populated by the past hour's arrivals. */
  function reset() {
    readers = []
    recent = []
    simSeconds = clock.value.utcHour * 3600
    addArrivals(simSeconds - DWELL_CAP_S, simSeconds, simSeconds)
    dotProbability = Math.min(1, MAX_DOTS / Math.max(1, readers.length, expectedNow.value))
    publish()
  }

  function publish() {
    count.value = readers.length
    // Keep each dot standing for the same number of readers unless the crowd outgrows the cap.
    const visible = readers.filter((r) => r.u < dotProbability).length
    if (visible > MAX_DOTS * 1.5 || (visible < MAX_DOTS / 3 && dotProbability < 1)) {
      dotProbability = Math.min(1, MAX_DOTS / Math.max(1, readers.length))
    }
    dots.value = readers
      .filter((r) => r.u < dotProbability)
      .slice(0, Math.round(MAX_DOTS * 1.5))
      .map((r) => ({ id: r.id, hue: r.hue }))
    dotScale.value = 1 / dotProbability
    const cutoff = performance.now() - 10_000
    recent = recent.filter((e) => e.at >= cutoff)
    joinedRecently.value = recent.reduce((sum, e) => sum + e.joined, 0)
    leftRecently.value = recent.reduce((sum, e) => sum + e.left, 0)
  }

  function tick() {
    const realNow = performance.now()
    const elapsed = (realNow - lastTick) / 1000
    lastTick = realNow

    let wrapped = false
    if (clock.value.live) {
      const date = new Date()
      if (dayIndexFor(date) !== clock.value.dayIndex) {
        goLive()
        return
      }
      clock.value.utcHour = utcHourOf(date)
    } else {
      const hour = clock.value.utcHour + (elapsed * clock.value.speed) / 3600
      wrapped = hour >= 24
      clock.value.utcHour = hour % 24
    }

    const target = clock.value.utcHour * 3600 + (wrapped ? 86400 : 0)
    const joined = addArrivals(simSeconds, target, target)
    const before = readers.length
    readers = readers.filter((r) => r.leaveAt > target)
    if (wrapped) {
      // Manual time-lapse rolls into the next October day.
      for (const r of readers) r.leaveAt -= 86400
      clock.value.dayIndex = (clock.value.dayIndex + 1) % DAYS_IN_MONTH
    }
    simSeconds = target % 86400
    recent.push({ at: realNow, joined, left: before - readers.length })
    publish()
  }

  /** Jump to a day / time; keeps running at the given speed. */
  function setTime(dayIndex: number, utcHour: number, speed = clock.value.speed) {
    clock.value = { live: false, dayIndex, utcHour, speed }
    reset()
  }

  function goLive() {
    const date = new Date()
    clock.value = { live: true, dayIndex: dayIndexFor(date), utcHour: utcHourOf(date), speed: 1 }
    reset()
  }

  function setSpeed(speed: number) {
    clock.value = { ...clock.value, live: false, speed }
  }

  watch(article, reset, { immediate: true })
  const timer = window.setInterval(tick, TICK_MS)
  onBeforeUnmount(() => window.clearInterval(timer))

  return {
    clock,
    count,
    dots,
    dotScale,
    joinedRecently,
    leftRecently,
    expectedNow,
    setTime,
    setSpeed,
    goLive,
  }
}

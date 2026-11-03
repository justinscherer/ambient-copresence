import type { Tuning, TuningKey } from './tuning'

/**
 * The crowd on a page, heard as a room. Everything is synthesized with Web Audio; there are
 * no audio files.
 *
 * - **Bed:** two decorrelated loops of low-passed pink noise, each drifting slowly around the
 *   stereo field, so the room tone never quite settles.
 * - **Arrival:** a soft, short crunch (a cluster of tiny crackles) at a random stereo position.
 * - **Departure:** a short, dull rustle, like clothes rubbing together.
 * - **Drift:** each play nudges a cue's filter frequency, attack and decay a little (±2% by
 *   default), never far from its baseline (±10%), so no two cues are quite alike.
 *
 * Every value comes from a live `Tuning` object (see tuning.ts), so it can be tuned by ear.
 * - **Resonator:** the room tone and every cue also feed one bank of narrow band-pass filters
 *   on C dorian and its harmonics, which ring longer as more people read.
 * - **Room:** every cue runs through a stereo reverb whose size follows log10(readers): a few
 *   readers sound like a small, close room; thousands sound like a hall.
 */

/** Readers at which the room reaches full size (the same scale as the tide's dome). */
export const FULL_AT = 10_000

/** Room size 0–1 for a reader count, on a log10 scale. */
export function roomSize(readers: number): number {
  if (readers <= 0) return 0
  return Math.min(1, Math.log10(1 + readers) / Math.log10(1 + FULL_AT))
}

/**
 * A convolver's impulse response can't morph, so room size moves in steps. Each step loads a
 * new response into the idle convolver and crossfades to it.
 */
const REVERB_STEPS = 10
const CROSSFADE_S = 2.5
const MIN_SWAP_S = 3
/** Tail brightness at its start, for the smallest and the largest room. */
const TAIL_BRIGHT_SMALL_HZ = 9000
const TAIL_BRIGHT_LARGE_HZ = 6000
/** Early reflections land within this time, for the smallest and the largest room. */
const REFLECTIONS_SPAN_SMALL_S = 0.008
const REFLECTIONS_SPAN_LARGE_S = 0.06

/** Room-tone voices: loop length, and the base rates of their slow pan, cutoff and level LFOs. */
const BED_VOICES = [
  { seconds: 6.3, pan: 0.031, panSign: 1, cutoff: 0.017, level: 0.023 },
  { seconds: 7.1, pan: 0.047, panSign: -1, cutoff: 0.013, level: 0.029 },
]

interface CueFilter {
  type: 'bandpass' | 'lowpass'
  /** Cutoff or centre as a multiple of the cue's frequency. */
  ratio: number
  /** Linear Q. */
  q: number
}

/** A cue's baseline sound. Frequency, attack and decay drift a little from these on every play. */
interface CueVoice {
  gain: number
  panWidth: number
  frequency: number
  /** Seconds. */
  attack: number
  /** Seconds. */
  decay: number
  filters: CueFilter[]
}

/** Arrival: a crunch, band-passed. */
function crunchVoice(t: Tuning): CueVoice {
  return {
    gain: t.arrivalGain,
    panWidth: t.arrivalPan,
    frequency: t.arrivalFrequency,
    attack: t.arrivalAttack / 1000,
    decay: t.arrivalDecay / 1000,
    filters: [{ type: 'bandpass', ratio: 1, q: t.arrivalQ }],
  }
}

/** Departure: a dull rustle, band-passed then low-passed. */
function rustleVoice(t: Tuning): CueVoice {
  return {
    gain: t.departureGain,
    panWidth: t.departurePan,
    frequency: t.departureFrequency,
    attack: t.departureAttack / 1000,
    decay: t.departureDecay / 1000,
    filters: [
      { type: 'bandpass', ratio: 1, q: t.departureQ },
      { type: 'lowpass', ratio: t.departureLowpass, q: Math.SQRT1_2 },
    ],
  }
}

/** C dorian, as semitones above C. */
const DORIAN = [0, 2, 3, 5, 7, 9, 10]
/** C0 in Hz, with A4 at 440 Hz. */
const C0_HZ = 440 * 2 ** (-57 / 12)
/** Partials closer than this (in cents) share one filter. */
const MERGE_CENTS = 15
/** A partial within this many cents of a C dorian degree counts as in the scale. */
const IN_SCALE_CENTS = 20
/** Partials above this are left out. */
const MAX_RESONANCE_HZ = 16000
/**
 * Each resonance is scaled by √Q, so its level holds as the decay (and Q) grows, and the bank
 * by 1/√(filters). This factor then brings pink noise out of the bank at about the level it went in.
 */
const BANK_MAKEUP = 4.3

/** One filter in the resonator: a pitch, and the scale notes' partials that land on it. */
interface Resonance {
  frequency: number
  partials: { n: number; inScale: boolean }[]
}

function cents(a: number, b: number): number {
  return 1200 * Math.log2(a / b)
}

function inDorian(frequency: number): boolean {
  const pitchClass = (((cents(frequency, C0_HZ) % 1200) + 1200) % 1200) / 100
  return DORIAN.some((degree) => {
    const distance = Math.abs(pitchClass - degree) * 100
    return Math.min(distance, 1200 - distance) <= IN_SCALE_CENTS
  })
}

/**
 * C dorian across `resonanceOctaves` octaves from C at `resonanceOctave`, each note with its
 * first `resonancePartials` harmonics (equal-tempered fundamentals, pure harmonics).
 */
export function resonances(t: Tuning): Resonance[] {
  const out: Resonance[] = []
  for (let octave = 0; octave < t.resonanceOctaves; octave++) {
    for (const degree of DORIAN) {
      const fundamental = C0_HZ * 2 ** (t.resonanceOctave + octave + degree / 12)
      for (let n = 1; n <= t.resonancePartials; n++) {
        const frequency = fundamental * n
        if (frequency > MAX_RESONANCE_HZ) break
        const partial = { n, inScale: n === 1 || inDorian(frequency) }
        const same = out.find((r) => Math.abs(cents(r.frequency, frequency)) < MERGE_CENTS)
        if (same) same.partials.push(partial)
        else out.push({ frequency, partials: [partial] })
      }
    }
  }
  return out
}

/** Pre-rendered textures for each cue; each play picks one at random. */
const VARIANTS = 8
/** Wait this long after the last slider move before re-rendering textures or the reverb. */
const RERENDER_MS = 250

const FADE_IN_S = 1.5
const FADE_OUT_S = 0.4

export interface RoomSound {
  /** Fade in (resuming the audio context). Call from a user gesture the first time. */
  start(): Promise<void>
  /** Fade out, then suspend the audio context. */
  stop(): Promise<void>
  /** Resize the room (bed level and reverb) for this many readers. */
  setReaders(readers: number): void
  /** Play an arrival `delay` seconds from now. */
  arrive(delay?: number): void
  /** Play a departure `delay` seconds from now. */
  leave(delay?: number): void
  /** Apply changed tuning values: live ones at once, rendered ones after a short pause. */
  retune(): void
  close(): Promise<void>
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Exponential interpolation, for times and frequencies. */
function expLerp(a: number, b: number, t: number): number {
  return a * Math.pow(b / a, t)
}

function randomBetween(a: number, b: number): number {
  return lerp(a, b, Math.random())
}

/** One-pole low-pass coefficient for a cutoff frequency. */
function onePole(cutoffHz: number, sampleRate: number): number {
  return 1 - Math.exp((-2 * Math.PI * cutoffHz) / sampleRate)
}

/**
 * Peak of `data` after the cue's filters at `frequency`, using the same biquads Web Audio
 * uses (Audio EQ Cookbook; band-pass with 0 dB peak gain).
 */
function filteredPeak(
  data: Float32Array,
  filters: CueFilter[],
  frequency: number,
  sampleRate: number,
): number {
  let signal = data
  for (const filter of filters) {
    const w0 = (2 * Math.PI * frequency * filter.ratio) / sampleRate
    const alpha = Math.sin(w0) / (2 * filter.q)
    const cos = Math.cos(w0)
    const [b0, b1, b2] =
      filter.type === 'bandpass' ? [alpha, 0, -alpha] : [(1 - cos) / 2, 1 - cos, (1 - cos) / 2]
    const [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha]
    const out = new Float32Array(signal.length)
    let x1 = 0
    let x2 = 0
    let y1 = 0
    let y2 = 0
    for (let i = 0; i < signal.length; i++) {
      const x = signal[i]
      const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
      out[i] = y
      x2 = x1
      x1 = x
      y2 = y1
      y1 = y
    }
    signal = out
  }
  let peak = 0
  for (const v of signal) peak = Math.max(peak, Math.abs(v))
  return peak
}

/**
 * A multiplier that starts at 1 and wanders by up to ±`driftStep`% of itself each call,
 * clamped to 1 ± `driftLimit`%.
 */
function drift(t: Tuning): () => number {
  let value = 1
  return () => {
    const step = t.driftStep / 100
    const limit = t.driftLimit / 100
    value *= 1 + randomBetween(-step, step)
    value = Math.max(1 - limit, Math.min(1 + limit, value))
    return value
  }
}

/** A string that changes whenever any of `keys` does. */
function signature(t: Tuning, keys: TuningKey[]): string {
  return keys.map((key) => t[key]).join()
}

/** `tuning` is read live: change its values, then call `retune()`. */
export function createRoomSound(tuning: Tuning): RoomSound {
  const t = tuning
  /** Room size 0–1 for the current reader count (see roomSize). */
  let size = 0
  const ctx = new AudioContext({ latencyHint: 'playback' })
  const sr = ctx.sampleRate

  /* Output: compressor guards against bursts of cues. */
  const master = ctx.createGain()
  master.gain.value = 0
  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = t.compressorThreshold
  compressor.knee.value = 12
  compressor.ratio.value = t.compressorRatio
  compressor.attack.value = 0.005
  compressor.release.value = 0.25
  compressor.connect(master).connect(ctx.destination)

  const dry = ctx.createGain()
  dry.connect(compressor)

  /* Reverb: pre-delay → two convolvers (crossfaded) → wet return. */
  const reverbIn = ctx.createGain()
  // Room for the pre-delay slider's 500 ms maximum.
  const preDelay = ctx.createDelay(0.5)
  preDelay.delayTime.value = t.preDelaySmall / 1000
  const wet = ctx.createGain()
  wet.gain.value = t.wetSmall
  reverbIn.connect(preDelay)
  wet.connect(compressor)
  const convolvers = [0, 1].map(() => {
    const convolver = ctx.createConvolver()
    const level = ctx.createGain()
    level.gain.value = 0
    preDelay.connect(convolver)
    convolver.connect(level).connect(wet)
    return { convolver, level }
  })
  let active = 0
  let step = -1
  let lastSwap = -Infinity

  /* ---------------------------------------------------------------------------------------
   * Bed: low-passed pink noise drifting in stereo
   * ------------------------------------------------------------------------------------- */

  /** Seamlessly looping pink noise (Paul Kellet's filter), its seam crossfaded. */
  function pinkNoise(seconds: number): AudioBuffer {
    const length = Math.floor(seconds * sr)
    const fade = Math.floor(0.5 * sr)
    const raw = new Float32Array(length + fade)
    let b0 = 0
    let b1 = 0
    let b2 = 0
    let b3 = 0
    let b4 = 0
    let b5 = 0
    let b6 = 0
    for (let i = 0; i < raw.length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      raw[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
    const buffer = ctx.createBuffer(1, length, sr)
    const data = buffer.getChannelData(0)
    data.set(raw.subarray(0, length))
    // Blend the overflow into the start (equal power: the two are uncorrelated).
    for (let i = 0; i < fade; i++) {
      const t = i / fade
      data[i] = raw[i] * Math.sin((t * Math.PI) / 2) + raw[length + i] * Math.cos((t * Math.PI) / 2)
    }
    return buffer
  }

  // No reverb: the room tone is the room itself, not something in it. It does feed the
  // resonator, whose ringing does reach the reverb (see below).
  const bed = ctx.createGain()
  bed.gain.value = t.bedGainSmall

  const scheduled: AudioScheduledSourceNode[] = []

  /** A slow sine LFO added onto an AudioParam; returns its rate and depth to retune. */
  function lfo(param: AudioParam) {
    const osc = ctx.createOscillator()
    const amount = ctx.createGain()
    osc.connect(amount).connect(param)
    scheduled.push(osc)
    return { rate: osc.frequency, depth: amount.gain }
  }

  const bedVoices = BED_VOICES.map((voice) => {
    const source = ctx.createBufferSource()
    source.buffer = pinkNoise(voice.seconds)
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = t.bedCutoffSmall
    const level = ctx.createGain()
    const panner = ctx.createStereoPanner()
    source.connect(filter).connect(level).connect(panner).connect(bed)
    scheduled.push(source)
    // The two voices circle in opposite directions at different, slow rates.
    return {
      voice,
      filter,
      pan: lfo(panner.pan),
      cutoff: lfo(filter.frequency),
      level: lfo(level.gain),
    }
  })

  function tuneBed() {
    for (const { voice, filter, pan, cutoff, level } of bedVoices) {
      // Web Audio reads a low-pass Q in dB.
      filter.Q.value = 20 * Math.log10(t.bedQ)
      pan.rate.value = voice.pan * t.bedDriftSpeed
      cutoff.rate.value = voice.cutoff * t.bedDriftSpeed
      cutoff.depth.value = t.bedCutoffWobble
      level.rate.value = voice.level * t.bedDriftSpeed
      level.depth.value = t.bedLevelWobble
    }
  }
  tuneBed()
  // Stereo drift follows room size (see tuneRoom); start at the small room's.
  for (const { voice, pan } of bedVoices) pan.depth.value = voice.panSign * t.bedPanDepthSmall
  let bedStarted = false

  /* ---------------------------------------------------------------------------------------
   * Cues
   * ------------------------------------------------------------------------------------- */

  /*
   * Each cue is a pre-rendered texture (unfiltered, no envelope). Filters and the
   * attack/decay envelope are applied live, so they can drift from play to play.
   */

  /** Longest a cue can sound: attack and decay both drifted to their limit, plus a margin. */
  function cueSeconds(voice: CueVoice): number {
    return (voice.attack + voice.decay) * (1 + t.driftLimit / 100) + 0.05
  }

  /** Scale a texture so it peaks at 1 after the voice's filters at their baseline. */
  function texture(voice: CueVoice, fill: (data: Float32Array) => void): AudioBuffer {
    const buffer = ctx.createBuffer(1, Math.ceil(cueSeconds(voice) * sr), sr)
    const data = buffer.getChannelData(0)
    fill(data)
    const peak = filteredPeak(data, voice.filters, voice.frequency, sr)
    if (peak > 0) for (let i = 0; i < data.length; i++) data[i] /= peak
    return buffer
  }

  /** Crunch texture: a dense scatter of tiny crackles. */
  function crunch(): AudioBuffer {
    return texture(crunchVoice(t), (data) => {
      const grains = Math.round(t.arrivalDensity * randomBetween(0.75, 1.25) * (data.length / sr))
      for (let g = 0; g < grains; g++) {
        const amp = randomBetween(0.2, 1)
        const grainLength = Math.ceil(randomBetween(0.0003, 0.0015) * sr)
        const start = Math.floor(Math.random() * data.length)
        for (let i = 0; i < grainLength && start + i < data.length; i++) {
          data[start + i] += (Math.random() * 2 - 1) * amp * Math.exp((-5 * i) / grainLength)
        }
      }
    })
  }

  /** Rustle texture: noise with a fabric flutter and a slow back-and-forth rub. */
  function rustle(): AudioBuffer {
    return texture(rustleVoice(t), (data) => {
      const flutterRate = onePole(randomBetween(40, 80), sr)
      const rubHz = t.departureRubHz * randomBetween(0.75, 1.25)
      const rubPhase = Math.random() * 2 * Math.PI
      let flutter = 0
      for (let i = 0; i < data.length; i++) {
        flutter += flutterRate * (Math.random() * 2 - 1 - flutter)
        const rub =
          1 -
          t.departureRubDepth +
          t.departureRubDepth * Math.sin((2 * Math.PI * rubHz * i) / sr + rubPhase)
        // The smoothed flutter is small (σ ≈ 0.04): at 8 it's about a ±30% wobble.
        data[i] = (Math.random() * 2 - 1) * rub * (0.7 + t.departureFlutter * flutter)
      }
    })
  }

  const cueSend = ctx.createGain()
  cueSend.connect(reverbIn)

  /* ---------------------------------------------------------------------------------------
   * Resonator: narrow band-pass filters on C dorian and its harmonics
   * ------------------------------------------------------------------------------------- */

  /**
   * A bank of resonances fed by `input`, mixed into `output` at the dry/wet setting. The
   * filters ring longer as the room grows.
   */
  function createBank(input: AudioNode, output: AudioNode) {
    const wetLevel = ctx.createGain()
    wetLevel.gain.value = t.resonanceMix / 100
    wetLevel.connect(output)
    let filters: { resonance: Resonance; biquad: BiquadFilterNode; level: GainNode }[] = []

    /** Set each filter's Q from the wanted ring time, and its level from its partials. */
    function tune(glide: number) {
      const now = ctx.currentTime
      const decay = expLerp(t.resonanceDecaySmall, t.resonanceDecayLarge, size)
      const scale = (BANK_MAKEUP * t.resonanceLevel) / Math.sqrt(Math.max(1, filters.length))
      for (const { resonance, biquad, level } of filters) {
        // A band-pass rings for RT60 ≈ Q · ln(1000) / (π · f), so solve for Q.
        const q = (decay * Math.PI * resonance.frequency) / Math.log(1000)
        const weight = resonance.partials.reduce(
          (sum, p) => sum + (p.inScale ? 1 : t.resonanceOutOfScale) / p.n ** t.resonanceRolloff,
          0,
        )
        biquad.Q.setTargetAtTime(q, now, glide)
        level.gain.setTargetAtTime(weight * Math.sqrt(q) * scale, now, glide)
      }
      wetLevel.gain.setTargetAtTime(t.resonanceMix / 100, now, glide)
    }

    /** (Re)build the filters for the current scale range and harmonics. */
    function build() {
      for (const { biquad, level } of filters) {
        input.disconnect(biquad)
        level.disconnect()
      }
      filters = resonances(t).map((resonance) => {
        const biquad = ctx.createBiquadFilter()
        biquad.type = 'bandpass'
        biquad.frequency.value = resonance.frequency
        const level = ctx.createGain()
        level.gain.value = 0
        input.connect(biquad).connect(level).connect(wetLevel)
        return { resonance, biquad, level }
      })
      tune(0.02)
    }

    build()
    return { build, tune }
  }

  /** Dry share of a bus around its resonator (1 − dry/wet). */
  function dryShare() {
    return 1 - t.resonanceMix / 100
  }

  // Room tone: its dry share goes straight out, never to the reverb.
  const bedDry = ctx.createGain()
  bedDry.gain.value = dryShare()
  bed.connect(bedDry).connect(dry)

  // Cues: their dry share goes out and to the reverb.
  const cueBus = ctx.createGain()
  const cueDry = ctx.createGain()
  cueDry.gain.value = dryShare()
  const cueOut = ctx.createGain()
  cueBus.connect(cueDry).connect(cueOut)
  cueOut.connect(dry)
  cueOut.connect(cueSend)

  // One resonator for both (half the filters of one each), so its ringing, the room tone's
  // included, goes out and to the reverb with the cues.
  const resonatorIn = ctx.createGain()
  bed.connect(resonatorIn)
  cueBus.connect(resonatorIn)
  const bank = createBank(resonatorIn, cueOut)

  function tuneResonator(glide: number) {
    const now = ctx.currentTime
    bedDry.gain.setTargetAtTime(dryShare(), now, glide)
    cueDry.gain.setTargetAtTime(dryShare(), now, glide)
    bank.tune(glide)
  }

  function cuePlayer(voiceOf: (t: Tuning) => CueVoice, render: () => AudioBuffer) {
    let textures = Array.from({ length: VARIANTS }, render)
    const frequency = drift(t)
    const attack = drift(t)
    const decay = drift(t)

    function play(delay = 0) {
      const voice = voiceOf(t)
      const f = voice.frequency * frequency()
      const a = voice.attack * attack()
      const d = voice.decay * decay()
      const at = ctx.currentTime + Math.max(0, delay)

      const source = ctx.createBufferSource()
      source.buffer = textures[Math.floor(Math.random() * textures.length)]
      let node: AudioNode = source
      for (const filter of voice.filters) {
        const biquad = ctx.createBiquadFilter()
        biquad.type = filter.type
        biquad.frequency.value = f * filter.ratio
        // Web Audio reads a low-pass Q in dB.
        biquad.Q.value = filter.type === 'lowpass' ? 20 * Math.log10(filter.q) : filter.q
        node = node.connect(biquad)
      }
      const envelope = ctx.createGain()
      const peak = voice.gain * randomBetween(1 - t.driftLimit / 100, 1)
      envelope.gain.setValueAtTime(0, at)
      envelope.gain.linearRampToValueAtTime(peak, at + a)
      envelope.gain.exponentialRampToValueAtTime(0.0001, at + a + d)
      const panner = ctx.createStereoPanner()
      panner.pan.value = randomBetween(-voice.panWidth, voice.panWidth)
      node.connect(envelope).connect(panner)
      panner.connect(cueBus)
      source.onended = () => panner.disconnect()
      source.start(at)
      source.stop(at + a + d + 0.01)
    }

    return { play, rerender: () => (textures = Array.from({ length: VARIANTS }, render)) }
  }

  const arrivals = cuePlayer(crunchVoice, crunch)
  const departures = cuePlayer(rustleVoice, rustle)

  /* ---------------------------------------------------------------------------------------
   * Room size
   * ------------------------------------------------------------------------------------- */

  /**
   * A stereo room response: decorrelated noise under an exponential decay, high frequencies
   * dying first, with a few early reflections. Small rooms are short and bright; large rooms
   * long and dark.
   */
  function impulse(size: number): AudioBuffer {
    const rt60 = expLerp(t.rt60Small, t.rt60Large, size)
    const length = Math.ceil(rt60 * 1.1 * sr)
    const buffer = ctx.createBuffer(2, length, sr)
    const decay = Math.log(1000) / rt60
    const bright = onePole(lerp(TAIL_BRIGHT_SMALL_HZ, TAIL_BRIGHT_LARGE_HZ, size), sr)
    const dark = onePole(expLerp(t.toneSmall, t.toneLarge, size), sr)
    const reflections = Math.round(lerp(t.reflectionsSmall, t.reflectionsLarge, size))
    const reflectionSpan = lerp(REFLECTIONS_SPAN_SMALL_S, REFLECTIONS_SPAN_LARGE_S, size)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      let lp = 0
      for (let i = 0; i < length; i++) {
        const t = i / sr
        const coefficient = dark + (bright - dark) * Math.exp(-t / (rt60 * 0.3))
        lp += coefficient * (Math.random() * 2 - 1 - lp)
        data[i] = lp * Math.exp(-decay * t)
      }
      for (let r = 0; r < reflections; r++) {
        const i = Math.floor(Math.random() * reflectionSpan * sr)
        data[i] += (Math.random() < 0.5 ? -1 : 1) * randomBetween(0.3, 0.8)
      }
    }
    return buffer
  }

  /** Equal-power fade curves (the two tails are uncorrelated). */
  const fadeIn = Float32Array.from({ length: 32 }, (_, i) => Math.sin(((i / 31) * Math.PI) / 2))
  const fadeOut = Float32Array.from({ length: 32 }, (_, i) => Math.cos(((i / 31) * Math.PI) / 2))

  /** Glide the room's continuous values toward this size (`glide`: time constant, seconds). */
  function tuneRoom(glide: number) {
    const now = ctx.currentTime
    preDelay.delayTime.setTargetAtTime(
      lerp(t.preDelaySmall, t.preDelayLarge, size) / 1000,
      now,
      glide,
    )
    wet.gain.setTargetAtTime(lerp(t.wetSmall, t.wetLarge, size), now, glide)
    bed.gain.setTargetAtTime(lerp(t.bedGainSmall, t.bedGainLarge, size), now, glide)
    const cutoff = expLerp(t.bedCutoffSmall, t.bedCutoffLarge, size)
    // A quiet page's room tone barely moves; a busy page's swings across the stereo field.
    const panDepth = lerp(t.bedPanDepthSmall, t.bedPanDepthLarge, size)
    for (const { voice, filter, pan } of bedVoices) {
      filter.frequency.setTargetAtTime(cutoff, now, glide)
      pan.depth.setTargetAtTime(voice.panSign * panDepth, now, glide)
    }
    // More readers, longer rings.
    tuneResonator(glide)
  }

  /** Load the response for room step `next` into the idle convolver and crossfade to it. */
  function swapReverb(next: number) {
    const now = ctx.currentTime
    const idle = 1 - active
    convolvers[idle].convolver.buffer = impulse(next / (REVERB_STEPS - 1))
    for (const [index, curve] of [
      [idle, fadeIn],
      [active, fadeOut],
    ] as const) {
      const gain = convolvers[index].level.gain
      gain.cancelScheduledValues(now)
      gain.setValueCurveAtTime(curve, now, CROSSFADE_S)
    }
    active = idle
    step = next
    lastSwap = now
  }

  function setReaders(readers: number) {
    size = roomSize(readers)
    tuneRoom(1.5)

    const now = ctx.currentTime
    const next = Math.round(size * (REVERB_STEPS - 1))
    if (next === step) return
    if (step < 0) {
      // First size: no crossfade.
      convolvers[active].convolver.buffer = impulse(next / (REVERB_STEPS - 1))
      convolvers[active].level.gain.value = 1
      step = next
      lastSwap = now
      return
    }
    // Called every tick, so a swap held back here happens on a later call.
    if (now - lastSwap < MIN_SWAP_S) return
    swapReverb(next)
  }

  /* ---------------------------------------------------------------------------------------
   * Tuning
   * ------------------------------------------------------------------------------------- */

  const ARRIVAL_TEXTURE: TuningKey[] = [
    'arrivalFrequency',
    'arrivalQ',
    'arrivalAttack',
    'arrivalDecay',
    'arrivalDensity',
    'driftLimit',
  ]
  const DEPARTURE_TEXTURE: TuningKey[] = [
    'departureFrequency',
    'departureQ',
    'departureLowpass',
    'departureAttack',
    'departureDecay',
    'departureFlutter',
    'departureRubHz',
    'departureRubDepth',
    'driftLimit',
  ]
  const REVERB: TuningKey[] = [
    'rt60Small',
    'rt60Large',
    'toneSmall',
    'toneLarge',
    'reflectionsSmall',
    'reflectionsLarge',
  ]
  const RESONATOR_SHAPE: TuningKey[] = ['resonanceOctave', 'resonanceOctaves', 'resonancePartials']
  const rendered = {
    resonator: signature(t, RESONATOR_SHAPE),
    arrivals: signature(t, ARRIVAL_TEXTURE),
    departures: signature(t, DEPARTURE_TEXTURE),
    reverb: signature(t, REVERB),
  }
  let rerenderTimer = 0

  /** Re-render whatever textures or reverb the tuning has changed since they were made. */
  function rerender() {
    if (signature(t, RESONATOR_SHAPE) !== rendered.resonator) {
      bank.build()
      rendered.resonator = signature(t, RESONATOR_SHAPE)
    }
    if (signature(t, ARRIVAL_TEXTURE) !== rendered.arrivals) {
      arrivals.rerender()
      rendered.arrivals = signature(t, ARRIVAL_TEXTURE)
    }
    if (signature(t, DEPARTURE_TEXTURE) !== rendered.departures) {
      departures.rerender()
      rendered.departures = signature(t, DEPARTURE_TEXTURE)
    }
    if (signature(t, REVERB) !== rendered.reverb && step >= 0) {
      // Crossfade to the new response now, whatever the swap spacing.
      swapReverb(step)
      rendered.reverb = signature(t, REVERB)
    }
  }

  function retune() {
    const now = ctx.currentTime
    compressor.threshold.setTargetAtTime(t.compressorThreshold, now, 0.05)
    compressor.ratio.setTargetAtTime(t.compressorRatio, now, 0.05)
    if (running) {
      master.gain.cancelScheduledValues(now)
      master.gain.setTargetAtTime(t.master, now, 0.05)
    }
    tuneBed()
    tuneRoom(0.05)
    window.clearTimeout(rerenderTimer)
    rerenderTimer = window.setTimeout(rerender, RERENDER_MS)
  }

  /* ---------------------------------------------------------------------------------------
   * Transport
   * ------------------------------------------------------------------------------------- */

  let running = false

  async function start() {
    running = true
    const resumed = ctx.resume()
    if (!bedStarted) {
      for (const node of scheduled) node.start()
      bedStarted = true
    }
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(t.master, now + FADE_IN_S)
    await resumed
  }

  async function stop() {
    running = false
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0, now + FADE_OUT_S)
    await new Promise((resolve) => window.setTimeout(resolve, FADE_OUT_S * 1000 + 50))
    // Started again while fading out.
    if (!running) await ctx.suspend()
  }

  return {
    start,
    stop,
    setReaders,
    arrive: arrivals.play,
    leave: departures.play,
    retune,
    close: () => {
      window.clearTimeout(rerenderTimer)
      return ctx.close()
    },
  }
}

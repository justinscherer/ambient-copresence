/**
 * Every sound-design value the room uses, with slider ranges for tuning by ear. The engine
 * and the cue thinning read these live, so moving a slider changes the next sound.
 */

export interface TuningParam {
  label: string
  min: number
  max: number
  step: number
  unit?: string
  value: number
}

export const TUNING_PARAMS = {
  /* Arrivals: the crunch. */
  arrivalRate: {
    label: 'Most cues per second',
    min: 0.5,
    max: 40,
    step: 0.5,
    unit: '/s',
    value: 29,
  },
  arrivalGain: { label: 'Level', min: 0, max: 1, step: 0.01, value: 0.15 },
  arrivalPan: { label: 'Stereo width', min: 0, max: 1, step: 0.01, value: 0.8 },
  arrivalFrequency: {
    label: 'Band-pass centre',
    min: 200,
    max: 12000,
    step: 10,
    unit: 'Hz',
    value: 3910,
  },
  arrivalQ: { label: 'Band-pass Q', min: 0.1, max: 10, step: 0.05, value: 1.25 },
  arrivalAttack: { label: 'Attack', min: 1, max: 500, step: 1, unit: 'ms', value: 6 },
  arrivalDecay: { label: 'Decay', min: 10, max: 2000, step: 5, unit: 'ms', value: 60 },
  arrivalDensity: {
    label: 'Crackles per second',
    min: 20,
    max: 3000,
    step: 10,
    unit: '/s',
    value: 160,
  },

  /* Departures: the rustle. */
  departureRate: {
    label: 'Most cues per second',
    min: 0.25,
    max: 20,
    step: 0.25,
    unit: '/s',
    value: 3.25,
  },
  departureShare: {
    label: 'Share of departures heard',
    min: 0,
    max: 1,
    step: 0.01,
    value: 0.87,
  },
  departureGain: { label: 'Level', min: 0, max: 1, step: 0.01, value: 0.09 },
  departurePan: { label: 'Stereo width', min: 0, max: 1, step: 0.01, value: 0.52 },
  departureFrequency: {
    label: 'Band-pass centre',
    min: 60,
    max: 4000,
    step: 5,
    unit: 'Hz',
    value: 515,
  },
  departureQ: { label: 'Band-pass Q', min: 0.1, max: 10, step: 0.05, value: 0.8 },
  departureLowpass: {
    label: 'Low-pass (× centre)',
    min: 0.5,
    max: 8,
    step: 0.05,
    unit: '×',
    value: 1.3,
  },
  departureAttack: { label: 'Attack', min: 1, max: 1000, step: 1, unit: 'ms', value: 389 },
  departureDecay: { label: 'Decay', min: 10, max: 3000, step: 5, unit: 'ms', value: 840 },
  departureFlutter: { label: 'Fabric flutter', min: 0, max: 20, step: 0.5, value: 0.5 },
  departureRubHz: { label: 'Rub speed', min: 1, max: 40, step: 0.5, unit: 'Hz', value: 29.5 },
  departureRubDepth: { label: 'Rub depth', min: 0, max: 1, step: 0.01, value: 0.22 },

  /* Per-play variation of both cues' filter, attack and decay. */
  driftStep: { label: 'Drift per cue', min: 0, max: 10, step: 0.1, unit: '%', value: 2 },
  driftLimit: { label: 'Drift limit', min: 0, max: 50, step: 0.5, unit: '%', value: 10 },

  /* Reverb, from the smallest room (1 reader) to the largest (10,000+). */
  rt60Small: { label: 'Tail, small room', min: 0.05, max: 5, step: 0.05, unit: 's', value: 0.15 },
  rt60Large: { label: 'Tail, large room', min: 0.2, max: 20, step: 0.1, unit: 's', value: 13.2 },
  preDelaySmall: {
    label: 'Pre-delay, small room',
    min: 0,
    max: 150,
    step: 1,
    unit: 'ms',
    value: 1,
  },
  preDelayLarge: {
    label: 'Pre-delay, large room',
    min: 0,
    max: 190,
    step: 1,
    unit: 'ms',
    value: 119,
  },
  wetSmall: { label: 'Return, small room', min: 0, max: 2, step: 0.01, value: 0.05 },
  wetLarge: { label: 'Return, large room', min: 0, max: 2, step: 0.01, value: 1.38 },
  toneSmall: {
    label: 'Tail tone, small room',
    min: 300,
    max: 12000,
    step: 50,
    unit: 'Hz',
    value: 8850,
  },
  toneLarge: {
    label: 'Tail tone, large room',
    min: 300,
    max: 12000,
    step: 50,
    unit: 'Hz',
    value: 8200,
  },
  reflectionsSmall: { label: 'Early reflections, small room', min: 0, max: 40, step: 1, value: 2 },
  reflectionsLarge: { label: 'Early reflections, large room', min: 0, max: 40, step: 1, value: 17 },

  /* Room tone. */
  bedGainSmall: { label: 'Level, small room', min: 0, max: 1, step: 0.005, value: 0.145 },
  bedGainLarge: { label: 'Level, large room', min: 0, max: 1, step: 0.005, value: 0.175 },
  bedCutoffSmall: {
    label: 'Low-pass, small room',
    min: 40,
    max: 4000,
    step: 5,
    unit: 'Hz',
    value: 545,
  },
  bedCutoffLarge: {
    label: 'Low-pass, large room',
    min: 40,
    max: 4000,
    step: 5,
    unit: 'Hz',
    value: 520,
  },
  bedQ: { label: 'Low-pass Q', min: 0.1, max: 10, step: 0.05, value: 0.5 },
  bedPanDepth: { label: 'Stereo drift', min: 0, max: 1, step: 0.01, value: 0.8 },
  bedDriftSpeed: { label: 'Drift speed', min: 0.1, max: 20, step: 0.1, unit: '×', value: 1 },
  bedCutoffWobble: { label: 'Low-pass wobble', min: 0, max: 400, step: 5, unit: 'Hz', value: 105 },
  bedLevelWobble: { label: 'Level wobble', min: 0, max: 1, step: 0.01, value: 0.29 },

  /* Output. */
  master: { label: 'Master level', min: 0, max: 1.5, step: 0.01, value: 0.81 },
  compressorThreshold: {
    label: 'Compressor threshold',
    min: -60,
    max: 0,
    step: 1,
    unit: 'dB',
    value: -18,
  },
  compressorRatio: { label: 'Compressor ratio', min: 1, max: 20, step: 0.5, value: 4 },
} satisfies Record<string, TuningParam>

export type TuningKey = keyof typeof TUNING_PARAMS
export type Tuning = Record<TuningKey, number>

export const TUNING_GROUPS: { label: string; keys: TuningKey[] }[] = [
  {
    label: 'Arrivals',
    keys: [
      'arrivalRate',
      'arrivalGain',
      'arrivalPan',
      'arrivalFrequency',
      'arrivalQ',
      'arrivalAttack',
      'arrivalDecay',
      'arrivalDensity',
    ],
  },
  {
    label: 'Departures',
    keys: [
      'departureRate',
      'departureShare',
      'departureGain',
      'departurePan',
      'departureFrequency',
      'departureQ',
      'departureLowpass',
      'departureAttack',
      'departureDecay',
      'departureFlutter',
      'departureRubHz',
      'departureRubDepth',
    ],
  },
  { label: 'Variation', keys: ['driftStep', 'driftLimit'] },
  {
    label: 'Reverb',
    keys: [
      'rt60Small',
      'rt60Large',
      'preDelaySmall',
      'preDelayLarge',
      'wetSmall',
      'wetLarge',
      'toneSmall',
      'toneLarge',
      'reflectionsSmall',
      'reflectionsLarge',
    ],
  },
  {
    label: 'Room tone',
    keys: [
      'bedGainSmall',
      'bedGainLarge',
      'bedCutoffSmall',
      'bedCutoffLarge',
      'bedQ',
      'bedPanDepth',
      'bedDriftSpeed',
      'bedCutoffWobble',
      'bedLevelWobble',
    ],
  },
  { label: 'Output', keys: ['master', 'compressorThreshold', 'compressorRatio'] },
]

export function defaultTuning(): Tuning {
  return Object.fromEntries(
    Object.entries(TUNING_PARAMS).map(([key, param]) => [key, param.value]),
  ) as Tuning
}

/** Only the values that differ from the defaults, for copying back into code. */
export function changedTuning(tuning: Tuning): Partial<Tuning> {
  return Object.fromEntries(
    Object.entries(tuning).filter(
      ([key, value]) => value !== TUNING_PARAMS[key as TuningKey].value,
    ),
  ) as Partial<Tuning>
}

const STORAGE_KEY = 'ambient-copresence-audio:tuning'

/** Defaults overlaid with this browser's saved tuning, if any. */
export function loadTuning(): Tuning {
  const tuning = defaultTuning()
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    for (const key of Object.keys(tuning) as TuningKey[]) {
      if (typeof saved[key] === 'number') tuning[key] = saved[key]
    }
  } catch {
    /* No storage, or nothing valid saved: use the defaults. */
  }
  return tuning
}

export function saveTuning(tuning: Tuning) {
  try {
    const changed = changedTuning(tuning)
    if (Object.keys(changed).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(changed))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* Storage unavailable: tuning lasts until reload. */
  }
}

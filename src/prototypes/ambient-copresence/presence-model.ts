/**
 * How many people are reading a page right now?
 *
 * Arrivals: each article's real daily mobile-web views for one October 2026 day, spread
 * over the UTC day by that day's real site-wide hourly curve, then tilted per article by
 * audience geography and topic (Piccardi, Gerlach & West, "Curious Rhythms", 2023/24).
 *
 * Departures: each reader stays for a log-normal dwell time (TeBlunthuis, Bayer &
 * Vasileva, "Reading time" draft report / "Dwelling on Wikipedia", 2019).
 *
 * Readers present at an instant ≈ arrival rate × mean dwell (Little's law); the
 * simulation in usePresenceSimulation.ts plays this out reader by reader.
 *
 * Data: traffic.json (from scripts/fetch-copresence-traffic.mjs).
 */
import traffic from './traffic.json'

export interface ArticleTraffic {
  title: string
  displayTitle: string
  description: string
  length: number | null
  rank: number
  monthViews: number
  dailyViews: number[]
}

export const SOURCE = traffic.source
export const ARTICLES: ArticleTraffic[] = traffic.articles
const SITE_HOURLY: number[][] = traffic.siteHourly
export const DAYS_IN_MONTH = SITE_HOURLY.length
const [YEAR, MONTH] = SOURCE.month.split('-').map(Number)

export function normalizeTitle(title: string): string {
  return title.trim().replace(/ /g, '_')
}

export function findArticle(title: string | null | undefined): ArticleTraffic | undefined {
  if (!title) return undefined
  const key = normalizeTitle(title)
  return ARTICLES.find((a) => a.title === key)
}

/* ------------------------------------------------------------------------------------------
 * Time of day
 * ------------------------------------------------------------------------------------------
 * Curious Rhythms, Fig. 1 / RQ1: timezone-corrected (local-time) mobile traffic bottoms out
 * around 4–5am, rises through the day and peaks around 21:00, ~2× evening vs. daytime on
 * mobile; 24h + 12h cycles explain 94% of mobile variance. We model a reader's local rhythm
 * as exactly those two harmonics.
 *
 * Copresence happens at one shared instant, so the crowd on a page is the sum of local
 * rhythms across the reader's timezones. Parameters below were fit (least squares, with the
 * paper's peak/trough as constraints) so that the regional mix reproduces October 2026's
 * real enwiki mobile-web hourly UTC curve: RMSE 0.025 on a curve normalised to mean 1.
 * Fitted local rhythm: trough ≈ 5:30, peak ≈ 20:30, evening/midday ≈ 1.6×.
 */
const RHYTHM = { a1: 1.1, p1: 18.114, a2: 0.304, p2: 11.224 }

function localRhythm(localHour: number): number {
  const { a1, p1, a2, p2 } = RHYTHM
  return Math.exp(
    a1 * Math.cos((2 * Math.PI * (localHour - p1)) / 24) +
      a2 * Math.cos((4 * Math.PI * (localHour - p2)) / 24),
  )
}

/** Representative UTC offsets for October (northern-hemisphere DST still on). */
export const REGIONS = [
  { key: 'americas', label: 'Americas', utcOffset: -5 },
  { key: 'europeAfrica', label: 'Europe & Africa', utcOffset: 1.5 },
  { key: 'southAsia', label: 'South Asia', utcOffset: 5.5 },
  { key: 'eastAsiaOceania', label: 'East Asia & Oceania', utcOffset: 9 },
] as const

type RegionMix = [number, number, number, number]

/** Fitted share of enwiki mobile-web readers per region (same fit as RHYTHM). */
const SITE_MIX: RegionMix = [0.474, 0.237, 0.145, 0.144]

/**
 * Curious Rhythms, RQ3: topic shifts an article's rhythm away from the baseline —
 * film / TV / biography toward the evening; society, military and crime toward the
 * night; business & economics toward working hours. Expressed as a gentle bump in the
 * reader's local time (strength ~10–15%, in line with the paper's coefficient ranges).
 */
type TopicTilt = { peakLocalHour: number; strength: number } | null
const EVENING: TopicTilt = { peakLocalHour: 21, strength: 0.15 }
const NIGHT: TopicTilt = { peakLocalHour: 0, strength: 0.12 }
const WORKDAY: TopicTilt = { peakLocalHour: 13, strength: 0.1 }

/**
 * Per-article audience assumptions — judgment calls from each article's subject, since
 * public pageview data has no geography per article. Country is the strongest predictor
 * of rhythm in the paper, so these matter most for the two Indian films.
 * Order: Americas, Europe & Africa, South Asia, East Asia & Oceania.
 */
const AUDIENCE: Record<string, { mix: RegionMix; topic: TopicTilt; why: string }> = {
  Christa_Pike: { mix: [0.8, 0.1, 0.04, 0.06], topic: NIGHT, why: 'US crime news' },
  RJ_Mitte: { mix: [0.7, 0.15, 0.05, 0.1], topic: EVENING, why: 'US actor (TV)' },
  Jailer_2: { mix: [0.08, 0.07, 0.8, 0.05], topic: EVENING, why: 'Indian film' },
  Patrick_Stewart: { mix: [0.5, 0.32, 0.06, 0.12], topic: EVENING, why: 'English actor' },
  Katie_Zacharia: { mix: [0.82, 0.08, 0.03, 0.07], topic: null, why: 'US politics' },
  Elizabeth_Holmes: { mix: [0.72, 0.14, 0.06, 0.08], topic: WORKDAY, why: 'US business' },
  'Drishyam:_The_Conclusion': {
    mix: [0.07, 0.07, 0.82, 0.04],
    topic: EVENING,
    why: 'Indian film',
  },
  Lizzie_Borden: { mix: [0.75, 0.12, 0.04, 0.09], topic: NIGHT, why: 'US crime history' },
  Ansel_Adams: { mix: [0.65, 0.17, 0.07, 0.11], topic: null, why: 'US arts (culture)' },
  Nidal_Hasan: { mix: [0.75, 0.12, 0.05, 0.08], topic: NIGHT, why: 'US military crime' },
}

export function audienceNote(title: string): string {
  return AUDIENCE[title]?.why ?? ''
}

function topicFactor(topic: TopicTilt, localHour: number): number {
  if (!topic) return 1
  return Math.exp(topic.strength * Math.cos((2 * Math.PI * (localHour - topic.peakLocalHour)) / 24))
}

/** Relative crowd size at a UTC hour (any real number) for a regional mix + topic. */
function mixCurve(mix: RegionMix, topic: TopicTilt, utcHour: number): number {
  let sum = 0
  REGIONS.forEach((region, i) => {
    const local = (((utcHour + region.utcOffset) % 24) + 24) % 24
    sum += mix[i] * localRhythm(local) * topicFactor(topic, local)
  })
  return sum
}

/* ------------------------------------------------------------------------------------------
 * Arrival rate
 * ------------------------------------------------------------------------------------------ */

/** Real site-wide views at a fractional UTC hour of an October day (linear between hour centres). */
function siteViewsAt(dayIndex: number, utcHour: number): number {
  const x = dayIndex * 24 + utcHour - 0.5
  const last = DAYS_IN_MONTH * 24 - 1
  const i0 = Math.max(0, Math.min(last, Math.floor(x)))
  const i1 = Math.max(0, Math.min(last, i0 + 1))
  const f = Math.max(0, Math.min(1, x - i0))
  const v0 = SITE_HOURLY[Math.floor(i0 / 24)][i0 % 24]
  const v1 = SITE_HOURLY[Math.floor(i1 / 24)][i1 % 24]
  return v0 + (v1 - v0) * f
}

/** Unnormalised shape of an article's traffic over one UTC day. */
function shapeAt(article: ArticleTraffic, dayIndex: number, utcHour: number): number {
  const audience = AUDIENCE[article.title]
  const tilt = audience
    ? mixCurve(audience.mix, audience.topic, utcHour) / mixCurve(SITE_MIX, null, utcHour)
    : 1
  return siteViewsAt(dayIndex, utcHour) * tilt
}

const shapeMeans = new Map<string, number>()

/** Mean of shapeAt over the UTC day, so a day's arrivals sum to its real daily views. */
function shapeMean(article: ArticleTraffic, dayIndex: number): number {
  const key = `${article.title}|${dayIndex}`
  let mean = shapeMeans.get(key)
  if (mean === undefined) {
    const steps = 96
    let sum = 0
    for (let s = 0; s < steps; s++) sum += shapeAt(article, dayIndex, ((s + 0.5) * 24) / steps)
    mean = sum / steps
    shapeMeans.set(key, mean)
  }
  return mean
}

/** Expected arrivals per second at a UTC hour of an October day (0-based day index). */
export function arrivalRate(article: ArticleTraffic, dayIndex: number, utcHour: number): number {
  const views = article.dailyViews[dayIndex] ?? 0
  if (views === 0) return 0
  return ((views / 86400) * shapeAt(article, dayIndex, utcHour)) / shapeMean(article, dayIndex)
}

/* ------------------------------------------------------------------------------------------
 * Dwell time
 * ------------------------------------------------------------------------------------------
 * Reading time report: time visible is roughly log-normal. All-wiki percentiles 5/25/50/75/95%
 * = 1.8/8.0/25/75.1/439 s → σ ≈ 1.66 in log space. Geometric mean 22 s on mobile vs 26 s on
 * desktop. A 10,000-byte page predicts ~25 s, and each doubling of page length ×1.2.
 * So mobile ≈ 21 s at 10 kB, scaled by length. Views over an hour are capped at 1 h, as in
 * the report's totals. (The report notes mobile times are likely biased low: 57% of mobile
 * views lost their "page unloaded" event.)
 */
export const DWELL_SIGMA = 1.66
export const DWELL_CAP_S = 3600
const MOBILE_GEOMEAN_AT_10KB = 25 * (22 / 26)

export function dwellMedianSeconds(article: ArticleTraffic): number {
  const length = article.length ?? 10000
  return MOBILE_GEOMEAN_AT_10KB * Math.pow(1.2, Math.log2(length / 10000))
}

/** Mean dwell of the capped log-normal, by numeric integration (for Little's law readouts). */
export function dwellMeanSeconds(article: ArticleTraffic): number {
  const mu = Math.log(dwellMedianSeconds(article))
  const steps = 2000
  let sum = 0
  for (let i = 0; i < steps; i++) {
    const p = (i + 0.5) / steps
    sum += Math.min(Math.exp(mu + DWELL_SIGMA * normalQuantile(p)), DWELL_CAP_S)
  }
  return sum / steps
}

export function sampleDwellSeconds(article: ArticleTraffic, random = Math.random): number {
  const mu = Math.log(dwellMedianSeconds(article))
  return Math.min(Math.exp(mu + DWELL_SIGMA * gaussian(random)), DWELL_CAP_S)
}

/** Expected readers present (Little's law) — the curve the simulation fluctuates around. */
export function expectedReaders(
  article: ArticleTraffic,
  dayIndex: number,
  utcHour: number,
): number {
  return arrivalRate(article, dayIndex, utcHour) * dwellMeanSeconds(article)
}

/* ------------------------------------------------------------------------------------------
 * Mapping the viewer's clock onto October
 * ------------------------------------------------------------------------------------------ */

/** The viewer's real UTC day-of-month maps to the same day of October (31st → 31st). */
export function dayIndexFor(date: Date): number {
  return Math.min(date.getUTCDate(), DAYS_IN_MONTH) - 1
}

export function utcHourOf(date: Date): number {
  return date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
}

export function sourceDate(dayIndex: number): Date {
  return new Date(Date.UTC(YEAR, MONTH - 1, dayIndex + 1))
}

/* ------------------------------------------------------------------------------------------
 * Random helpers
 * ------------------------------------------------------------------------------------------ */

export function gaussian(random = Math.random): number {
  let u = 0
  while (u === 0) u = random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random())
}

/** Poisson sample; normal approximation for large means. */
export function poisson(mean: number, random = Math.random): number {
  if (mean <= 0) return 0
  if (mean > 50) return Math.max(0, Math.round(mean + Math.sqrt(mean) * gaussian(random)))
  const limit = Math.exp(-mean)
  let k = 0
  let p = random()
  while (p > limit) {
    k++
    p *= random()
  }
  return k
}

/** Acklam's rational approximation of the standard normal quantile. */
function normalQuantile(p: number): number {
  const a = [
    -39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472,
    2.50662827745924,
  ]
  const b = [
    -54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857,
  ]
  const c = [
    -0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373,
    4.37466414146497, 2.93816398269878,
  ]
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742]
  const lo = 0.02425
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
  if (p > 1 - lo) return -normalQuantile(1 - p)
  const q = p - 0.5
  const r = q * q
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  )
}

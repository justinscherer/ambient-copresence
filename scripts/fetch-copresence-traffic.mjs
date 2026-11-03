#!/usr/bin/env node
/**
 * Snapshot the traffic data behind the ambient-copresence prototype.
 *
 * Pulls, for English Wikipedia mobile-web (agent=user):
 *   - the month's top-viewed pages (minus non-articles / suspected automated pages)
 *   - each chosen article's daily views for the month
 *   - the site-wide hourly views for every hour of the month (UTC)
 *   - each article's short description and current page length
 *
 * Usage: node scripts/fetch-copresence-traffic.mjs [YYYY] [MM]
 * Writes src/prototypes/ambient-copresence/traffic.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const year = process.argv[2] ?? '2026'
const month = (process.argv[3] ?? '10').padStart(2, '0')
const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate()

const PROJECT = 'en.wikipedia.org'
const ACCESS = 'mobile-web'
const COUNT = 10

/**
 * Excluded from the top list:
 * - Main_Page, Special:Search — not articles (per the prototype brief)
 * - Wikipedia:Featured_pictures — project page; near-flat ~570k/day suggests automated traffic
 * - .xxx — erratic spikes uncorrelated with news; likely automated
 */
const EXCLUDE = new Set(['Main_Page', 'Special:Search', 'Wikipedia:Featured_pictures', '.xxx'])

const userAgent = readFileSync(new URL('../src/api-user-agent.txt', import.meta.url), 'utf8').trim()
const headers = { 'User-Agent': userAgent, 'Api-User-Agent': userAgent }

async function getJson(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

const metrics = 'https://wikimedia.org/api/rest_v1/metrics/pageviews'
const enc = (title) => encodeURIComponent(title)

const top = await getJson(`${metrics}/top/${PROJECT}/${ACCESS}/${year}/${month}/all-days`)
const ranked = top.items[0].articles
const chosen = ranked.filter((a) => !EXCLUDE.has(a.article)).slice(0, COUNT)

const start = `${year}${month}01`
const end = `${year}${month}${String(lastDay).padStart(2, '0')}`

const articles = []
for (const { article, views, rank } of chosen) {
  const daily = await getJson(
    `${metrics}/per-article/${PROJECT}/${ACCESS}/user/${enc(article)}/daily/${start}/${end}`,
  )
  // Days with no row (e.g. before the article existed) count as 0.
  const byDay = new Array(lastDay).fill(0)
  for (const item of daily.items) {
    byDay[Number(item.timestamp.slice(6, 8)) - 1] = item.views
  }
  const summary = await getJson(`https://${PROJECT}/api/rest_v1/page/summary/${enc(article)}`)
  const info = await getJson(
    `https://${PROJECT}/w/api.php?action=query&format=json&formatversion=2&prop=info&titles=${enc(article)}`,
  )
  articles.push({
    title: article,
    displayTitle: summary.title,
    description: summary.description ?? '',
    length: info.query.pages[0].length ?? null,
    rank,
    monthViews: views,
    dailyViews: byDay,
  })
}

const hourly = await getJson(
  `${metrics}/aggregate/${PROJECT}/${ACCESS}/user/hourly/${start}00/${end}23`,
)
const siteHourly = Array.from({ length: lastDay }, () => new Array(24).fill(0))
for (const item of hourly.items) {
  const day = Number(item.timestamp.slice(6, 8)) - 1
  const hour = Number(item.timestamp.slice(8, 10))
  siteHourly[day][hour] = item.views
}

const out = {
  source: {
    project: PROJECT,
    access: ACCESS,
    agent: 'user',
    month: `${year}-${month}`,
    fetched: new Date().toISOString().slice(0, 10),
    excluded: [...EXCLUDE],
  },
  articles,
  siteHourly,
}

const target = fileURLToPath(
  new URL('../src/prototypes/ambient-copresence/traffic.json', import.meta.url),
)
writeFileSync(target, JSON.stringify(out) + '\n')
console.log(`Wrote ${articles.length} articles, ${lastDay} days → ${target}`)
for (const a of articles)
  console.log(`  ${a.rank}. ${a.title} — ${a.monthViews} — ${a.description}`)

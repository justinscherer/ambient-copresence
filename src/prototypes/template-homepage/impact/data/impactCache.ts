import { normalizeLang, normalizeWikiUsername } from '@/config'
import type { ImpactData } from './impactTypes'

const STORAGE_KEY = 'protowiki-impact-cache-v1'

export interface CachedImpactEntry {
  fetchedAt: number
  data: ImpactData
}

type ImpactCacheStore = Record<string, CachedImpactEntry>

function legacyImpactCacheKey(username: string): string {
  return normalizeWikiUsername(username)
}

function realUserImpactCacheKey(username: string, wiki: string): string {
  const normalizedUsername = normalizeWikiUsername(username)
  if (!normalizedUsername.length) return ''
  return `${normalizeLang(wiki)}:${normalizedUsername}`
}

function isValidEntry(entry: unknown): entry is CachedImpactEntry {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    typeof (entry as CachedImpactEntry).fetchedAt === 'number' &&
    typeof (entry as CachedImpactEntry).data === 'object' &&
    (entry as CachedImpactEntry).data !== null
  )
}

/** Rewrite a raw store into canonical `lang:Username` keys with valid entries only. */
function normalizeImpactStore(raw: unknown): ImpactCacheStore {
  if (typeof raw !== 'object' || raw === null) return {}

  const store: ImpactCacheStore = {}

  for (const [key, entry] of Object.entries(raw as Record<string, unknown>)) {
    if (!isValidEntry(entry)) continue

    const colonIndex = key.indexOf(':')
    const normalizedKey =
      colonIndex === -1
        ? realUserImpactCacheKey(key, 'en')
        : realUserImpactCacheKey(key.slice(colonIndex + 1), key.slice(0, colonIndex))

    if (!normalizedKey.length) continue

    const existing = store[normalizedKey]
    if (!existing || entry.fetchedAt >= existing.fetchedAt) {
      store[normalizedKey] = entry
    }
  }

  return store
}

function clearStoredImpactCache(): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Private mode or blocked storage — ignore.
  }
}

function readRawStore(): { raw: unknown; corrupt: boolean } {
  if (typeof window === 'undefined') return { raw: null, corrupt: false }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return { raw: null, corrupt: false }
    return { raw: JSON.parse(stored), corrupt: false }
  } catch {
    return { raw: null, corrupt: true }
  }
}

function readStore(): ImpactCacheStore {
  const { raw, corrupt } = readRawStore()
  if (corrupt) {
    clearStoredImpactCache()
    return {}
  }
  if (raw === null) return {}

  const normalized = normalizeImpactStore(raw)
  if (JSON.stringify(normalized) !== JSON.stringify(raw)) {
    persistImpactStore(normalized)
  }
  return normalized
}

function persistImpactStore(store: ImpactCacheStore): void {
  if (typeof window === 'undefined') return

  const normalized = normalizeImpactStore(store)

  try {
    if (Object.keys(normalized).length === 0) {
      clearStoredImpactCache()
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    // Quota or private-mode failures — ignore.
  }
}

export function getCachedImpact(username: string, wiki = 'en'): CachedImpactEntry | null {
  const key = realUserImpactCacheKey(username, wiki)
  if (!key.length) return null
  const store = readStore()
  const entry = store[key] ?? store[legacyImpactCacheKey(username)]
  if (!entry) return null
  return entry
}

export function setCachedImpact(
  username: string,
  data: ImpactData,
  wiki = 'en',
): CachedImpactEntry {
  const key = realUserImpactCacheKey(username, wiki)
  const entry: CachedImpactEntry = { fetchedAt: Date.now(), data }
  if (!key.length) return entry

  const store = readStore()
  persistImpactStore({ ...store, [key]: entry })
  return entry
}

export function clearCachedImpact(username: string, wiki = 'en'): void {
  const key = realUserImpactCacheKey(username, wiki)
  if (!key.length) return

  const store = readStore()
  const nextStore = { ...store }
  delete nextStore[key]
  delete nextStore[legacyImpactCacheKey(username)]
  persistImpactStore(nextStore)
}

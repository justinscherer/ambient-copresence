<script setup lang="ts">
definePage({
  meta: {
    category: 'prototype',
    platform: 'web',
    spotlight: true,
  },
})

import { CdxIcon, CdxToggleButton } from '@wikimedia/codex'
import { cdxIconSettings, cdxIconVolumeOff, cdxIconVolumeUp } from '@wikimedia/codex-icons'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import MobileWrapper from '@/components/MobileWrapper.vue'
import ArticleLive from '@/components/article/ArticleLive.vue'
import ChromeWrapper from '@/components/chrome/ChromeWrapper.vue'
import { useWikiPageTitleQuery } from '@/composables/useWikiPageTitleQuery'

import PresenceTide from '../ambient-copresence/PresenceTide.vue'
import { ARTICLES, DAYS_IN_MONTH, findArticle } from '../ambient-copresence/presence-model'
import { usePresenceSimulation } from '../ambient-copresence/usePresenceSimulation'
import TuningSheet from './TuningSheet.vue'
import { useRoomSound } from './useRoomSound'

const PROTOTYPE_PATH = '/ambient-copresence-audio'

const route = useRoute()
const { titleFromQuery, setWikiPageTitle } = useWikiPageTitleQuery()

const LAST_TITLE_KEY = 'ambient-copresence-audio:last-title'

/** A modelled top-10 page at random, never the one this browser opened last. */
function pickFallbackTitle(): string {
  let last: string | null = null
  try {
    last = localStorage.getItem(LAST_TITLE_KEY)
  } catch {
    /* No storage: any page will do. */
  }
  const choices = ARTICLES.filter((a) => a.title !== last)
  const title = choices[Math.floor(Math.random() * choices.length)].title
  try {
    localStorage.setItem(LAST_TITLE_KEY, title)
  } catch {
    /* No storage: the next load may repeat this page. */
  }
  return title
}

/**
 * Without `?title=`, open a different modelled page on every load. The pick stays out of the
 * URL so a reload picks again; `?title=` (a shared link or a wiki link) is kept as given.
 */
let fallbackTitle: string | null = null
const article = computed(
  () => titleFromQuery.value ?? (fallbackTitle ??= pickFallbackTitle()).replace(/_/g, ' '),
)

const resolvedTitle = ref<string | null>(null)
watch(article, () => (resolvedTitle.value = null))
function onTitleResolved(title: string) {
  if (!title?.trim()) return
  resolvedTitle.value = title
  if (titleFromQuery.value) setWikiPageTitle(title)
}

/** Only the modelled pages have readers; others show no oval and play no sound. */
const modelled = computed(() => findArticle(resolvedTitle.value ?? article.value))
const presence = usePresenceSimulation(modelled)
const sound = useRoomSound(presence.count, presence.lastChange)

/** Sound-tuning sheet, opened from the settings button beside the sound toggle. */
const tuningOpen = ref(false)
const controls = ref<HTMLElement | null>(null)
watch(modelled, (m) => {
  if (!m && sound.on.value) sound.toggle(false)
})

/**
 * Testing hooks until there's a time UI:
 * `?day=1..31` (October day), `?hour=0..24` (UTC), `?speed=60` (simulated seconds per second).
 */
watch(
  () => [route.query.day, route.query.hour, route.query.speed],
  ([day, hour, speed]) => {
    if (day === undefined && hour === undefined && speed === undefined) return
    const now = new Date()
    const dayIndex = Math.min(DAYS_IN_MONTH, Math.max(1, Number(day ?? now.getUTCDate()))) - 1
    const utcHour = ((Number(hour ?? now.getUTCHours()) % 24) + 24) % 24 || 0
    presence.setTime(dayIndex, utcHour, Number(speed ?? 1) || 1)
  },
  { immediate: true },
)
</script>

<template>
  <MobileWrapper>
    <PresenceTide
      v-if="modelled"
      :count="presence.count.value"
      :change="presence.lastChange.value"
    />
    <div class="ambient-copresence">
      <ChromeWrapper skin="mobile">
        <ArticleLive
          :wiki-link-route="PROTOTYPE_PATH"
          :article="article"
          @title-resolved="onTitleResolved"
        />
      </ChromeWrapper>
    </div>
    <div class="ambient-copresence__sound-frame">
      <template v-if="modelled">
        <div ref="controls" class="ambient-copresence__sound-controls">
          <CdxToggleButton v-model="tuningOpen" aria-label="Tune sound">
            <CdxIcon :icon="cdxIconSettings" />
          </CdxToggleButton>
          <CdxToggleButton
            :model-value="sound.on.value"
            aria-label="Room sound"
            @update:model-value="sound.toggle"
          >
            <CdxIcon :icon="sound.on.value ? cdxIconVolumeUp : cdxIconVolumeOff" />
          </CdxToggleButton>
        </div>
        <TuningSheet
          v-model:open="tuningOpen"
          :anchor="controls"
          :tuning="sound.tuning"
          :sound-on="sound.on.value"
          @update:sound-on="sound.toggle"
          @set="(key, value) => (sound.tuning[key] = value)"
          @reset="sound.resetTuning"
        />
      </template>
    </div>
  </MobileWrapper>
</template>

<style scoped>
/* Lift the page above the oval and let it show through the page's own backgrounds. */
.ambient-copresence {
  position: relative;
  z-index: 1;
}

.ambient-copresence :deep(.chrome-wrapper),
.ambient-copresence :deep(.article),
.ambient-copresence :deep(.article-content) {
  background-color: transparent;
}

/* Bottom-right of the phone column, above the article and clear of the centred badge. */
.ambient-copresence__sound-frame {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 3;
  width: 100%;
  max-width: var(--mobile-wrapper-max-width, 100%);
  height: 0;
  transform: translateX(-50%);
  pointer-events: none;
}

.ambient-copresence__sound-controls {
  position: absolute;
  right: var(--spacing-100);
  bottom: calc(var(--spacing-100) + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: var(--spacing-50);
  pointer-events: auto;
}
</style>

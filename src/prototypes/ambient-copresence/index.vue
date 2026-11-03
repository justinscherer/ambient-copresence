<script setup lang="ts">
definePage({
  meta: {
    category: 'prototype',
    platform: 'web',
    spotlight: true,
  },
})

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import MobileWrapper from '@/components/MobileWrapper.vue'
import ArticleLive from '@/components/article/ArticleLive.vue'
import ChromeWrapper from '@/components/chrome/ChromeWrapper.vue'
import { useWikiPageTitleQuery } from '@/composables/useWikiPageTitleQuery'

import PresenceTide from './PresenceTide.vue'
import { ARTICLES, DAYS_IN_MONTH, findArticle } from './presence-model'
import { usePresenceSimulation } from './usePresenceSimulation'

const PROTOTYPE_PATH = '/ambient-copresence'

const route = useRoute()
const { titleFromQuery, setWikiPageTitle } = useWikiPageTitleQuery()

/** Without `?title=`, open one of the modelled top-10 pages at random. */
const fallbackTitle = ARTICLES[Math.floor(Math.random() * ARTICLES.length)].title
const article = computed(() => titleFromQuery.value ?? fallbackTitle.replace(/_/g, ' '))

const resolvedTitle = ref<string | null>(null)
watch(article, () => (resolvedTitle.value = null))
function onTitleResolved(title: string) {
  if (!title?.trim()) return
  resolvedTitle.value = title
  setWikiPageTitle(title)
}

/** Only the modelled pages have readers; others show no oval. */
const modelled = computed(() => findArticle(resolvedTitle.value ?? article.value))
const presence = usePresenceSimulation(modelled)

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
</style>

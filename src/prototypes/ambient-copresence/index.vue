<script setup lang="ts">
definePage({
  meta: {
    category: 'prototype',
    platform: 'web',
    spotlight: true,
  },
})

import { computed } from 'vue'

import MobileWrapper from '@/components/MobileWrapper.vue'
import ArticleLive from '@/components/article/ArticleLive.vue'
import ChromeWrapper from '@/components/chrome/ChromeWrapper.vue'
import { useWikiPageTitleQuery } from '@/composables/useWikiPageTitleQuery'

const PROTOTYPE_PATH = '/ambient-copresence'

const { titleFromQuery, setWikiPageTitle } = useWikiPageTitleQuery()

/** Fixed title from `?title=`; omit prop for random article when absent. */
const article = computed(() => titleFromQuery.value)

function onTitleResolved(title: string) {
  if (title?.trim()) setWikiPageTitle(title)
}
</script>

<template>
  <MobileWrapper>
    <ChromeWrapper skin="mobile">
      <ArticleLive
        :wiki-link-route="PROTOTYPE_PATH"
        :article="article"
        @title-resolved="onTitleResolved"
      />
    </ChromeWrapper>
  </MobileWrapper>
</template>

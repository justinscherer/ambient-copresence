<script setup lang="ts">
import { computed, ref } from 'vue'

import TaskFullscreenShell from '../TaskFullscreenShell.vue'
import SpecialPageWrapper from '@/components/SpecialPageWrapper.vue'
import MobileWrapper from '@/components/MobileWrapper.vue'
import MobileSubpageHeader from '../MobileSubpageHeader.vue'
import SuggestedEditsView from '../SuggestedEditsView.vue'
import type { SuggestionDescriptionPart } from './data/veSuggestions'
import { HOMEPAGE } from '../dashpage-fixtures'

interface StructuredTaskPlaceholder {
  articleTitle: string
  articleShortDescription: string
  thumbnailSrc?: string
  pageviewsLabel: string
  taskHeading: string
  taskDifficulty: 'easy' | 'medium' | 'hard'
  taskTimeEstimate: string
  taskDescriptionParts: SuggestionDescriptionPart[]
}

const placeholders: StructuredTaskPlaceholder[] = [
  {
    articleTitle: 'Full circle ringing',
    articleShortDescription: 'Method of hanging (church) bells and ringing them in circles.',
    thumbnailSrc:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/St_Botolph%27s_Bell_Ringing.webm/120px--St_Botolph%27s_Bell_Ringing.webm.jpg',
    pageviewsLabel: '258 visits (past 60 days)',
    taskHeading: 'Find references',
    taskDifficulty: 'easy',
    taskTimeEstimate: '3-5 minutes',
    taskDescriptionParts: [
      { kind: 'text', text: 'Add a reliable source to support an unsourced claim.' },
    ],
  },
  {
    articleTitle: 'Tomislav Labudović',
    articleShortDescription: 'Tomislav Labudović is a Croatian footballer who plays as a central defender.',
    thumbnailSrc:
      'https://upload.wikimedia.org/wikipedia/commons/d/d2/Tomislav_Labudovi%C4%87_Persiba_Balikpapan_26.jpg',
    pageviewsLabel: '88 visits (past 60 days)',
    taskHeading: 'Revise tone',
    taskDifficulty: 'easy',
    taskTimeEstimate: '5-10 minutes',
    taskDescriptionParts: [
      { kind: 'text', text: 'Make articles more factual by removing promotional words' },
    ],
  },
  {
    articleTitle: 'Seguida',
    articleShortDescription:
      'Seguida is a Latin Rock Group from New York., who were winners of the 1976 Latin NY Magazine "Best La',
    pageviewsLabel: '72 visits (past 60 days)',
    taskHeading: 'Revise tone',
    taskDifficulty: 'easy',
    taskTimeEstimate: '5-10 minutes',
    taskDescriptionParts: [
      { kind: 'text', text: 'Make articles more factual by removing promotional words' },
    ],
  },
]

const currentIndex = ref(0)
const current = computed(() => placeholders[currentIndex.value] ?? placeholders[0])

const viewProps = computed(() => ({
  showFilterBar: true,
  topicFilter: 'Music',
  difficultyFilter: 'Easy, Medium',
  currentIndex: currentIndex.value,
  totalCount: 401983,
  articleTitle: current.value.articleTitle,
  articleShortDescription: current.value.articleShortDescription,
  thumbnailSrc: current.value.thumbnailSrc,
  pageviewsLabel: current.value.pageviewsLabel,
  taskHeading: current.value.taskHeading,
  taskDifficulty: current.value.taskDifficulty,
  taskTimeEstimate: current.value.taskTimeEstimate,
  taskDescriptionParts: current.value.taskDescriptionParts,
  showSnippet: false,
  editHref: '#',
  canGoPrev: currentIndex.value > 0,
  canGoNext: currentIndex.value < placeholders.length - 1,
}))

function onSuggestionNavigate(delta: number): void {
  const next = currentIndex.value + delta
  if (next < 0 || next >= placeholders.length) return
  currentIndex.value = next
}

definePage({
  meta: {
    title: 'Template: Homepage — Suggested edits',
    description: 'Full-page mobile drill-down for the Suggested edits homepage module.',
  },
})
</script>

<template>
  <MobileWrapper>
    <TaskFullscreenShell skin="mobile">
      <div class="suggested-edits-layout">
        <div class="suggested-edits-layout__header">
          <MobileSubpageHeader
            title="Suggested edits"
            :back-to="HOMEPAGE"
            back-label="Back to homepage"
            :bleed="false"
          />
        </div>

        <SpecialPageWrapper :title="null" class="suggested-edits-page">
          <SuggestedEditsView v-bind="viewProps" @navigate="onSuggestionNavigate" />
        </SpecialPageWrapper>
      </div>
    </TaskFullscreenShell>
  </MobileWrapper>
</template>

<style scoped>
.suggested-edits-layout {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.suggested-edits-layout__header {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 100%;
  padding: env(safe-area-inset-top, 0px) 4px 0;
  background-color: var(--background-color-base, #fff);
  border-bottom: 1px solid var(--border-color-base, #a2a9b1);
}

.suggested-edits-layout__header :deep(.mobile-subpage-header) {
  margin: 0;
  padding: 0;
  border-bottom: none;
}

.suggested-edits-layout__header :deep(.mobile-subpage-header__title) {
  margin-block: 0;
  font-family: var(--font-family-system-sans, system-ui, sans-serif);
  border: none !important;
}

.suggested-edits-layout :deep(.suggested-edits-page) {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  max-width: none;
  margin: 0;
  padding: 0;
  background-color: var(--background-color-neutral-subtle, #f8f9fa);
}

.suggested-edits-layout :deep(.suggested-edits-page .special-page-wrapper__body) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
</style>

<script setup lang="ts">
/**
 * A bottom sheet with a slider for every sound-design value, for tuning the room by ear while
 * it plays. Changed values show in the progressive colour; "Copy changes" copies just those as
 * JSON, ready to bake into tuning.ts.
 */
import { CdxAccordion, CdxPopover, CdxToggleSwitch } from '@wikimedia/codex'
import { computed, ref } from 'vue'

import { TUNING_GROUPS, TUNING_PARAMS, changedTuning, type Tuning, type TuningKey } from './tuning'

const props = defineProps<{
  open: boolean
  anchor: HTMLElement | null
  tuning: Tuning
  soundOn: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  'update:soundOn': [on: boolean]
  set: [key: TuningKey, value: number]
  reset: []
}>()

const copied = ref(false)
let copiedTimer = 0

const changedCount = computed(() => Object.keys(changedTuning(props.tuning)).length)

const primaryAction = computed(() => ({
  label: copied.value ? 'Copied' : 'Copy changes',
  actionType: 'progressive' as const,
  disabled: changedCount.value === 0,
}))
const defaultAction = computed(() => ({ label: 'Reset', disabled: changedCount.value === 0 }))

async function copyChanges() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(changedTuning(props.tuning), null, 2))
    copied.value = true
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => (copied.value = false), 2000)
  } catch {
    /* Clipboard blocked: nothing to do. */
  }
}

function decimals(step: number): number {
  return Math.max(0, Math.ceil(-Math.log10(step) - 1e-9))
}

function format(key: TuningKey): string {
  const param = TUNING_PARAMS[key]
  const value = props.tuning[key].toFixed(decimals(param.step))
  if (!('unit' in param)) return value
  return param.unit === '%' || param.unit === '×'
    ? `${value}${param.unit}`
    : `${value} ${param.unit}`
}

function isChanged(key: TuningKey): boolean {
  return props.tuning[key] !== TUNING_PARAMS[key].value
}

function onInput(key: TuningKey, event: Event) {
  emit('set', key, Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <CdxPopover
    :open="props.open"
    :anchor="props.anchor"
    class="tuning-sheet"
    title="Sound tuning"
    use-close-button
    use-bottom-sheet="always"
    hide-backdrop
    :primary-action="primaryAction"
    :default-action="defaultAction"
    @update:open="emit('update:open', $event)"
    @primary="copyChanges"
    @default="emit('reset')"
  >
    <CdxToggleSwitch
      :model-value="props.soundOn"
      class="tuning-sheet__sound"
      @update:model-value="emit('update:soundOn', $event)"
    >
      Room sound
    </CdxToggleSwitch>
    <CdxAccordion v-for="group in TUNING_GROUPS" :key="group.label">
      <template #title>
        {{ group.label }}
      </template>
      <div v-for="key in group.keys" :key="key" class="tuning-sheet__row">
        <label :for="`tuning-${key}`" class="tuning-sheet__label">
          {{ TUNING_PARAMS[key].label }}
        </label>
        <output
          :for="`tuning-${key}`"
          class="tuning-sheet__value"
          :class="{ 'tuning-sheet__value--changed': isChanged(key) }"
        >
          {{ format(key) }}
        </output>
        <input
          :id="`tuning-${key}`"
          class="tuning-sheet__slider"
          type="range"
          :min="TUNING_PARAMS[key].min"
          :max="TUNING_PARAMS[key].max"
          :step="TUNING_PARAMS[key].step"
          :value="props.tuning[key]"
          @input="onInput(key, $event)"
        />
      </div>
    </CdxAccordion>
  </CdxPopover>
</template>

<!-- Teleported popover: unscoped, prefixed by the sheet's own class. -->
<style>
/* Short enough to keep the tide and the top of the article in view while tuning. */
.tuning-sheet.cdx-popover--bottom-sheet {
  max-height: 60dvh;
}

.tuning-sheet .tuning-sheet__sound {
  margin-bottom: var(--spacing-50);
}

.tuning-sheet .tuning-sheet__row {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: var(--spacing-75);
  align-items: baseline;
  padding-block: var(--spacing-25);
}

/* Codex Small text style. */
.tuning-sheet .tuning-sheet__label,
.tuning-sheet .tuning-sheet__value {
  font-family: var(--font-family-base);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-small);
}

.tuning-sheet .tuning-sheet__label {
  color: var(--color-base);
}

.tuning-sheet .tuning-sheet__value {
  color: var(--color-subtle);
  font-variant-numeric: tabular-nums;
}

.tuning-sheet .tuning-sheet__value--changed {
  color: var(--color-progressive);
}

/* No Codex slider exists: a native range input in Codex's progressive colour. */
.tuning-sheet .tuning-sheet__slider {
  grid-column: 1 / -1;
  width: 100%;
  min-height: var(--min-size-interactive-pointer);
  margin: 0;
  accent-color: var(--color-progressive);
}
</style>

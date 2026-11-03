# Edit suggestions alongside your editing surface

How to **store and render** an edit-suggestion stream next to **whatever
editor you embed** — payload shape, side-by-side layout,
sample `SuggestionCard`, at-publish interception, and "apply"
semantics.

ProtoWiki does not ship a bundled VE stand-in; fork **[Bárbara Martínez Calvo’s article template or suggestion-mode repos](editors.md)** when you want production-shaped edit chrome, or use a minimal `contenteditable` region as below.

This file is about the *consumer* side. For *where the suggestions
come from* (fixtures, rule-based generation, Lift Wing inference) see
[`wiki-signals/edit-suggestions.md`](../../wiki-signals/edit-suggestions.md).

The two responsibilities meet at one contract: the `SuggestionFile` /
`EditSuggestion` types below.

## The contract

```ts
type SuggestionFile = {
  page: string             // article title (display form)
  generatedAt: string      // ISO 8601 timestamp
  language?: string        // BCP-47, defaults to 'en'
  suggestions: EditSuggestion[]
}

type EditSuggestion = {
  id: string                                       // unique within the page
  type: 'citation' | 'tone' | 'wikifying'
      | 'spelling' | 'redirect' | 'duplication'
      | string                                      // open for new types
  severity: 'info' | 'warning' | 'error'
  excerpt: string                                   // editor's text the suggestion is about
  range?: { start: number; end: number }            // optional char offsets in source
  message: string                                   // one-line summary
  detail?: string                                   // longer explanation; markdown supported
  actions?: SuggestionAction[]                      // CTAs
  source?: 'rule' | 'model' | 'human' | string      // who flagged it
  confidence?: number                               // 0..1
}

type SuggestionAction = {
  id: 'accept' | 'dismiss' | 'explain' | string
  label: string
  variant?: 'primary' | 'progressive' | 'destructive' | 'quiet'
}
```

## Severity → Codex `CdxMessage` type

| `severity` | Codex `type` | Use |
| --- | --- | --- |
| `info` | `notice` | gentle nudge — wikifying, related links |
| `warning` | `warning` | likely-broken — missing citation, tone |
| `error` | `error` | publishing as-is would violate policy |

## Type → Codex icon

| `type` | Suggested icon |
| --- | --- |
| `citation` | `cdxIconReference` |
| `tone` | `cdxIconAlert` |
| `wikifying` | `cdxIconLink` |
| `spelling` | `cdxIconCheck` |
| `redirect` | `cdxIconArrowNext` |
| `duplication` | `cdxIconCopy` |

For an unknown `type`, fall back to a neutral `notice` rendering
without an icon — never crash on new types.

## Side-by-side layout

Build the suggestion panel beside **your** editor (forked toolbar,
`contenteditable`, etc.). Wire HTML through `ref`/`v-model` and intercept
your own publish handler — there is no required ProtoWiki editor component.

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SuggestionCard from './SuggestionCard.vue'

const surfaceRef = ref<HTMLDivElement | null>(null)
const html = ref('<p>…</p>')
const suggestions = ref<EditSuggestion[]>([])

onMounted(async () => {
  const res = await fetch(`${import.meta.env.BASE_URL}edit-suggestions/albert-einstein.json`)
  const file: SuggestionFile = await res.json()
  suggestions.value = file.suggestions
  if (surfaceRef.value && html.value) surfaceRef.value.innerHTML = html.value
})

function syncFromSurface() {
  if (!surfaceRef.value) return
  html.value = surfaceRef.value.innerHTML
}

function onPublish() {
  syncFromSurface()
  /* validate suggestions, mock publish, etc. */
}

function onAccept(s: EditSuggestion) {
  suggestions.value = suggestions.value.filter((x) => x.id !== s.id)
}
function onDismiss(s: EditSuggestion) {
  suggestions.value = suggestions.value.filter((x) => x.id !== s.id)
}
</script>

<template>
  <div class="layout">
    <div class="editor">
      <div
        ref="surfaceRef"
        class="mw-parser-output"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        @input="syncFromSurface"
      ></div>
      <button type="button" @click="onPublish">Publish</button>
    </div>
    <aside class="suggestions" aria-label="Edit suggestions">
      <p v-if="!suggestions.length">All clear.</p>
      <SuggestionCard
        v-for="s in suggestions"
        :key="s.id"
        :suggestion="s"
        @accept="onAccept(s)"
        @dismiss="onDismiss(s)"
      />
    </aside>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-200);
}
.suggestions {
  position: sticky;
  top: var(--spacing-100);
  align-self: flex-start;
}
</style>
```

## Sample `SuggestionCard`

A minimal, prototype-quality card built on Codex `CdxMessage` and
`CdxButton`:

```vue
<script setup lang="ts">
import { CdxButton, CdxMessage } from '@wikimedia/codex'
import { cdxIconReference, cdxIconLink, cdxIconAlert } from '@wikimedia/codex-icons'

const props = defineProps<{ suggestion: EditSuggestion }>()
const emit = defineEmits<{ accept: []; dismiss: [] }>()

const iconByType = {
  citation: cdxIconReference,
  wikifying: cdxIconLink,
  tone: cdxIconAlert,
}

const codexType = {
  info: 'notice',
  warning: 'warning',
  error: 'error',
} as const
</script>

<template>
  <CdxMessage
    :type="codexType[suggestion.severity]"
    :icon="iconByType[suggestion.type]"
    :inline="false"
  >
    <p class="excerpt">"{{ suggestion.excerpt }}"</p>
    <p class="message">{{ suggestion.message }}</p>
    <details v-if="suggestion.detail">
      <summary>Why?</summary>
      <p>{{ suggestion.detail }}</p>
    </details>
    <div class="actions">
      <CdxButton
        v-for="a in suggestion.actions ?? [
          { id: 'accept', label: 'Accept' },
          { id: 'dismiss', label: 'Dismiss' },
        ]"
        :key="a.id"
        :weight="a.variant === 'quiet' ? 'quiet' : a.variant === 'progressive' ? 'primary' : 'normal'"
        :action="
          a.variant === 'progressive'
            ? 'progressive'
            : a.variant === 'destructive'
              ? 'destructive'
              : 'default'
        "
        @click="
          a.id === 'accept'
            ? emit('accept')
            : a.id === 'dismiss'
              ? emit('dismiss')
              : null
        "
      >
        {{ a.label }}
      </CdxButton>
    </div>
  </CdxMessage>
</template>
```

## At-publish-time interception

Hold back publish if any error-severity suggestions remain — but
always let the user override. The point of a prototype is to
demonstrate the friction, not to enforce policy.

```ts
function onPublish(payload: { html: string; title?: string }) {
  const errors = suggestions.value.filter((s) => s.severity === 'error')
  if (errors.length > 0) {
    // Show a CdxDialog explaining why, with a "Publish anyway" button.
    return
  }
  // Otherwise proceed with the prototype's mock publish.
}
```

Intercept **`onPublish`** (or equivalent) in your prototype — e.g. open a
`CdxDialog` for review or suggestion warnings — without forking upstream templates.

## "Apply" semantics

If `accept` should *modify* the article body (e.g., link a phrase, add
a placeholder citation), reach into the live editor surface. The
simplest approach is `document.execCommand`:

```ts
function onAccept(s: EditSuggestion) {
  if (s.type === 'wikifying') {
    // Find the excerpt in the rendered body and wrap it with <a>.
  }
  if (s.type === 'citation') {
    // Insert a <sup class="reference">[citation]</sup> placeholder.
  }
  suggestions.value = suggestions.value.filter((x) => x.id !== s.id)
}
```

This is prototype-quality replace; don't worry about edge cases like
overlapping ranges. The fidelity bar is "the demo is convincing", not
"production-correct".

## UX patterns the contract supports

- **Accept** — remove from the list; optionally apply to body.
- **Dismiss** — remove from the list; optionally remember per-page in
  `localStorage` (see
  [`wiki-signals/edit-suggestions.md`](../../wiki-signals/edit-suggestions.md)
  for the dismiss-state recipe).
- **Explain** — expand the card to show `detail`.
- **Multi-suggestion summary** — banner above publish:
  "3 more suggestions before you publish".
- **At-publish interception** — confirm dialog when error-severity
  suggestions remain.

## Backwards compatibility

When new `type` values appear in incoming JSON, render generically
(no icon, neutral `notice`) and log. Don't make the consumer crash on
unknown types — the field is open by design.

## See also

- [`wiki-signals`](../../wiki-signals/SKILL.md)
  (`edit-suggestions.md`) — the data side: how to generate / fake the
  suggestion stream.
- [`editors.md`](editors.md) — article template + suggestion-mode references (Bárbara’s repos).

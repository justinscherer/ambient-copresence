# Edit-suggestion signals

How to **simulate** a stream of VisualEditor "Edit Check"-style
suggestions, learning from the
[`fakewiki`](https://github.com/TodePond/FakeMediaWiki/tree/main/packages/fakewiki)
package.

This file is about *where the suggestions come from* — generating /
mocking / persisting the JSON. The "Inside ProtoWiki" section at the
bottom links to the per-component contract that consumes those
fixtures.

## What "edit suggestions" are, in upstream terms

VisualEditor's **Edit Check** controller runs a configurable set of
*checks* over a draft. Each check that fires emits a *suggestion action*
(citation prompt, tone warning, link suggestion, etc.) which VE
surfaces alongside the editor.

The check types currently shipping (or ship-ready) on enwiki include:

| Check id | What it flags | Source |
| --- | --- | --- |
| `addReference` | Body paragraph (≥50 chars) with no `<ref>` | Rule (heuristic) |
| `tone` | Sentence-level civility / NPOV concern | Lift Wing (`edit-check:predict`) |
| `externalLink` | Modified external links inside the body | Rule |
| `duplicateLink` | Same internal link repeated within scope | Rule |
| `disambiguation` | Internal link points at a disambiguation page | Rule + `linkCache` |
| `headingLevel` | Skipped heading hierarchy (h2 → h4) | Rule |
| `imageCaption` | New thumbnail with empty caption | Rule |
| `convertReference` | Reference convertible to citation template | Rule + Citoid |
| `yearLink` | Year token in label disagrees with year in target | Rule |
| `textMatch` | Whole-word match against curated term lists (LLM tells, British/American spelling, etc.) | Rule + curated wiki config |
| `citationNeeded` | Inline transclusion missing a source | Rule |

Of these, all but `tone` are **rule-based** (deterministic given the
page content and config) and so are cheap to mock offline. `tone` calls
a Lift Wing inference endpoint — see [Lift Wing](#lift-wing-inference).

For the canonical version of this list (with file-level pointers and
production thresholds) see fakewiki's
[`docs/VE_SUGGESTION_TYPES_REPORT.md`](https://github.com/TodePond/FakeMediaWiki/blob/main/packages/fakewiki/docs/VE_SUGGESTION_TYPES_REPORT.md).

## Three ways to fake a suggestion stream

In order of effort:

### 1. Hand-authored fixtures (fastest)

A static JSON file per page, loaded at edit time and surfaced as cards
next to the editor. Pick a directory in your static assets and a slug
convention (matching the article URL slug works well):

```
<static-dir>/edit-suggestions/
├── albert-einstein.json
├── mont-blanc.json
└── …
```

Loaded at runtime via `fetch`.

The committed
[`assets/example-suggestions.json`](assets/example-suggestions.json)
is a worked example you can copy.

Treat the JSON as production-grade — review wording carefully because
stakeholders will read it as a real-world sample.

**Use when:** you need a 5-minute demo, you want full control over the
exact suggestions shown, or the page is small enough to author by hand.

### 2. Rule-based generation (medium effort)

Re-implement the subset of VE checks you care about and run them
client-side over the article HTML. fakewiki does this for several
check types (`textMatch`, `disambiguation`, `headingLevel`,
`imageCaption`, etc.) and ships the curated term lists alongside —
notably:

- [`fakewiki/docs/ENWIKI_TEXTMATCH_REFERENCE.md`](https://github.com/TodePond/FakeMediaWiki/blob/main/packages/fakewiki/docs/ENWIKI_TEXTMATCH_REFERENCE.md)
  — the full enwiki `textMatch` config with imports.
- [`fakewiki/docs/ENWIKI_TEXTMATCH_LLM_TERMS.json`](https://github.com/TodePond/FakeMediaWiki/blob/main/packages/fakewiki/docs/ENWIKI_TEXTMATCH_LLM_TERMS.json)
  — the LLM-tell phrase list (`I hope this helps`, `important to note`,
  `In conclusion`, etc.) used by enwiki Edit Check.

Recipe — drop a small generator next to your page, with the same
return shape as the fixture file:

```ts
import type { EditSuggestion, SuggestionFile } from '@/types/edit-suggestions'

export function generateSuggestions(html: string, page: string): SuggestionFile {
  const dom = new DOMParser().parseFromString(html, 'text/html')
  const suggestions: EditSuggestion[] = [
    ...textMatchCheck(dom),
    ...duplicateLinkCheck(dom),
    ...headingLevelCheck(dom),
  ]
  return {
    page,
    generatedAt: new Date().toISOString(),
    suggestions,
  }
}
```

**Use when:** the prototype is about *which suggestions surface for
which content*, you want the demo to react to live edits, or you need
suggestions for many pages without authoring each by hand.

### 3. Lift Wing inference (highest fidelity for `tone`)

Real VE's `ToneCheck` calls the public Lift Wing inference endpoint:

```
POST https://api.wikimedia.org/service/lw/inference/v1/models/edit-check:predict
```

Body (one batched instance per content branch node):

```json
{
  "instances": [
    {
      "modified_text": "<paragraph plain text>",
      "page_title": "Albert Einstein",
      "check_type": "tone",
      "lang": "en"
    }
  ]
}
```

Response gives `prediction` (boolean) and `probability` per instance.
Default threshold for surfacing a suggestion is `>= 0.8`. Allowed
`lang` values are `en`, `es`, `fr`, `ja`, `pt`.

fakewiki's
[`hooks/usePredictions.ts`](https://github.com/TodePond/FakeMediaWiki/blob/main/packages/fakewiki/hooks/usePredictions.ts)
shows the same pattern for `damaging` / `goodfaith` / `revertrisk`
predictions (which inform reviewer / patrol UX rather than
inline-edit suggestions, but the request shape is parallel).

**Use when:** the prototype is specifically about coaching tone /
quality and you want real model output, including the messy cases
where the model is uncertain.

## Lift Wing inference

Lift Wing is the public model-serving infrastructure for Wikimedia's
ML models. Endpoints used in prototyping:

| Model | Endpoint | What it scores |
| --- | --- | --- |
| `edit-check:predict` | `/v1/models/edit-check:predict` | Is this paragraph tone-problematic? |
| `revscoring-articlequality` | `/v1/models/{wiki}-articlequality:predict` | Stub / Start / C / B / GA / FA |
| `revertrisk-language-agnostic` | `/v1/models/revertrisk-language-agnostic:predict` | Will this revision be reverted? |
| `revertrisk-multilingual` | `/v1/models/revertrisk-multilingual:predict` | Same, multilingual variant |

Use a descriptive `User-Agent` header. Calls are rate-limited; cache
predictions per revision id. See
[`wiki-apis/references/etiquette.md`](../wiki-apis/references/etiquette.md).

## Storing the simulated stream

Whichever generator you pick, the on-disk shape is the same — a
`SuggestionFile`:

```ts
type SuggestionFile = {
  page: string             // article title (display form)
  generatedAt: string      // ISO 8601 timestamp
  language?: string        // BCP-47, defaults to 'en'
  suggestions: EditSuggestion[]
}
```

The full `EditSuggestion` shape (id, type, severity, excerpt, message,
actions, …) is a *contract between the JSON and the consuming
component* — see "Inside ProtoWiki" below for ProtoWiki's version.

## Persistence and dismiss state

In a real wiki, dismiss state is server-side per user. In a static
demo, store dismissed ids in `localStorage`, keyed by page:

```ts
const dismissedKey = `edit-suggestions:dismissed:${slug}`
const dismissed = new Set<string>(JSON.parse(localStorage.getItem(dismissedKey) ?? '[]'))
```

Filter the loaded suggestions through the set on render.

## What this reference does not cover

- **The real Edit Check pipeline** (LLM training, signal triage,
  configuration in `MediaWiki:Editcheck-config.json`). Out of scope.
- **Hooking suggestions into the real upstream VE.** Out of scope here;
  prototype against **[Bárbara Martínez Calvo’s repos](https://github.com/bmartinezcalvo/wikipedia-article-template)** or FakeMediaWiki instead — see [`protowiki-components` → `editors.md`](../protowiki-components/references/editors.md).
- **Rendering the suggestions inside the editor surface.** That's a
  per-environment concern — see "Inside ProtoWiki" below for
  ProtoWiki's version.

## See also

- [`protowiki-components` → `editors.md`](../protowiki-components/references/editors.md)
  — Bárbara’s article template + suggestion-mode repos when you need production-shaped edit UX outside ProtoWiki.
- fakewiki's
  [`docs/VE_SUGGESTION_TYPES_REPORT.md`](https://github.com/TodePond/FakeMediaWiki/blob/main/packages/fakewiki/docs/VE_SUGGESTION_TYPES_REPORT.md)
  — exhaustive per-check writeup with file pointers.

## Inside ProtoWiki

ProtoWiki uses this skill's mocking approach with these specifics:

- Fixture path: `public/edit-suggestions/{slug}.json`, where `slug`
  matches the article URL slug — the same convention as
  `public/snapshots/` (see
  [`wiki-snapshot-data`](../wiki-snapshot-data/SKILL.md) and the
  ProtoWiki snapshot integration skill).
- `localStorage` key: `protowiki:edit-suggestions:dismissed:${slug}`.
- Consumer contract (`EditSuggestion` shape, `SuggestionCard`,
  side-by-side layout, at-publish interception, "apply" semantics):
  [`protowiki-components/references/edit-suggestions.md`](../protowiki-components/references/edit-suggestions.md).

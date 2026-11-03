# CSS imports — what's pre-loaded and where

`src/main.ts` is the single place CSS is bootstrapped in ProtoWiki. Read
that file for the literal list — it grows over time as new bundles
(extra skins, theme tweaks, snapshotted wiki CSS) are added. What
matters here is the **order**, not the inventory.

## The order contract

1. **Codex component CSS first** —
   `@wikimedia/codex/dist/codex.style.css`. Once globally; never
   per-route.
2. **Any ProtoWiki stylesheets next** — the global baseline, dark-mode
   overrides keyed off `[data-theme="dark"]`, vendored skin CSS scoped
   to `[data-skin]`, and so on. Their relative order rarely matters
   because each is scoped to its own selectors.
3. **`initTheming()` last** — see [`../SKILL.md`](../SKILL.md). It
   reads two Codex token files via `?raw` and injects them as `<style>`
   tags **at the end of `<head>`**, scoped to `[data-theme="light"]`
   and `[data-theme="dark"]`. Coming after every other stylesheet
   guarantees those `[data-theme]` token rules win the cascade for any
   `var(--…)` reference matched by them — which is what makes nested
   `theme="dark"` previews flip cleanly.

If you add a new global stylesheet, slot it under (2) so the
`initTheming()` injection still runs last.

## What this means for you

- **Don't re-import `codex.style.css`.** It's already global.
- **Don't import Codex token files manually.** The runtime injection
  done by `initTheming()` is what makes per-subtree theme overrides
  work; importing the upstream tokens would re-anchor them at `:root`
  and undo that.
- **Per-prototype CSS is loaded by Vite** when the route loads (each
  `<style scoped>` block becomes a route-specific chunk). It applies
  on top of everything above and is naturally scoped to the component.

## Custom global CSS

If you genuinely have a global style you want (ProtoWiki-wide), add it
to `src/styles/global.css`. That file covers reset, body / links, and
focus — not chrome or wrappers (those ship beside their components).

If your "global" style is really specific to one prototype, scope it to
the prototype instead.

## See also

- [`protowiki-theme`](../SKILL.md) — the boot-time theme resolution and
  the per-subtree `theme` prop that this cascade enables.
- [`codex-usage`](../../codex-usage/SKILL.md) — the agnostic guidance on
  when to import Codex CSS and when to write your own.

import { readonly, type Ref } from 'vue'
import { globalSkin, type Skin } from '@/theme'

/**
 * Read-only access to the GLOBAL skin (the value on <html>, set at boot from
 * ?skin= URL param + viewport).
 *
 * - Returns a reactive Ref that updates when the viewport crosses the desktop
 *   skin breakpoint (640px — FakeMediaWiki parity) and no URL param is pinning
 *   the value.
 * - Does NOT mutate page state, and does NOT reflect local subtree overrides
 *   set via the `skin` prop on a component. A component that received a `skin`
 *   prop already knows its effective skin; it doesn't need this hook.
 *
 * Use this only when you genuinely need the global value — e.g. a debug
 * overlay, or a piece of layout that has to vary structurally with skin in a
 * way CSS attribute selectors can't express. For visual differences between
 * skins, prefer [data-skin] selectors in CSS.
 */
export function useSkin(): Readonly<Ref<Skin>> {
  return readonly(globalSkin)
}

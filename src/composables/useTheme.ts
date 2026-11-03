import { readonly, type Ref } from 'vue'
import { globalTheme, type Theme } from '@/theme'

/**
 * Read-only access to the GLOBAL theme (the value on <html>, set at boot from
 * ?theme= URL param + prefers-color-scheme).
 *
 * - Returns a reactive Ref that updates when the OS color scheme changes and
 *   no URL param is pinning the value.
 * - Does NOT mutate page state, and does NOT reflect local subtree overrides
 *   set via the `theme` prop on a component. A component that received a
 *   `theme` prop already knows its effective theme; it doesn't need this hook.
 *
 * Use this only when you genuinely need the global value — e.g. a debug
 * overlay that displays the current global theme. For visual differences
 * between themes, prefer [data-theme] selectors in CSS.
 */
export function useTheme(): Readonly<Ref<Theme>> {
  return readonly(globalTheme)
}

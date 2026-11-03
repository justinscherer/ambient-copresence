import { cdxIconCollapse, cdxIconEdit, cdxIconExpand } from '@wikimedia/codex-icons'

const VIEWBOX = '0 0 20 20'

function codexIconSvg20(pathMarkup: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="${VIEWBOX}" fill="currentColor" aria-hidden="true">${pathMarkup}</svg>`
}

/** Edit control for mobile section heading (Codex `edit` icon). */
export function mobileH2EditIconSvg(): string {
  return codexIconSvg20(cdxIconEdit)
}

/**
 * Chevron for section expand/collapse. Collapsed → down (`expand` icon);
 * expanded → up (`collapse` icon).
 */
export function mobileH2ChevronSvg(collapsed: boolean): string {
  return codexIconSvg20(collapsed ? cdxIconExpand : cdxIconCollapse)
}

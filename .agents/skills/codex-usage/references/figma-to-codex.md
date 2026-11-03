# Figma → Codex mapping

Wikimedia's Figma libraries (`Codex/Components`, `Codex/Tokens`) are
generated from the same source as the npm packages we ship. So the
fidelity recipe is short: **find the layer name in Figma, find the same
name in Codex.**

## Components

| Figma layer | Codex import | Notes |
| --- | --- | --- |
| `Button / Primary / Progressive` | `CdxButton` `action="progressive" weight="primary"` | |
| `Button / Quiet` | `CdxButton` `weight="quiet"` | |
| `Text Input` | `CdxTextInput` | wrap with `CdxField` for label + helper |
| `Search Input` | `CdxSearchInput` | for plain (non-typeahead) search |
| `Typeahead Search` | `CdxTypeaheadSearch` | typeahead variant |
| `Card` | `CdxCard` | |
| `Dialog` | `CdxDialog` | |
| `Toggle Switch` | `CdxToggleSwitch` | |
| `Toggle Button` | `CdxToggleButton` | |
| `Message` | `CdxMessage` | type: `notice` / `warning` / `error` / `success` |
| `Info Chip` | `CdxInfoChip` | |
| `Menu` | `CdxMenu` / `CdxMenuButton` | use `MenuButton` for trigger + menu |
| `Combobox` | `CdxCombobox` | |
| `Lookup` | `CdxLookup` | |
| `Tabs` | `CdxTabs` / `CdxTab` | |
| `Tooltip` | `CdxTooltip` | wraps another element |
| `Progress Bar` | `CdxProgressBar` | inline + standalone |
| `Toast` | `CdxToast` + `CdxToastContainer` | |

For the full list, see [`codex-components`](../../codex-components/SKILL.md).

## Tokens

| Figma token | CSS variable | Example use |
| --- | --- | --- |
| `Color/Base` | `var(--color-base)` | body text |
| `Color/Subtle` | `var(--color-subtle)` | secondary text |
| `Color/Progressive` | `var(--color-progressive)` | links, primary actions |
| `Background/Base` | `var(--background-color-base)` | main page background |
| `Background/Neutral subtle` | `var(--background-color-neutral-subtle)` | toolbars, footer |
| `Border/Subtle` | `var(--border-color-subtle)` | hairline dividers |
| `Spacing/25` … `Spacing/300` | `var(--spacing-25)` … `var(--spacing-300)` | margins / padding |
| `Font/Family/System Sans` | `var(--font-family-system-sans)` | UI text |
| `Font/Size/Medium` | `var(--font-size-medium)` | body |
| `Font/Size/X-Large` | `var(--font-size-x-large)` | h2-ish |
| `Border-radius/Base` | `var(--border-radius-base)` | small radii |

For the full list, see [`codex-tokens`](../../codex-tokens/SKILL.md).

## Icons

Figma layer `Icon / edit` → `cdxIconEdit` from `@wikimedia/codex-icons`,
used inside `<CdxIcon :icon="cdxIconEdit" />`. The
[icon catalogue at doc.wikimedia.org/codex](https://doc.wikimedia.org/codex/latest/icons/all-icons.html)
has every name and visual side by side.

## What if the Figma frame is bespoke?

Express the bespoke layer in terms of Codex tokens anyway, even if the
component itself isn't a stock Codex component. That way the prototype
follows light / dark and matches the design system at the pixel level
where it can.

# design system

## goals

- keep typography, interaction, and spacing consistent across pages
- centralize visual decisions in tokens so reskinning only touches a small surface area
- use shared UI primitives for repeated interaction patterns

## foundations

- skin tokens live in:
  - `/Users/michaelyuan/src/ilikecalculus.com/src/styles/skins/default.css`
- shared layout and interaction primitives live in:
  - `/Users/michaelyuan/src/ilikecalculus.com/src/styles/modules/layout.css`

### core tokens

- typography:
  - `--font-size-page-title`
  - `--font-weight-page-title`
  - `--letter-spacing-page-title`
  - `--font-size-body`
  - `--line-height-copy`
- interaction:
  - `--font-size-text-action`
  - `--letter-spacing-text-action`
  - `--underline-offset-text-action`
  - `--hover-scale-text-action`
- layout:
  - `--size-page-max`
  - `--size-page-max-wide`
  - `--space-contact-split-gap`

## reusable component

- underlined textual actions use one component:
  - `/Users/michaelyuan/src/ilikecalculus.com/src/components/ui/text-action.tsx`
  - external text links use `ExternalTextLink` from the same module for consistent marker + `target`/`rel` defaults
- editor form controls use one component family:
  - `/Users/michaelyuan/src/ilikecalculus.com/src/components/ui/editor-controls.tsx`
- usage:
  - works filters
  - contact channel links
  - slideshow top actions (`next project`, `back`, `next`)
  - where + works editor textareas use `EditorTextarea` rather than raw textarea styling

## consistency rules

- page titles:
  - `.page-title` and `.works-intro__title` share the same typography tokens
- page width:
  - default content pages use `.page` (`--size-page-max`)
  - only works index uses `.page--wide`
  - `/where` uses `.page--where` with route tokens for timeline/map layout
  - slideshow keeps its dedicated viewer layout
- text action behavior:
  - same hover behavior and underline treatment via `.text-action`
  - avoid ad hoc per-page hover colors for this pattern
  - do not compose raw `text-action` classes in markup; use `TextActionButton`, `TextActionLink`, or `TextActionLabel`
- where route styling:
  - route-specific spacing and surface values should live in `default.css` `--space-where-*` / `--surface-where-*` tokens
  - avoid hard-coded `rem` values in `where.css` unless there is no meaningful token yet

## consistency check

- run `npm run check:text-action-primitives` to detect raw `text-action` class usage in app/component code

## best-practice references

- [Design Tokens Community Group (W3C): format module](https://design-tokens.github.io/community-group/format/)
- [USWDS: Design tokens](https://designsystem.digital.gov/design-tokens/)
- [Atlassian Design System: design tokens](https://atlassian.design/foundations/design-tokens/)

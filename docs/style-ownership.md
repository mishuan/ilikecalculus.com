# Style Ownership

This file maps each active style module to the UI surfaces that consume it.

- `src/styles/skins/default.css`
  - Design tokens (color, typography, spacing, sizing)
  - Global values consumed by all style modules

- `src/styles/modules/base.css`
  - Global reset, root body defaults, global keyframes

- `src/styles/modules/layout.css`
  - Site shell, top nav, page container/layout primitives
  - Global `text-action` primitive classes

- `src/styles/modules/home.css`
  - Works index and thumbnails/collage surfaces
  - Inline edit controls for works + project thumbnails

- `src/styles/modules/slideshow.css`
  - Project slideshow viewer (top bar, viewport, footer status)

- `src/styles/modules/content.css`
  - About/contact/press/not-found content pages
  - Contact form styles
  - Shared reveal animation and dev editor toggle styles

- `src/styles/modules/responsive.css`
  - Breakpoint behavior for layout/home/slideshow/content modules

## Rule of Thumb

- New reusable interaction styles belong in `layout.css` (shared primitives).
- Route-specific styles belong in the matching module above.
- Add new tokens in `skins/default.css` before introducing hardcoded values.

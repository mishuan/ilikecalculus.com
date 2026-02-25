# ilikecalculus.com (Next.js + Vercel)

This is a Next.js rebuild of `ilikecalculus.com` with the requested structure:

- `/works`
- `/works/<category>/<project>`
- `/about`
- `/contact`
- `/press`
- `/blog` -> redirects to Substack

## Run locally

```bash
nvm install
nvm use
npm install
npm run dev
```

Runtime policy:

- Node is pinned to `24` in `/Users/michaelyuan/src/ilikecalculus.com/.nvmrc` and `/Users/michaelyuan/src/ilikecalculus.com/.node-version`.
- `package.json` enforces `engines.node = 24.x`.
- `/Users/michaelyuan/src/ilikecalculus.com/.npmrc` has `engine-strict=true` to fail fast on wrong Node versions.
- `npm run dev` (and other npm scripts) run a runtime precheck via `/Users/michaelyuan/src/ilikecalculus.com/scripts/check-runtime.mjs`.
- Vercel should also be configured to Node `24.x` to match local development.

Recommended one-time local setup:

```bash
nvm install 24
nvm alias default 24
```

## Manual content workflow

Canonical content is JSON-based.

Source of truth:

- `/Users/michaelyuan/src/ilikecalculus.com/content/workspace.json`
- `/Users/michaelyuan/src/ilikecalculus.com/content/projects/<slug>.json`

Generated runtime file (do not edit manually):

- `/Users/michaelyuan/src/ilikecalculus.com/src/data/generated-site-data.ts`

Build/validate generated data:

```bash
npm run content:build
```

### Add a new work page

```bash
npm run project:new -- --slug your-project --title "your project" --categories film,portrait
```

This scaffolds:

- `/Users/michaelyuan/src/ilikecalculus.com/content/projects/<slug>.json`
- `/Users/michaelyuan/src/ilikecalculus.com/public/media/projects/<slug>/`
- updates `projectOrder` in `/Users/michaelyuan/src/ilikecalculus.com/content/workspace.json`

### Project organization workflow

Normalize file names and update manifest `src` fields:

```bash
npm run media:organize
```

Compress photos, update width/height metadata in JSON manifests, and regenerate generated data:

```bash
npm run media:compress
```

### Dev edit mode

Edit mode is dev-only and enabled automatically in development.
No editor environment flags are required.

Then run:

```bash
npm run dev
```

Capabilities in edit mode:

- Reorder projects globally (`/works`)
- Add categories (`/works`)
- Edit project description (`/works/<category>/<project>/thumbnails?edit=1`)
- Assign/unassign project categories (same page)
- Upload photos (same page)
- Reorder photos via drag/drop (same page)
- Hard-delete photos (same page)

## Image hosting status

All Squarespace image URLs used by the site were migrated to local hosted assets under:

- `/Users/michaelyuan/src/ilikecalculus.com/public/media`

`site-content.ts` now points to those local `/media/...` paths.

## Redirects

Configured in:

- `/Users/michaelyuan/src/ilikecalculus.com/next.config.ts`

Includes legacy URL redirects (`/projects`, `/urban-courts`, `/dustin`, `/figma`, `/figma-2023`, `/shop`).

## Design system

UI token and component conventions are documented in:

- `/Users/michaelyuan/src/ilikecalculus.com/docs/design-system.md`

## Tests

Playwright smoke tests:

```bash
npm run test:e2e
```

Covers:

- primary navigation
- `/works/<category>/<project>` image rendering
- slideshow progression across projects
- `/blog` redirect behavior

## Deploy to Vercel (Hobby)

1. Push repo to GitHub.
2. Import into Vercel.
3. Connect domain `ilikecalculus.com`.
4. Configure DNS to Vercel.

### Contact form environment variables

For `/contact` form email delivery, configure these in Vercel Project Settings:

- `RESEND_API_KEY` (required)
- `CONTACT_TO_EMAIL` (optional, defaults to `michael@ilikecalculus.com`)
- `CONTACT_FROM_EMAIL` (optional, must be a verified sender in Resend)

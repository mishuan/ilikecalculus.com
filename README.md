# ilikecalculus.com (Next.js + Vercel)

This is a Next.js rebuild of `ilikecalculus.com` with the requested structure:

- `/works`
- `/works/<project>`
- `/about`
- `/contact`
- `/press`
- `/blog` -> redirects to Substack

## Run locally

```bash
npm install
npm run dev
```

## Manual content workflow

No admin dashboard is used.

All project/page content is maintained in:

- `/Users/michaelyuan/src/ilikecalculus.com/src/data/site-content.ts`

### Add a new work page

1. Add image files to:
   - `/Users/michaelyuan/src/ilikecalculus.com/public/media`
2. Add a new project object to `siteData.projects` in:
   - `/Users/michaelyuan/src/ilikecalculus.com/src/data/site-content.ts`
3. Required fields per project:
   - `slug`
   - `title`
   - `description`
   - `coverImage` (`src`, `width`, `height`, `alt`)
   - `images` array (`src`, `width`, `height`, `alt`)
4. Optionally add the slug to `featuredProjectSlugs` for homepage highlighting.

## Image hosting status

All Squarespace image URLs used by the site were migrated to local hosted assets under:

- `/Users/michaelyuan/src/ilikecalculus.com/public/media`

`site-content.ts` now points to those local `/media/...` paths.

## Redirects

Configured in:

- `/Users/michaelyuan/src/ilikecalculus.com/next.config.ts`

Includes legacy URL redirects (`/projects`, `/urban-courts`, `/dustin`, `/figma`, `/figma-2023`, `/shop`).

## Tests

Playwright smoke tests:

```bash
npm run test:e2e
```

Covers:

- primary navigation
- `/works/<project>` image rendering
- scroll interaction
- `/blog` redirect behavior

## Deploy to Vercel (Hobby)

1. Push repo to GitHub.
2. Import into Vercel.
3. Connect domain `ilikecalculus.com`.
4. Configure DNS to Vercel.

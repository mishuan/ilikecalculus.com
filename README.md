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
npm install
npm run dev
```

## Manual content workflow

No admin dashboard is used.

All project/page content is maintained in:

- `/Users/michaelyuan/src/ilikecalculus.com/src/data/site-content.ts`

### Add a new work page

1. Add image files to:
   - `/Users/michaelyuan/src/ilikecalculus.com/public/media/projects/<slug>`
   - Use sequential names: `01.jpg`, `02.jpg`, `03.jpg`
2. Add a new project object to `siteData.projects` in:
   - `/Users/michaelyuan/src/ilikecalculus.com/src/data/site-content.ts`
3. Required fields per project:
   - `slug`
   - `categories` (one or both: `portrait`, `personal`)
   - `title`
   - `description`
   - `coverImage` (`src`, `width`, `height`, `alt`)
   - `images` array (`src`, `width`, `height`, `alt`)
4. Routes are generated as `/works/<category>/<slug>`.
5. Optionally add the slug to `featuredProjectSlugs` for homepage highlighting.

### Project organization workflow

Use the scaffold command:

```bash
npm run project:new -- --slug your-project --title "your project" --categories portrait,personal
```

This creates:

- `/Users/michaelyuan/src/ilikecalculus.com/content/projects/<slug>.json`
- `/Users/michaelyuan/src/ilikecalculus.com/public/media/projects/<slug>/`

See `/Users/michaelyuan/src/ilikecalculus.com/content/projects/README.md` for conventions.

To normalize existing project assets into foldered sequential names, run:

```bash
npm run media:organize
```

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
- `/works/<category>/<project>` image rendering
- slideshow progression across projects
- `/blog` redirect behavior

## Deploy to Vercel (Hobby)

1. Push repo to GitHub.
2. Import into Vercel.
3. Connect domain `ilikecalculus.com`.
4. Configure DNS to Vercel.

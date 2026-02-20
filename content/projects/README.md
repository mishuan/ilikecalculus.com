# photo project storage

use this structure for every new project:

- project metadata template: `content/projects/<slug>.json`
- project photos: `public/media/projects/<slug>/`
- route target: `/works/<category>/<slug>`

create a new project scaffold with:

```bash
npm run project:new -- --slug your-project --title "your project" --categories portrait,personal
```

notes:

- categories can be `portrait`, `personal`, or both.
- image file naming convention is sequential: `01.jpg`, `02.jpg`, `03.jpg`, ...
- always run compression before commit: `npm run media:compress` (target under `500 KB` per image).
- keep source exports in `src/data/site-content.ts` as the runtime source of truth for now.
- use the manifest json as the intake/organization layer so image files and project metadata stay grouped.

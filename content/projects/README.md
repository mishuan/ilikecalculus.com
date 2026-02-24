# photo project storage

use this structure for every new project:

- workspace metadata: `content/workspace.json`
- project metadata template: `content/projects/<slug>.json`
- project photos: `public/media/projects/<slug>/`
- route target: `/works/<category>/<slug>`

create a new project scaffold with:

```bash
npm run project:new -- --slug your-project --title "your project" --categories film,portrait
```

notes:

- categories are defined by `content/workspace.json` and can be expanded in edit mode or by editing the file.
- image file naming convention is sequential: `01.jpg`, `02.jpg`, `03.jpg`, ...
- always regenerate runtime data after content updates: `npm run content:build`.
- always run compression before commit: `npm run media:compress` (target under `500 KB` per image).
- generated runtime data is written to `src/data/generated-site-data.ts`.

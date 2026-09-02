---
status: in_progress
created: 2026-09-02
---

# Vercel deployment file boundary

## Scope

Keep deployment uploads below Vercel's file limit by excluding local planning
artifacts, tests, documents, database copies, and temporary phase directories.
Application source, public assets, migrations, and build scripts remain in the
deployment input.

## Acceptance

- `.vercelignore` excludes only non-runtime/local artifact trees.
- `vercel --prod --yes` accepts the upload and reports the build result.
- No planning/research/checkpoint file is deleted or staged accidentally.
- No database, Turso, or application data is written by this task.

## Tasks

- [ ] Add the deployment-only ignore boundary.
- [ ] Run a production deployment attempt and capture result.
- [ ] Record outcome and only commit owned deployment files.

---
status: complete
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

- [x] Add the deployment-only ignore boundary.
- [x] Use the native Next output for Vercel and run a production deployment.
- [x] Keep migration tracing out of the middleware bundle by using the middleware-only
      database lookup; page handlers retain the full readiness guard.
- [x] Record outcome and only commit owned deployment files.

## Evidence

- `.vercelignore` reduced the upload input to 1,950 runtime files while preserving
  application source, public assets, and migrations.
- Production deployment `dpl_G2Py2A6qnDFxgNdZVNVKf1dFW461` reached `READY` and was
  aliased to `https://fountain-pen-graph.vercel.app`.
- Production readback returned hard 404 for unknown paths, 308 for the retired
  `yisihua` alias and legacy Sheaffer route, and 200 for the published Pilot,
  Wancher, Asvine, YSTUDIO, and Sheaffer pages.
- Vercel runtime logs no longer report `Migrations directory not found` after the
  middleware lookup fix.

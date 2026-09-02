---
status: complete
completed: 2026-09-02
---

# Vercel deployment file boundary — summary

## Delivered

- Added deployment-only ignores for planning/checkpoint trees, tests, docs, local
  databases, and build output. Runtime source, `public/`, scripts, and migrations
  remain in the upload boundary.
- Kept `output: "standalone"` for local/Fly builds but use native Next output on
  Vercel.
- Kept migration SQL in server route tracing while avoiding the pnpm native-module
  tracing glob that caused Vercel's ENOTDIR packaging failure.
- Added a middleware-only read path that does not require the filesystem-backed
  migration readiness scan. Page handlers still use the guarded query path.

## Verification

- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm check:public-boundary -- --all` passed with zero boundary mismatches.
- Production deployment `dpl_G2Py2A6qnDFxgNdZVNVKf1dFW461` is `READY` and aliased to
  `https://fountain-pen-graph.vercel.app`.
- Online key-page readback: published pages 200; `yisihua` 308 to Asvine; unknown
  and retired no-successor paths 404; old Sheaffer alias 308 to Touchdown TM.
- Filtered Vercel logs showed no migration-bundle error after deployment.

This closes the Vercel deployment-boundary task only. The global content-repair goal
still requires Turso verification, full online traversal, and final end-to-end audit.

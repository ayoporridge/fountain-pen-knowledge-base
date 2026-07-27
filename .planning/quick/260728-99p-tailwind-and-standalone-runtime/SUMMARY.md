# Summary

The production build previously spent minutes in Tailwind's Oxide scanner because
the default source discovery traversed the whole repository. `src/app/globals.css`
now opts into an explicit source scope rooted at `src/`.

The standalone output also omitted dynamically required `@libsql` native packages.
`next.config.ts` now includes pnpm's `@libsql+*` package paths in output tracing,
and the build finishes by linking the platform-native package into the exact
standalone `libsql` resolution path.

Verification is recorded in the task handoff: `pnpm build` completes, local
SQLite production routes return 200 for representative public pages, and the
Dream Pen legacy route returns the expected 308 canonical redirect. The detail
route loading boundary was removed so unpublished or unknown entity routes can
return an actual HTTP 404 instead of a streamed 200 shell.

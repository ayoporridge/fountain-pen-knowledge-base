# Quick: Tailwind source scope and standalone runtime packaging

## Goal

Reduce production-build scanning overhead and ensure the standalone server carries
the dynamically selected `@libsql` native package used by the local/remote
database client.

## Scope

- Scope Tailwind v4 source discovery to the application source tree.
- Include pnpm-installed `@libsql` native packages in Next standalone tracing.
- Verify with a production build and local SQLite server smoke checks.

## Guardrails

- No database writes; local verification uses the existing `data/fpkg.db` read-only.
- No changes to search, LLM, Playwright, or generic readiness infrastructure.
- Do not stage protected research files or other agents' checkpoint directories.

---
status: in_progress
created: 2026-09-02
---

# Vercel online public-route sweep

## Scope

Read every canonical public route from the formal local catalog against the
production Vercel alias. This is read-only; it does not open or write Turso and
does not mutate the local catalog.

## Acceptance

- All 1,175 canonical public routes are fetched with bounded concurrency.
- Every canonical route returns HTTP 200 with the expected entity name, or a
  documented route-policy redirect/404 is recorded.
- No internal source-provenance flags or runtime migration errors appear in
  public HTML.

## Current state

The first run is **not accepted**. Although the HTTP status counter reported
1,175 responses with status 200, Vercel logs during the same run showed Turso
`BLOCKED` errors because SQL reads were over the plan limit. The dynamic route
then rendered an error/not-found shell with a 200 status, so status alone cannot
be treated as content success. A valid sweep must be rerun after Turso read
access is restored and must validate the expected entity name/content, not just
the HTTP code.
- The report distinguishes route failures from expected retired/alias behavior.

## Latest state — 2026-09-02

The authenticated retry did not restore SQL reads. Vercel logs show the root
route returning HTTP 500 with `Database schema is not initialized` caused by
the Turso `BLOCKED` error. Bounded probes of representative model, brand, and
article routes returned HTTP 200 but rendered the visible 404 shell; those
responses are rejected as content failures. The static YSTUDIO factual SVG
still returns HTTP 200, so the outage is database access rather than asset
deployment. The sweep remains in progress and cannot be accepted until Turso
read access is restored.

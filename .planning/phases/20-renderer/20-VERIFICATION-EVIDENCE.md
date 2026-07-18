---
phase: 20-renderer
plan: "04"
status: gaps_found
verified_at: 2026-07-19
scope: synthetic-renderer-fixture-only
production_claim: false
real_inventory_claim: false
---

# Phase 20 Renderer Verification Evidence

## Verdict

`gaps_found`。最后一次获准的窄项执行完成了 production build、owned loopback server 与四个 renderer browser cases，但只通过 brand desktop/mobile；model desktop/mobile 因 fixture primary-media cardinality 失效而 fail closed。依照重试上限，没有继续修复或重跑。

本证据只描述 synthetic renderer fixture。它不证明真实 305 条库存已发布、不批准真实库存图片、不代表生产部署，也不消除 Phase 19 已记录的 monolithic wrapper residual debt。

## Preflight And Safety Boundary

- Phase 19 verifier 当前 verdict 为 `passed`，同时保留“没有一次 post-fix monolithic wrapper 全绿”的 non-blocking residual validation debt。
- 没有运行 Phase 19 wrapper、`publication-gate.spec.ts`、全量 E2E、真实 catalog、Turso/remote、production 或 deployment 命令。
- Runner 只使用 `createRendererFixture` 创建的 disposable local DB，并借用既有 `check:publication-gate -- --serve-e2e` server seam。
- 最后一次执行退出后，临时 fixture asset 目录、fixture DB、server 与 child process 均已清理。

## Commands And Exact Results

### Renderer matrix

```text
pnpm exec tsx scripts/check-renderer.ts --spec=renderer --project=desktop,mobile --evidence-dir=.planning/phases/20-renderer/artifacts
```

| Stage | Result | Recorded output |
|---|---|---|
| Fixture seed + fixture-only current-hash rereview/publish | PASS | Brand and 15 model fixture rows reached the build/server stage |
| `next build` | PASS | Compiled successfully in 7.0s; 18/18 static pages generated |
| Borrowed loopback server | PASS | `http://127.0.0.1:60539`; Ready in 269ms |
| Brand desktop | PASS | Complete server HTML, exact 15-model relation, hero and viewport assertions passed |
| Brand mobile | PASS | Complete server HTML, exact 15-model relation, hero and viewport assertions passed |
| Model desktop | FAIL | `invalid-primary-media-cardinality`; page failed closed to 404 |
| Model mobile | FAIL | `invalid-primary-media-cardinality`; page failed closed to 404 |
| Playwright total | FAIL | 2 passed, 2 failed in 9.2s |

### Static type check executed before the final renderer run

```text
pnpm exec tsc --noEmit
```

Result: PASS. The full Task 2 changed-file Biome command was not run after the renderer gap, so this evidence does not claim Task 2 completion.

### Boundary mode

```text
pnpm exec tsx scripts/check-renderer.ts --spec=boundary --project=desktop
```

Result: NOT RUN. The plan required all four renderer cases to be green first.

## Browser Matrix

| Surface | Initial server HTML | Summary/story/sources | Canonical relation | PAGE-06 topics | Overflow/a11y | Screenshot | Status |
|---|---|---|---|---|---|---|---|
| Brand desktop | PASS | PASS | Exactly 15 unique `/pen/` links and `全部型号（15）` | N/A | PASS | `artifacts/brand-desktop.png` | PASS |
| Brand mobile | PASS | PASS | Exactly 15 unique `/pen/` links and `全部型号（15）` | N/A | PASS | `artifacts/brand-mobile.png` | PASS |
| Model desktop | FAIL CLOSED | Not evaluated beyond 404 | Not evaluated | Not evaluated | Not evaluated | Not produced | FAIL |
| Model mobile | FAIL CLOSED | Not evaluated beyond 404 | Not evaluated | Not evaluated | Not evaluated | Not produced | FAIL |

The brand relation result is fixture evidence only. It is not the real 69-brand/236-model inventory and does not establish publication of the real 305 rows.

## Persisted Screenshots

| Artifact | Size | Result |
|---|---:|---|
| `.planning/phases/20-renderer/artifacts/brand-desktop.png` | 1,218,513 bytes | Persisted; awaiting fixture-only human mapping review |
| `.planning/phases/20-renderer/artifacts/brand-mobile.png` | 535,910 bytes | Persisted; awaiting fixture-only human mapping review |
| `.planning/phases/20-renderer/artifacts/model-desktop.png` | — | Not produced; must not be inferred or fabricated |
| `.planning/phases/20-renderer/artifacts/model-mobile.png` | — | Not produced; must not be inferred or fabricated |

## Fixture Hero Mapping Status

| Entity | Rendered asset path | Asset SHA-256 | Rights/license | Attribution | Source | Screenshot evidence | Human approval |
|---|---|---|---|---|---|---|---|
| `renderer-brand` / Renderer 测试品牌 | `/images/renderer-fixture/renderer-brand.jpg` | Not captured because the runner aborted before emitting its success result | CC0 | Renderer fixture · CC0 | `https://renderer.invalid/media/renderer-brand` | Brand desktop + mobile | NOT RUN |
| `renderer-model-01` / Renderer 型号 01 | `/images/renderer-fixture/renderer-model-01.jpg` | Not captured | CC0 | Renderer fixture · CC0 | `https://renderer.invalid/media/renderer-model-01` | No model screenshot | BLOCKED |

No fixture hero mapping is marked human-approved. Task 3 was not reached. Visual review for every real inventory image remains Phase 23 work.

## Exact Gap And Recovery

The runner changed fixture media paths after the Plan 20-01 seed had already published the rows. Its fixture-only SQL updated every media row belonging to `renderer-model-01`, including a deliberately negative primary-media row. After the required current-hash rereview/republish, more than one model media row qualified as primary. `getPublishedEntityPage` correctly rejected the model with `invalid-primary-media-cardinality` rather than choosing one arbitrarily.

Recovery is deliberately not executed in this evidence-closeout task:

1. Restrict the fixture-only path update to each entity's canonical `${entityId}-media-primary` row; leave gallery, remote, missing-attribution and other negative media rows untouched.
2. Perform the existing fact/language/media current-hash reviews and publish the brand plus 15 models after that narrow update.
3. Rerun only the four renderer cases. Require brand/model desktop/mobile all green and four non-empty PNGs.
4. Only then run the one Phase 20 boundary command and exact changed-file checks.
5. Present all four screenshots and complete asset hashes at Task 3. Human approval remains blocking and fixture-only.

## Scope Audit

- Phase 19 fixture/lifecycle/migration/readiness files: unchanged.
- Schema and migrations: unchanged.
- Real catalog and real 305 inventory: unopened and unchanged.
- Remote credentials, Turso, network content research, production and deployment: unused.
- Model screenshots: absent; no placeholder or copied image has been substituted.


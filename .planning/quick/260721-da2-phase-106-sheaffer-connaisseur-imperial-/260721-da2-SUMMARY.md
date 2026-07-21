---
phase: quick
plan: 260721-da2
subsystem: content-publication
tags: [sqlite, contract-v3, curated-content, sheaffer, owned-checkpoint]
status: complete
completed: 2026-07-21
product_commit: f7ee09e
---

# Quick 260721-da2 Summary

Phase 106 已在 caller-owned checkpoint copy 中发布三个独立 Sheaffer 页面：

- `hbOcg60TD2lr`：`sheaffer-connaisseur`，复用 raw identity，并保留旧 `sheaffer-s-connaisseur` 永久跳转。
- `phase106-sheaffer-imperial`：`sheaffer-imperial`，作为 1961 起的历史 family，不吸收 PFM、Targa 或 Legacy。
- `phase106-sheaffer-icon`：`sheaffer-icon`，current facts 限定到官方 9108 Matte Black fountain-pen SKU。

旧混名实体 `5JqrNzxFsWC6` 继续 retired，`/pen/犀飞利-sheaffer-帝国元首` 继续 hard-404，没有建立到 Imperial 的猜测性 redirect。PFM、Targa、Balance、Snorkel、Legacy Heritage 等既有 canonical payload/publication snapshot 保持不变。

## Contract-v3 deviation

Migration 032 的 `made_by` trigger 会在新增型号关系时同时 invalidates source pen 与 target brand。因而无法在新增三条公开 `made_by` 的同时保持 Sheaffer brand review/publication metadata byte-identical。本包没有重放或改写 brand pack；品牌正文、来源、reference、spec、media 与 content hash 保持不变，仅针对 trigger 产生的新 revision 重新完成 fact/language/media review，并通过 `publishEntity` 恢复公开。品牌反向公开型号集合只新增本批三页。

## Source verification

- Sheaffer 官方 9108 fountain-pen 页面于 2026-07-21 返回 HTTP 200，仍列 Medium、polished stainless-steel nib、piston converter、两枚 Classic cartridges 与 Matte Black/gloss black trim。
- PenHero `Early Sheaffer Imperials 1961–1962` 继续支持 Imperial 1961 起点、Touchdown/cartridge 分流及 IV/VI 等子型边界。
- SheafferTarga Connaisseur archive 继续支持 1986 起点与标准树脂款 18K 开放式尖的历史范围。

## Verification

- `node --import tsx --test tests/content/phase106-sheaffer-connaisseur-imperial-icon.test.ts` — PASS (1/1)
- `pnpm exec biome check ...` — PASS
- `pnpm exec tsc --noEmit --pretty false` — PASS
- `xmllint --noout public/images/library/site-original/phase106/sheaffer/sheaffer-connaisseur-imperial-icon.svg` — PASS
- `data/fpkg.db`、`data/fpkg.db-wal`、`data/fpkg.db-shm` SHA-256 前后完全一致。
- 重放三个实体均返回 `noop`。

## Product commit allowlist

产品提交 `f7ee09e` 精确包含七个文件：

- `.planning/content-research/sheaffer-connaisseur-phase106.md`
- `.planning/content-research/sheaffer-icon-phase106.md`
- `.planning/content-research/sheaffer-imperial-phase106.md`
- `public/images/library/site-original/phase106/sheaffer/sheaffer-connaisseur-imperial-icon.svg`
- `scripts/apply-phase106-sheaffer-connaisseur-imperial-icon-content.ts`
- `scripts/data/phase106-sheaffer-connaisseur-imperial-icon.ts`
- `tests/content/phase106-sheaffer-connaisseur-imperial-icon.test.ts`

所有无关 research、`.next-phase*`、Phase 105 quick 记录与 `260719-665` quick 目录均未进入产品提交。

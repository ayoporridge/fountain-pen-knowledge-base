---
phase: 127-pilot-78g-78gplus-88g-mr
plan: 01
subsystem: content
tags: [pilot, 78g, 88g, mr, taxonomy, publication]
requires:
  - phase84 Pilot brand fixture
  - migration 032 taxonomy identity
provides:
  - canonical Pilot 78G / FP-78G content pack
  - Pilot 88G / MR navigation article
  - exact MR1, MR2 and MR3 product-line packs
  - guarded checkpoint-only migration and regression
affects: [pilot-brand, public-entities, entity-redirects]
tech-stack:
  added: []
  patterns: [CuratedEntityPack, recordEntityContentReview, publishEntity]
key-files:
  created:
    - scripts/data/phase127-pilot-78g-88g-mr.ts
    - scripts/apply-phase127-pilot-78g-88g-mr-content.ts
    - tests/content/phase127-pilot-78g-88g-mr.test.ts
  modified:
    - src/lib/entity-redirects.ts
key-decisions:
  - "78G+ remains a sourced alias; current China FP-78G is the canonical exact product."
  - "88G is a navigation identity only; FP-MR1, FP-MR2 and FP-MR3 are separate pens."
  - "European DIN compatibility remains region-scoped and is excluded from China exact specs."
patterns-established:
  - "Two-donor batches may canonicalize one same-ID pen while reclassifying another donor to an article in one guarded transaction."
requirements-completed: [QUICK-260722-FRG]
duration: 24min
completed: 2026-07-22
---

# Quick 260722-frg Summary

Pilot 78G／78G+ 与 88G 的混合身份已在可重放内容包中修正；所有试验只发生在 caller-owned checkpoint copy，真实资料库未迁移。

## Outcome

- 保留 lOgSh4vuQsFK，规范为 /pen/pilot-78g-fp-78g，用 Pilot 中国 FP-78G 页锁定树脂杆、EF/F/M/B、十色与 CON-40；Pilot 78G+ 只作为有专业资料支撑的 alias。
- 保留 2GM0UtshoSVw，从错误单型号改为 /article/pilot-88g-mr-guide，并移除其 maker/reverse pair。
- 新增且只新增三条 exact pen：FP-MR1、FP-MR2、FP-MR3，分别保存 5、5、6 个官网编码图案。
- 中国 exact specs 只记录 Pilot 墨囊／CON-40；欧洲 DIN cartridge、Australia 的 Metropolitan 命名和 Brazil 数据均保持地区边界。
- 写入五份 2,000+ Unicode 的自然中文正文和五张 unique 1600×900 site-original factual SVG。
- 旧 78G 与 88G 路由分别永久导向 canonical pen 与 MR article。

## Publication and Safety

- apply 严格接受两个 exact raw donor 或完整 exact terminal state。
- 78G maker pair 原样保留；88G maker pair 删除；新增三个 MR maker/reverse pair。
- Pilot brand 仅按 post-topology current hash 重审；其它 Pilot pen 的完整实体 digest 保持不变。
- 五个目标实体均经 recordEntityContentReview 的 fact/language/media 三项审核，再由 publishEntity 发布；没有直接绕过 publication guard。
- pristine replay 返回 noop；终态 alias tamper 会 fail closed。
- 真实 data/fpkg.db SHA-256 保持 85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc。

## Verification

- node --import tsx --test tests/content/phase127-pilot-78g-88g-mr.test.ts — PASS 1/1（约 38 秒）
- pnpm exec tsc --noEmit --pretty false — PASS
- pnpm exec biome check tests/content/phase127-pilot-78g-88g-mr.test.ts src/lib/entity-redirects.ts — PASS
- xmllint --noout public/images/library/site-original/phase127/pilot/*.svg — PASS
- git diff --cached --check / git diff --check — PASS
- Product commit: e335c74 feat(content): split Pilot 88G MR lines and canonicalize 78G

## Scope Note

Quick 260722-frg 完成不代表全量内容目标完成。真实资料库迁移、全量自动检查、真人遍历、部署与线上逐条复查仍未开始，当前 /goal 必须继续保持 active。

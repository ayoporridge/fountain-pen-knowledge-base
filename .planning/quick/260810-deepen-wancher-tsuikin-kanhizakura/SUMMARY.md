# Phase 578 Summary — Wancher Tsuikin Kanhizakura

## Result

在不使用 Turso、且不写入真实 `data/fpkg.db` 的前提下，深化既有
`phase388-pen-wancher-tsuikin-kanhizakura`。本批合并 Phase 388 的长篇工艺/植物/护理/材质冲突资料和 Phase 519 的最新官方 product JSON 记录，保持同一型号身份，不新造重复实体。

## Content delivered

- 新正文：`.planning/content-research/wancher-tsuikin-kanhizakura-phase578.md`，约 7,498 Unicode 字符。
- 最新记录：product id `9327396454615`、handle `tsuikin-kanhizakuras`、SKU `WF-TSOU-SAK-RD`、`US$6,886`、`Ebonite / Red Urushi / Tsuikin Urushi`。
- 合并包：15 sources、26 claims、12 去重后 variants、4 scopes、5 conflicts、1 primary site-original SVG；旧日本页的水牛角通用文案仍作为边界冲突，不升级为固定材质。
- wrapper：`recordEntityContentReview`（fact/language/media）后由 `publishEntity` 发布；拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，验证 caller-owned copy、migration 032 和 protected snapshot。
- topology：保留已有唯一、正确的 Wancher `made_by` 关系，避免无谓删写触发品牌降级；恢复/保持唯一 reverse 导航。

## Owned checkpoint evidence

来源是 Phase 577 owned checkpoint，目标副本位于本目录 `evidence/checkpoint/owned-root/`，未纳入提交。首次应用结果为 `published`，重放结果为 `noop`，content hash 相同。

目标 readback：`published/public`、`content_ready=1`、`blocker_count=0`，正文 7,498 字符；15 references、26 claims、15 source items、12 variants、4 scopes、5 conflicts、1 primary media；`made_by=1`、reverse=1。

## Verification

- target test：1/1 passed；包含远端环境拒绝、审核—发布门、唯一身份/关系、正文字段、主图、hash 和 real DB snapshot 不变检查。
- SQLite `integrity_check=ok`、`foreign_key_check=[]`。
- full readiness（不带过时 locked baseline）：809 audited；119 brands、690 pens；786 published/content-ready/public；0 published/public blockers；23 backlog；`complete=false`。
- entity quality：duplicate groups 0、suspicious pen articles 0、thin active entities 0、made_by blockers 0。
- library contract：sources 3760、sourceItems 5649、claims 6997、citations 15879、stories 837、events 1160、media 1105、aliases 2833，passed。
- public media dry-run：801 checked、801 healthy、0 failed、0 changes。
- TypeScript、定向 Biome、diff check 和 production build passed。
- `data/fpkg.db` SHA-256 前后均为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。

## Remaining total-goal work

本批不等于全量完成。4 个非公开/退役品牌、16 个非公开/退役型号仍在 coverage gap，23 条 backlog 的完整收口、其余内容研究与关系修复、正式迁移真实资料库、真人全页面遍历、生产部署和线上逐条复查，均需在总 goal 中继续处理。Turso 配额恢复前继续使用离线 checkpoint；恢复后才做正式远端迁移和线上验证。

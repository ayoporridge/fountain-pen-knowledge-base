---
status: complete
created: 2026-09-07
---

# De-template brand navigation pages

## Objective

修复公开百科中由旧批次复制造成的品牌页—型号页正文重复：current OMAS、current Delta、Santini Italia、HongDian、Kanwrite、Eboya 六个品牌页改回品牌导航职责，保留精确型号页的事实、来源、规格、媒体、关系和审核拓扑不变。

## Scope and guardrails

- 只更新六个现有 brand entity 的 reviewed Markdown body；不新建实体，不改 slug/name/alias、model_specs、variants、claims、references、media、timeline 或 links。
- 每个品牌页保留已有来源范围和可核对的品牌事实，型号入口只作 navigation；不把单一型号的尺寸、重量、尖材或供墨方式写成品牌通用规格。
- 通过既有 Phase 430/431/442/443 apply/review/publication 路径，在 caller-owned disposable copy 中验证后再正式迁移本地真实 SQLite。
- apply/test 必须拒绝 Turso、symlink/hard-link 和非 owned copy；记录关系、规格、版本、引用、媒体 fingerprint，首次发布后 replay 为 noop，保护真实 catalog 快照不变。
- Turso SQL read 受配额阻塞期间，不做远端写入、部署或线上回读声明。

## Verification

1. six brand Markdown files each >= 2,600 body chars and >= 3 independent source groups; targeted duplicate scan reports zero brand/model duplicate paragraphs for the repaired pages.
2. Existing Phase 430/431/442/443 focused tests pass on disposable copies; all six retain identity, links, references, media and four current-hash reviews; replay is noop.
3. Formal owned copy passes migration, integrity/FK, data-contract, public-boundary, library/evidence/publication, entity-quality, media and markdown gates; atomic local install has exact rollback backup and updated fixture fingerprint.
4. Production build and local route/API readback return HTTP 200 for repaired brand pages and representative model pages; no remote completion claim.

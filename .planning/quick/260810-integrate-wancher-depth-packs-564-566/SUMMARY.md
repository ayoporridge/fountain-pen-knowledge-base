---
phase: 575
quick_id: 260810-integrate-wancher-depth-packs-564-566
status: complete
completed: 2026-08-10
---

# Phase 575 Summary — verify Wancher depth packs 564–566 in the current checkpoint

## Result

从 Phase 573 owned checkpoint 复制出本批副本后，按 564 → 565 → 566 顺序重放既有
Wancher 内容包。三次首次运行和三次 replay 全部为 `noop`，说明这些正文已经存在于
当前 checkpoint；没有新增实体、没有重复写入、没有改变 checkpoint 内容。原有 source
marker 仍显示为对应的 Phase 519/521 pack，是因为 Phase 564–566 复用相同 canonical
pack 内容哈希，而不是漏发布。

三个 canonical 型号最终回读为：

- Zogan Swan Urushi Black：4288 字符、7 references、8 variants、1 张 primary media，
  published/public，内容 hash `sha256:v3:c77ee39e775b5f14fa44b9635216febc7ec68b8d09aa786edae96c11594a94c9`。
- Kyoto Urushi Kasane-iro Asagao：4134 字符、7 references、12 variants、1 张 primary
  media，published/public，内容 hash `sha256:v3:8a4b7a0347c1a7599b1c29711a47011ce871174d1e26c58e7a08ed88b74c1669`。
- Oita Urushi Kurozan Fountain Pen：4790 字符、7 references、8 variants、1 张 primary
  media，published/public，内容 hash `sha256:v3:eca74ab606b018573cf94006bfe1655a60864f3c1dcebb07ea1b3b55ada64cfa`。

三条型号各自只有一个 Wancher `made_by` 关系，Phase 566 的旧 Oita donor
`phase524-wancher-oita-urushi-kurozan` 仍为 `retired` 且 `taxonomy_merged`，没有被重新
公开。

## Verification

- 三个既有定向测试：3/3 通过，覆盖 owned copy、远端环境拒绝、canonical identity、
  正文、来源、规格、variants、媒体、审核—发布门、幂等 replay 和 Oita retired donor。
- SQLite `integrity_check` 与 `foreign_key_check`：通过。
- public media dry-run：801 checked / 801 healthy / 0 failed / 0 changes。
- library contract：通过；sources 3760、sourceItems 5649、claims 6973、citations 15820、
  stories 837、events 1158、media 1105、aliases 2828。
- entity quality：809 audited、786 active、23 retired excluded；duplicate、suspicious、
  thin、broken link 均为 0。
- readiness：809 audited、786 ready/published/public、0 public blockers、23 backlog；
  `content_complete=false`、`complete=false`。
- coverage：119 brands（115 ready、4 gap）；690 pens（671 ready、3 starter、16 gap）。
- TypeScript、Biome、diff check、production build：均通过。

## Database boundary

本批唯一写入是 owned checkpoint
`.planning/quick/260810-integrate-wancher-depth-packs-564-566/evidence/checkpoint/owned-root/catalog-phase575-wancher-564-566.db`；首次和 replay
均 no-op，最终 SHA 与 Phase 573 源副本相同。真实 `data/fpkg.db` SHA-256 前后均为
`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。Turso、正式资料库、
生产部署和线上页面均未写入。

本 Phase 只是确认三条既有 Wancher 内容已在当前离线 checkpoint 中，没有减少全量
readiness backlog；总目标仍需继续离线内容覆盖，并在额度恢复后正式迁移、远端读回、
部署、真人遍历和线上逐页复查。

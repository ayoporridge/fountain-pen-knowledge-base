---
phase: 576
quick_id: 260810-integrate-pilot-custom-urushi-phase400
status: complete
completed: 2026-08-10
---

# Phase 576 Summary — integrate the deeper Pilot Custom URUSHI pack

## Result

在 Phase 575 owned checkpoint 上重放既有 Phase 400 refresh，更新了已有 canonical
实体 `s105PILOT_URUSHI`，没有创建重复型号，也没有改动 Pilot 品牌实体。首次 apply
为 `published`，replay 为 `noop`，内容 hash 为
`sha256:v3:29cc18ce8a9b32f064bfe2c495f81f4e34ead7e3cd3135f3e639b77bdbfd1eaf`。

正文从 Phase 105 版本的 2070 字符增加到 8115 字符，覆盖：

- 官方 FKV-88SR exact SKU、155 mm、φ20 mm、44 g、当前日本价格快照；
- 硬橡胶蝋色漆、18K No.30、Pilot cartridge/converter、CON-40／CON-70N；
- 漆黑／朱／紺青三颜色组、FM/M/B 九个现行 SKU；
- 2024 年 11 月紺青时间边界、Custom 845/823/743/Heritage 912 sibling 区分；
- 试写、验收、清洁、漆面／溶剂／颜料墨水／航空携带和二手核对边界。

最终回读：12 个 approved references（12 个独立来源组）、12 个 variants（3 个
edition groups + 9 个 market SKUs）、1 张 primary media、四项当前审核均 approved，
`publishable=1`、`blocker_count=0`、published/public。Pilot `made_by` 与反向导航各
保持唯一一条，品牌实体没有被正文包覆盖。

## Verification

- Phase 400 定向测试：1/1 通过。由于真实 `data/fpkg.db` 在本轮之前已经是 Phase 400
  终态，测试现在根据 disposable copy 的初始 source/status/body 判断首次结果应为
  `published` 或 `noop`；Phase 576 本身在旧的 Phase 105 checkpoint 上仍以
  `published` 作为集成证据。
- owned checkpoint SQLite `integrity_check` 与 `foreign_key_check`：通过。
- public media dry-run：801 checked / 801 healthy / 0 failed / 0 changes。
- library contract：通过；sources 3760、sourceItems 5649、claims 6983、citations
  15853、stories 837、events 1159、media 1105、aliases 2829。
- entity quality：809 audited、786 active、23 retired excluded；duplicate、suspicious、
  thin、broken link 均为 0。
- readiness：809 audited、786 ready/published/public、0 public blockers、23 backlog；
  `content_complete=false`、`complete=false`。
- coverage：119 brands（115 ready、4 gap）；690 pens（671 ready、3 starter、16 gap）。
- TypeScript、Biome、diff check、production build：均通过。

## Database boundary

本批唯一实际写入是 owned checkpoint
`.planning/quick/260810-integrate-pilot-custom-urushi-phase400/evidence/checkpoint/owned-root/catalog-phase576-pilot-custom-urushi.db`，最终 SHA-256 为
`f403c486809d2243a76cd600f25372e2a02b1cab13543594fcd9f749c7936377`。真实
`data/fpkg.db` 前后均为
`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；没有连接 Turso、
正式迁移、生产部署或线上写入。

本 Phase 完成的是一个已有 Pilot 型号的离线正文深化，不代表全量 goal 完成。仍需
继续处理其他真实品牌／型号与 backlog，额度恢复后统一正式迁移、远端读回、全站自动
检查、真人遍历、部署和线上逐页复查。

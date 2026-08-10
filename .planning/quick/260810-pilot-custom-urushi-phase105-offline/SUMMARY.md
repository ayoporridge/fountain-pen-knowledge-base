---
phase: 572
quick_id: 260810-pilot-custom-urushi-phase105-offline
status: complete
completed: 2026-08-10
---

# Phase 572 Summary — Pilot Custom URUSHI offline publish gate

## Result

在 Phase 571 owned checkpoint 上成功重放已修正的 Phase 105 审核—发布脚本。没有连接 Turso，也没有写入真实 `data/fpkg.db`。

- first outcome：`published`；replay outcome：`noop`；两次退出码均为 0。
- checkpoint SHA-256：`a1b24f802278d54cceb7a46c581516ad1f0e6e66f86297cbd7c1cf91d4fbc5a8`。
- 来源 checkpoint SHA-256：`383168fffa8a61f359230ea5bfdd6474647c1290ec91728fa937b404e6d94dd9`。
- 真实 `data/fpkg.db` SHA-256 仍为：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。

## Target readback

- `s105PILOT_URUSHI` / `pilot-custom-urushi` 为 `published`、public、`blockers=[]`；正文 2070 字符，唯一 Pilot `made_by` 关系正确。
- model spec 回读为 `FKV-88SR`、硬橡胶蝋色漆、18K No.30、Pilot cartridge/converter、CON-40／CON-70N；未从 Custom 823/845 回填未核实尺寸重量。
- 3 个 approved variants：漆黑、朱、2024 年 11 月加入的紺青；主图是明确标注“非产品照片”的原创 SVG。
- 5 个 source items、5 个 approved references，以及当前 content hash 对应的 fact/language/media/publication 四项 approved review；旧 hash reviews 被 revoked。
- target readiness：`publishable=1`、`blocker_count=0`、`is_public=1`。

## Verification

- Phase 105 定向 node:test：1 passed / 0 failed，exit 0。
- SQLite integrity/FK、public-media dry-run（801/801 healthy、0 failed）、TypeScript、diff check、production build：全部 exit 0。
- 并行 tsc 曾因 build 重生成 `.next/types` 出现一次竞态 exit 2；build 完成后串行 tsc exit 0，详见 `evidence/tsc-parallel-race.md`。

## Boundary

该 quick 只证明 Pilot Custom URUSHI 在 caller-owned checkpoint 上可通过既有审核—发布门；真实库正式迁移、Turso 远端验证、生产部署、真人遍历、线上逐条复查，以及其余 23 条 retired lineage backlog 仍未完成，不能将本批视为全量 goal 完成。

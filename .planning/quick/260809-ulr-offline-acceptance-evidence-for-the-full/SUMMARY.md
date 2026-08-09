---
name: offline-acceptance-evidence-for-the-full
status: in_progress
updated: 2026-08-09
---

# Offline acceptance evidence

本 quick 用于在 Turso 额度恢复前保存可复核的本地验收证据；不代表全量 goal 已完成。

当前已完成但尚未归档的检查：

- Phase 546–551 owned checkpoint 上的 quality audit：804 audited、781 active、23 retired lineage；active 没有重复名称、thin brand/model、suspicious pen article 或 `made_by` blocker。
- Local checkpoint coverage summary：brands 115 ready / 4 retired gap；models 669 ready / 16 retired gap；这些 gap 与 23 条 retired donor lineage 对应，公开实体仍无 blocker。
- production build、TypeScript、Markdown、data contract、migration safety、library contract、public boundary、publication gate、evidence contract 均已通过。
- Phase 105 首次回放发布 `s105PILOT_URUSHI`，重放返回 `noop`；读回显示正文 2070 Unicode 字符、`published`、revision 438/438、contract 3、当前 hash `sha256:v3:acb48825f4d25c002358d7337b77c6c43c37fdf1eecc4667d5296a921b23bf66`，fact/language/media/publication 各有一条当前 hash approved review，5 个来源引用、9 条 approved spec evidence、1 张 approved primary media，以及唯一 `made_by` → Pilot。
- `PRAGMA integrity_check` 返回 `ok`；真实 `data/fpkg.db` SHA-256 仍为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。

仍未完成且不能用本地结果冒充：

- 真实 `data/fpkg.db` 的正式迁移和 Turso 远端读回；当前额度／rows-read 限制使这一步暂缓。
- 生产部署、线上逐条公开页复查、真实环境回滚证据。
- 23 条 retired donor lineage 的正式 inventory 处置规则；当前公开实体已经 781/781 clean，不能为让 readiness 数字归零而删除 lineage 或绕过发布门。
- 全量 goal 仍开放；本 quick 只证明额度恢复前可独立完成的离线 acceptance，不改变全量目标。

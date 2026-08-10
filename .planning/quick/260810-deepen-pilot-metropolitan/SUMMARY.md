# Phase 579 完成记录：Pilot MR Metropolitan

## 本批交付

- 深化已有实体 `phase292-pen-pilot-metropolitan`，未新增 Pilot 或 Metropolitan 实体。
- 正文 `.planning/content-research/pilot-metropolitan-phase579.md` 共 5,269 Unicode 字符，覆盖北美 MR 身份、Classic／Animal／Retro Pop 版本边界、日本 Cocoon 与 Kakuno 区分、PN91111 尺寸重量、钢尖与尖幅、Pilot 墨囊／CON-B／CON-40、历史窗口、维护、选购和图片证据边界。
- `scripts/data/phase579-pilot-metropolitan-depth.ts` 复用 Phase 292 的来源化 pack，并追加 Pilot 官方 promotional catalog、版本化别名、规格证据、版本、冲突记录和时间线；保留既有本站原创 factual SVG。
- `scripts/apply-phase579-pilot-metropolitan-depth.ts` 只接受 owned checkpoint copy，拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，通过 `recordEntityContentReview` 与 `publishEntity` 完成审核—发布。
- `tests/content/phase579-pilot-metropolitan-depth.test.ts` 覆盖远端环境拒绝、真实库快照不变、身份／关系、正文、证据、媒体、审核 hash 和 replay 幂等性。

## 离线验证

- 定向 test：1 passed。
- owned checkpoint apply：`published`；replay：`noop`；hash 均为 `sha256:v3:b2ead7c416c1f271a099bcd7b9683dd39471f139f3c7c70460b96f6b5ae1bdd5`。
- checkpoint readback：`published/public`、`publishable=1`、`blocker_count=0`、body 5,269；claims=17、references=7、variants=10、scopes=1、conflicts=2、primary media=1；`made_by` 与反向导航各 1 条。
- 当前 hash 对应的 fact/language/media/publication reviews 全部 `approved`；旧 hash 的 reviews 保留为 `revoked` 历史记录。
- SQLite：`PRAGMA integrity_check=ok`；`PRAGMA foreign_key_check` 无输出。
- public media dry-run：801 scanned、801 healthy、0 failed、0 changes。
- TypeScript、目标文件 Biome、data pack stdin format、production build 均通过。
- readiness-v2（本地 owned copy，未使用 Turso）：809 audited（119 brands / 690 pens），786 published/public/content-ready，23 backlog，0 published/public blockers；目标行 `content_ready=true`、`made_by=exactly_one`。全量 verdict 仍为 `content_complete=false`、`complete=false`。
- 真实 `data/fpkg.db` hash 前后均为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`，本批没有真实库写入。

## 未完成边界

Turso 正式迁移、生产部署、线上逐条复查，以及其余 23 个 readiness backlog 和尚未覆盖的公开品牌／型号仍属于总 goal 的后续工作；本批不改变这些状态。

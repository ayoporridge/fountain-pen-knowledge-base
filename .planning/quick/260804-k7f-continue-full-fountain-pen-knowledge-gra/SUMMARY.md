# Phase 490 Summary

## 已完成

- 复用并深化既有 `twsbi-diamond-580`、`twsbi-diamond-580alr`、`twsbi-go`，没有创建新实体。
- 三份研究稿均为自然中文正文，正文长度约 2.86k–2.96k Unicode 字符，明确旋钮活塞、铝制部件、弹簧活塞、容量／尺寸测量口径、清洗维护和相邻型号边界。
- 新增 `CuratedEntityPack` 数据包和窄范围应用脚本；应用脚本拒绝继承 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，并只接受 caller-owned checkpoint copy。
- 首轮应用通过 fact/language/media 审核和 `publishEntity`；持久 checkpoint 重放为 `noop`。

## 证据

- 定向测试：`tests/content/phase490-twsbi-diamond-go-depth.test.ts` 通过。
- 持久 checkpoint 三实体均为 `published`，正文长度分别约 2958、2862、2879；approved references 分别为 11、10、10；每条均 1 个 approved primary media、1 个 `made_by` 和 1 个 reverse 导航，publication contract 为 v3 且 revision/hash 对齐。
- checkpoint `PRAGMA integrity_check` 为 `ok`，外键检查 0 条。
- `check-library-contract.ts`：sources 2803、sourceItems 4568、claims 4655、citations 11862、media 986、aliases 2409；`Library contract OK`。
- `audit-entity-quality.ts --json`：690 entities、668 active、22 retired，duplicateGroups 0、suspiciousPenArticles 0、thinEntities 0、brokenLinks 0，published/public blockers 0，backlog 22。
- 定向 Biome 通过。全量 `tsc --noEmit` 仍只有既有基线错误：`tests/content/phase346-jinhao-x450-x750.test.ts:183-184` 的 TS7022，以及 `tests/migration/sync-local-catalog-to-turso.test.ts:76` 的 TS2741。
- 真实 `data/fpkg.db` 主文件 SHA-256 仍为 `d93136ec6e5f12812b795f59b549b74d889a8b6d4dbd2c9071304a8107964c77`，未被本批试写。

## 边界

本批不代表全量 goal 完成。仍需继续覆盖剩余低信息型号和缺失品牌／SKU，并在所有内容包完成后执行正式 Turso 迁移、全量自动检查、真人遍历、部署和线上逐条复查。

# Phase431 完成记录

## 内容包

已为以下五个既有品牌实体深化可发布的自然中文品牌导航正文，并保留 canonical identity、型号边界、可靠来源和原创事实图：

| 品牌 | published body 字符 | approved references | source independence groups | primary media |
| --- | ---: | ---: | ---: | ---: |
| Current Delta | 3076 | 5 | 4 | 1 |
| Fountain Pen Revolution | 2921 | 5 | 5 | 1 |
| Ensso | 3049 | 5 | 5 | 1 |
| Moore | 2966 | 8 | 8 | 1 |
| Gioia | 3043 | 7 | 7 | 1 |

正文分别补充了品牌身份、型号树与版本边界、历史断点、材料与上墨、清洗维护、选购验收、样本范围和图片证据；没有把 Delta Dolcevita、FPR Himalaya V2、Ensso Piuma、Moore Finger tip 或 Gioia Capodimonte Kawari 的单一型号规格泛化到全品牌，也没有新建重复型号。

## Owned checkpoint

- 路径：`.planning/quick/260804-21d-delta-fpr-ensso-moore-gioia-owned-checkpoint/checkpoint/fpkg.db`
- 来源：Phase430 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256：`4d7e5351d333a016e27dad1ffa9a98ae30c8cf5b3618c18d6c914ca87f7db1c5`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（本轮应用前后不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673；approved reviews：2692
- 五个品牌均为 `published`，contract version 3；每个品牌的 content hash 对应 fact、language、media、publication 四项审核。

## 验证结果

- `pnpm exec tsx --test tests/content/phase431-brand-depth-refresh.test.ts`：1 pass（约 38.0 s）。
- `pnpm exec biome check scripts/apply-phase431-brand-depth-refresh.ts scripts/data/phase431-brand-depth-refresh.ts tests/content/phase431-brand-depth-refresh.test.ts`：通过；Biome 配置仅纳入匹配的测试文件，脚本／data 已由 `tsx` 导入和定向测试覆盖。
- `pnpm exec tsc --noEmit --pretty false`：需记录仓库既有基线错误；仍为 `tests/content/phase346-jinhao-x450-x750.test.ts` 的两个 TS7022 与 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741，没有 Phase431 新错误。
- `git diff --check`：通过；Phase431 正文没有 `made_by`、`数据库`、`仓库` 禁用词。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4071、citations 11062、stories 718、events 876、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- Current Delta、Fountain Pen Revolution、Ensso、Moore、Gioia 的 1 个 published 型号各有 1 条正确的 `made_by` 反向导航；缺失 published reverse link：0。

## 边界

Phase431 只完成 owned checkpoint 中五个已有品牌页的内容深化与审核发布链路验证。全量内容修复、其余未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

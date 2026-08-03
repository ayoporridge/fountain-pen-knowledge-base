# Phase 442 完成记录

## 内容包

本阶段没有新建品牌或型号实体，只刷新五个已有品牌的自然中文品牌导航正文，并保留原有 canonical identity、公开型号、`made_by` 关系、来源和原创示意图：

| 品牌 | published body 字符 | approved references | source independence groups | primary media |
| --- | ---: | ---: | ---: | ---: |
| Pollock Pen Co. | 2900 | 5 | 4 | 1 |
| Tramol | 3048 | 5 | 4 | 1 |
| Wahl | 2806 | 6 | 4 | 1 |
| David Oscarson | 2922 | 7 | 5 | 1 |
| Eboya | 2865 | 5 | 3 | 1 |

正文补充了 Pollock／John Hancock 的商品名与制造者边界、Tramol 的钢笔／墨水／礼盒分层、Wahl 的 Boston／Tempoint／Wahl Pen 谱系、David Oscarson 的 collection 与 Winter 配额边界、Eboya 的 Nikko Ebonite 家族与尺寸 SKU 导航，并补齐维护、二手核验、图片用途和未公开字段的处理规则。没有重复建模，也没有把单支或单个系列的规格外推到整个品牌。

## Owned checkpoint

- 路径：`.planning/quick/260804-4li-pollock-tramol-wahl-oscarson-eboya-owned-checkpoint/checkpoint.db`
- 来源：Phase 441 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256（apply 后）：`84db22c126e69f11eeac714d90a976065acc53779797516dd5f539d6c8cf966f`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（应用前后保持不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673
- 五个品牌均为 `published`，contract version 3；每个品牌对应 fact、language、media、publication 四项 approved review。

## 验证结果

- `pnpm exec tsx --test tests/content/phase442-brand-depth-refresh.test.ts`：1 pass（约 39.1 s；包含 remote-env 拒绝、owned-copy 权限、审核—发布、反向导航与 replay noop）。
- owned checkpoint apply：Pollock、Tramol、Wahl、David Oscarson、Eboya 五个实体均返回 `outcome: published`。
- `pnpm exec biome check tests/content/phase442-brand-depth-refresh.test.ts scripts/apply-phase442-brand-depth-refresh.ts scripts/data/phase442-brand-depth-refresh.ts`：通过。
- `pnpm exec tsc --noEmit --pretty false`：仍只有仓库既有基线错误：`tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022，以及 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741；没有 Phase 442 新错误。
- `git diff --check`：通过；五份 Phase 442 正文没有 `made_by`、`数据库`、`仓库` 禁用词。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4069、citations 11058、stories 718、events 877、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- 已发布型号反向导航完整：Pollock 1/1、Tramol 1/1、Wahl 1/1、David Oscarson 1/1、Eboya 1/1；缺失 published reverse link：0。

## 边界

Phase 442 只完成 owned checkpoint 中五个已有品牌页的内容深化与审核发布链路验证。全量内容修复、其余未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

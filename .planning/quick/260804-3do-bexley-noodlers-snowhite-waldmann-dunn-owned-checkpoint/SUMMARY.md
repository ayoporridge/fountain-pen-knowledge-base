# Phase437 完成记录

## 内容包

已为以下五个既有品牌实体深化可发布的自然中文品牌导航正文，并保留 canonical identity、型号边界、可靠来源和原创事实图：

| 品牌 | published body 字符 | approved references | source independence groups | primary media |
| --- | ---: | ---: | ---: | ---: |
| Bexley | 2775 | 8 | 8 | 1 |
| Noodler’s | 2730 | 7 | 6 | 1 |
| 白雪 Snowhite | 3200 | 4 | 4 | 1 |
| Waldmann | 2971 | 5 | 5 | 1 |
| Dunn | 2754 | 6 | 6 | 1 |

正文补充了历史／复兴语境、型号与材料分层、供墨机构、笔尖与版本差异、维修、选购、二手核验和图片规则。没有新建重复型号：Bexley 保留 Original 入口，Noodler’s 保留 Standard Flex／Nib Creaper 与既有路线，Snowhite 保留 FP20，Waldmann 保留 Tuscany，Dunn 保留泵式型号导航。

## Owned checkpoint

- 路径：`.planning/quick/260804-3do-bexley-noodlers-snowhite-waldmann-dunn-owned-checkpoint/checkpoint/fpkg.db`
- 来源：Phase 436 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256：`5c26bccf10fb3b27f88e806d7b286e4851c2f758fe4b579093c16c1c63580e0a`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（本轮应用前后不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673；approved reviews：2692
- 五个品牌均为 `published`，contract version 3；每个品牌当前 content hash 对应 fact、language、media、publication 四项审核。

## 验证结果

- `pnpm exec tsx --test tests/content/phase437-brand-depth-refresh.test.ts`：1 pass（约 38.7 s）。
- owned checkpoint apply：五个实体均返回 `outcome: published`；定向测试中的第二次回放为 noop。
- `pnpm exec biome check tests/content/phase437-brand-depth-refresh.test.ts`：通过；脚本／data 目录按仓库配置被忽略，已由 `tsx` 模块加载和定向测试覆盖。
- `pnpm exec tsc --noEmit --pretty false`：需记录仓库既有基线错误；仍为 `tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022 与 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741，没有 Phase437 新错误。
- `git diff --check`：通过；五份正文没有 `made_by`、`数据库`、`仓库` 禁用词。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4071、citations 11063、stories 718、events 877、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- 已发布型号反向导航完整：Bexley 1/1、Noodler’s 2/2、Snowhite 1/1、Waldmann 1/1、Dunn 1/1；缺失 published reverse link：0。

## 边界

Phase437 只完成 owned checkpoint 中五个已有品牌页的内容深化与审核发布链路验证。全量内容修复、其余未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

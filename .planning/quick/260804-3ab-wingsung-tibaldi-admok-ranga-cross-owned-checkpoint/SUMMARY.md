# Phase436 完成记录

## 内容包

已为以下五个既有品牌实体深化可发布的自然中文品牌导航正文，并保留 canonical identity、型号边界、可靠来源和原创事实图：

| 品牌 | published body 字符 | approved references | source independence groups | primary media |
| --- | ---: | ---: | ---: | ---: |
| 永生 WingSung | 3084 | 5 | 5 | 1 |
| Tibaldi | 3040 | 6 | 6 | 1 |
| Admok | 3052 | 5 | 5 | 1 |
| Ranga Pens | 3032 | 5 | 5 | 1 |
| 高仕 Cross | 2985 | 5 | 5 | 1 |

正文补充了历史与复兴边界、系列／SKU 分流、笔尖与供墨差异、维护、选购、二手核验和图片规则。没有新建重复型号：WingSung 保留 601、618、699 等既有型号的分流，Admok J800 与 Pelikan M800 的市场混名继续隔离，Cross 的 Bailey Light、Stratford、Townsend、Century II 继续按既有实体导航。

## Owned checkpoint

- 路径：`.planning/quick/260804-3ab-wingsung-tibaldi-admok-ranga-cross-owned-checkpoint/checkpoint/fpkg.db`
- 来源：Phase 435 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256：`a0c999edbf789ab80a4bb46cb70ed1f2a07d26e157fd2019fc794fc9452bc91c`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（本轮应用前后不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673；approved reviews：2692
- 五个品牌均为 `published`，contract version 3；每个品牌当前 content hash 对应 fact、language、media、publication 四项审核。

## 验证结果

- `pnpm exec tsx --test tests/content/phase436-brand-depth-refresh.test.ts`：1 pass（约 38.1 s）。
- owned checkpoint apply：五个实体均返回 `outcome: published`；定向测试中的第二次回放为 noop。
- `pnpm exec biome check ...`：通过；Biome 配置处理测试文件，脚本／data 目录按仓库配置被忽略，已由 `tsx` 模块加载和定向测试覆盖。
- `pnpm exec tsc --noEmit --pretty false`：需记录仓库既有基线错误；仍为 `tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022 与 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741，没有 Phase436 新错误。
- `git diff --check`：通过；五份正文没有 `made_by`、`数据库`、`仓库` 禁用词。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4071、citations 11063、stories 718、events 877、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- 已发布型号反向导航完整：WingSung 11/11、Cross 4/4、Tibaldi 1/1、Admok 1/1、Ranga 1/1；缺失 published reverse link：0。

## 边界

Phase436 只完成 owned checkpoint 中五个已有品牌页的内容深化与审核发布链路验证。全量内容修复、其余未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

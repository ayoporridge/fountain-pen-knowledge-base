# Phase434 完成记录

## 内容包

已为以下五个既有品牌实体深化可发布的自然中文品牌导航正文，并保留 canonical identity、型号边界、可靠来源和原创事实图：

| 品牌 | published body 字符 | approved references | source independence groups | primary media |
| --- | ---: | ---: | ---: | ---: |
| Asvine | 3023 | 5 | 5 | 1 |
| 晨光 M&G | 3123 | 4 | 4 | 1 |
| S.T. Dupont | 2978 | 5 | 5 | 1 |
| 逗万 DareWorks | 2963 | 5 | 5 | 1 |
| SCRIBO | 2897 | 5 | 4 | 1 |

正文补充了品牌与型号导航、供墨和笔种分流、版本边界、可核实历史／当前窗口、选购与维护、图片规则和资料不足时的保留策略。没有新建重复型号，没有把单支商品规格泛化到全品牌；共享原创图的品牌／模型来源也未重复合并。

## Owned checkpoint

- 路径：`.planning/quick/260804-2t3-asvine-mg-st-dupont-douwan-scribo-owned-checkpoint/checkpoint/fpkg.db`
- 来源：Phase 433 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256：`5477321d15552d8e6e70cbf19d92e7d9280394b2cf57c3b0945b4cb7ad16692c`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（本轮应用前后不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673；approved reviews：2692
- 五个品牌均为 `published`，contract version 3；每个品牌的 content hash 对应 fact、language、media、publication 四项审核。

## 验证结果

- `pnpm exec tsx --test tests/content/phase434-brand-depth-refresh.test.ts`：1 pass（约 37.3 s）。
- owned checkpoint apply：五个实体均返回 `outcome: published`；回放路径在定向测试中均为 noop。
- `pnpm exec biome check scripts/apply-phase434-brand-depth-refresh.ts scripts/data/phase434-brand-depth-refresh.ts tests/content/phase434-brand-depth-refresh.test.ts`：通过；Biome 配置只纳入匹配的测试文件，脚本／data 已由 `tsx` 导入和定向测试覆盖。
- `pnpm exec tsc --noEmit --pretty false`：需记录仓库既有基线错误；仍为 `tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022 与 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741，没有 Phase434 新错误。
- `git diff --check`：通过；五份正文没有 `made_by`、`数据库`、`仓库` 禁用词。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4070、citations 11061、stories 718、events 876、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- 已发布型号反向导航完整：Asvine 3/3、SCRIBO 3/3、S.T. Dupont 2/2、逗万 1/1、晨光 1/1；缺失 published reverse link：0。

## 边界

Phase434 只完成 owned checkpoint 中五个已有品牌页的内容深化与审核发布链路验证。全量内容修复、其余未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

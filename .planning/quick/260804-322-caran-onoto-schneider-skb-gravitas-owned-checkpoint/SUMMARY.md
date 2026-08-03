# Phase435 完成记录

## 内容包

已为以下五个既有品牌实体深化可发布的自然中文品牌导航正文，并保留 canonical identity、型号边界、可靠来源和原创事实图：

| 品牌 | published body 字符 | approved references | source independence groups | primary media |
| --- | ---: | ---: | ---: | ---: |
| Caran d’Ache | 2763 | 5 | 3 | 1 |
| Onoto | 2902 | 9 | 9 | 1 |
| Schneider | 2748 | 4 | 3 | 1 |
| SKB 文明钢笔 | 3362 | 8 | 7 | 1 |
| Gravitas Pens | 2974 | 6 | 6 | 1 |

正文补充了品牌与型号导航、历史／现代时间边界、供墨与笔尖分流、版本差异、维护、选购、二手核验和图片规则。没有新建重复型号，也没有把 Ecridor、Magna、Ray、RS-501i 或 Ultemate Vac 的单支规格泛化到整个品牌。

## Owned checkpoint

- 路径：`.planning/quick/260804-322-caran-onoto-schneider-skb-gravitas-owned-checkpoint/checkpoint/fpkg.db`
- 来源：Phase 434 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256：`c7684f91d144ac573e6f4b28e5a6e77159e08372d977ac6aafe52c8d18bf0ec0`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（本轮应用前后不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673；approved reviews：2692
- 五个品牌均为 `published`，contract version 3；每个品牌的 content hash 对应 fact、language、media、publication 四项审核。

## 验证结果

- `pnpm exec tsx --test tests/content/phase435-brand-depth-refresh.test.ts`：1 pass（约 36.9 s）。
- owned checkpoint apply：五个实体均返回 `outcome: published`；回放路径在定向测试中均为 noop。
- `pnpm exec biome check scripts/apply-phase435-brand-depth-refresh.ts scripts/data/phase435-brand-depth-refresh.ts tests/content/phase435-brand-depth-refresh.test.ts`：通过；Biome 配置只纳入匹配的测试文件，脚本／data 已由 `tsx` 导入和定向测试覆盖。
- `pnpm exec tsc --noEmit --pretty false`：需记录仓库既有基线错误；仍为 `tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022 与 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741，没有 Phase435 新错误。
- `git diff --check`：通过；五份正文没有 `made_by`、`数据库`、`仓库` 禁用词。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4071、citations 11063、stories 718、events 877、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- 已发布型号反向导航完整：Caran d’Ache 2/2、Schneider 2/2、SKB 3/3，其余 Onoto 1/1、Gravitas 1/1；缺失 published reverse link：0。

## 边界

Phase435 只完成 owned checkpoint 中五个已有品牌页的内容深化与审核发布链路验证。全量内容修复、其余未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

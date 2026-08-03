# Phase427 完成记录

## 内容包

已为以下五个既有品牌实体写入可发布的自然中文品牌导航正文，并保留其官方／可靠来源、既有原创示意图、canonical identity 和系列边界：

| 品牌 | 正文字符 | approved references | primary media |
| --- | ---: | ---: | ---: |
| Aurora | 2693 | 4 | 1 |
| Visconti | 2957 | 5 | 1 |
| Montegrappa | 2867 | 4 | 1 |
| Conklin | 2986 | 4 | 1 |
| BENU | 2750 | 5 | 1 |

正文分别补充了品牌历史、系列分层、版本差异、上墨与维护边界、购买身份检查、图片证据边界和资料等级；品牌层不把型号规格或单支评测体验泛化到整个品牌。

## Owned checkpoint

- 路径：`.planning/quick/260804-0qm-aurora-visconti-montegrappa-conklin-benu-owned-checkpoint/checkpoint/fpkg.db`
- 来源：Phase426 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256：`cec88909194ab39f258b4f5c4ef3a8cd83b110c6e728795327263bedb6de9a7d`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（应用前后不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673；approved reviews：2692
- 五个品牌均为 `published`，contract version 3，content hash 对应 fact、language、media、publication 四项审核。

## 验证结果

- `pnpm exec tsx --test tests/content/phase427-brand-depth-refresh.test.ts`：1 pass。
- `pnpm exec biome check scripts/data/phase427-brand-depth-refresh.ts scripts/apply-phase427-brand-depth-refresh.ts tests/content/phase427-brand-depth-refresh.test.ts`：通过。
- `pnpm exec tsc --noEmit --pretty false`：仅保留仓库既有基线错误：`tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022、`tests/migration/sync-local-catalog-to-turso.test.ts` 一个 NODE_ENV TS2741；没有 Phase427 新错误。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4072、citations 11064、stories 718、events 877、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- 五品牌所有 published pen 均存在唯一 reverse link；缺失 published reverse link：0。

## 边界

Phase427 只完成 checkpoint 中五个品牌页的内容深化与审核发布链路验证。全量内容修复、其它未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

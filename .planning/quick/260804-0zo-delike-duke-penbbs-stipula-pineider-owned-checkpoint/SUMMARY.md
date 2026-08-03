# Phase428 完成记录

## 内容包

已为以下五个既有品牌实体写入可发布的自然中文品牌导航正文，并保留其现有 canonical identity、型号边界、可靠来源和原创事实图：

| 品牌 | 正文字符 | approved references | source independence groups | primary media |
| --- | ---: | ---: | ---: | ---: |
| Delike | 2842 | 5 | 4 | 1 |
| Duke | 2862 | 5 | 4 | 1 |
| PenBBS | 2974 | 5 | 4 | 1 |
| Stipula | 2879 | 5 | 3 | 1 |
| Pineider | 2871 | 5 | 3 | 1 |

正文分别补充了品牌身份、系列／型号分层、版本差异、上墨与维护边界、购买验收、样本限定、图片证据和资料等级；没有把独立样本手感或相邻型号规格泛化到品牌页。

## Owned checkpoint

- 路径：`.planning/quick/260804-0zo-delike-duke-penbbs-stipula-pineider-owned-checkpoint/checkpoint/fpkg.db`
- 来源：Phase427 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256：`5f744663b94bfb28230440407a68ac76706ec391a0f287246ed9a6f28ab65c1c`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（应用前后不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673；approved reviews：2692
- 五个品牌均为 `published`，contract version 3，content hash 对应 fact、language、media、publication 四项审核。

## 验证结果

- `pnpm exec tsx --test tests/content/phase428-brand-depth-refresh.test.ts`：1 pass（约 36.8 s）。
- `pnpm exec biome check scripts/data/phase428-brand-depth-refresh.ts scripts/apply-phase428-brand-depth-refresh.ts tests/content/phase428-brand-depth-refresh.test.ts`：通过。
- `pnpm exec tsc --noEmit --pretty false`：需记录仓库既有基线错误；没有 Phase428 新错误。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、brand-identity blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4071、citations 11062、stories 718、events 876、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- Delike、Duke、PenBBS、Stipula、Pineider 的 published 型号反向导航数量与品牌归属数量一致；缺失 published reverse link：0。

## 边界

Phase428 只完成 checkpoint 中五个品牌页的内容深化与审核发布链路验证。全量内容修复、其它未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

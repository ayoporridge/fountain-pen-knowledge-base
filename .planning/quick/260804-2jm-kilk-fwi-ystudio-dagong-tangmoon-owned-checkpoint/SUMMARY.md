# Phase432 完成记录

## 内容包

已为以下五个既有品牌实体深化可发布的自然中文品牌导航正文，并保留 canonical identity、型号边界、可靠来源和原创事实图：

| 品牌 | published body 字符 | approved references | source independence groups | primary media |
| --- | ---: | ---: | ---: | ---: |
| Kilk | 3457 | 7 | 7 | 1 |
| Fine Writing International | 3355 | 5 | 4 | 1 |
| YSTUDIO | 3382 | 6 | 5 | 1 |
| 大公 Dagong | 3359 | 4 | 3 | 1 |
| 唐月 TangMoon | 3378 | 6 | 5 | 1 |

正文分别补充了品牌身份、型号树与版本边界、历史或项目时间窗口、材料与上墨、清洗维护、选购验收、样本范围和图片证据；没有把 Orient、Fenestro、Classic Revolve、Dagong 56 或 TangMoon E5 的单一型号规格泛化到全品牌，也没有新建重复型号。Kilk、Dagong、TangMoon 的来源标题改为 `原始来源`，以让正文解析器完整读取追加的品牌导航段落；来源链接仍保留在正文与 pack registry 中。

## Owned checkpoint

- 路径：`.planning/quick/260804-2jm-kilk-fwi-ystudio-dagong-tangmoon-owned-checkpoint/checkpoint/fpkg.db`
- 来源：Phase431 owned checkpoint，不是 `data/fpkg.db`
- checkpoint SHA-256：`cd1a9438c37987d885f91ba719e513dffe617db47f24755d1cba814b546e9142`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`（本轮应用前后不变）
- SQLite `PRAGMA integrity_check`：`ok`
- entities：981；public_entities：935；published publications：673；approved reviews：2692
- 五个品牌均为 `published`，contract version 3；每个品牌的 content hash 对应 fact、language、media、publication 四项审核。

## 验证结果

- `pnpm exec tsx --test tests/content/phase432-brand-depth-refresh.test.ts`：1 pass（约 38.3 s）。
- `pnpm exec biome check scripts/apply-phase432-brand-depth-refresh.ts scripts/data/phase432-brand-depth-refresh.ts tests/content/phase432-brand-depth-refresh.test.ts`：通过；Biome 配置仅纳入匹配的测试文件，脚本／data 已由 `tsx` 导入和定向测试覆盖。
- `pnpm exec tsc --noEmit --pretty false`：需记录仓库既有基线错误；仍为 `tests/content/phase346-jinhao-x450-x750.test.ts` 的两个 TS7022 与 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741，没有 Phase432 新错误。
- `git diff --check`：通过；Phase432 正文没有 `made_by`、`数据库`、`仓库` 禁用词。
- `pnpm exec tsx scripts/audit-entity-quality.ts --database-path <absolute checkpoint>`：通过；690 audited、668 active、22 retired excluded、duplicate groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- `pnpm exec tsx scripts/check-library-contract.ts --database-path <absolute checkpoint>`：通过；sources 2720、sourceItems 4463、claims 4071、citations 11062、stories 718、events 876、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4。
- Kilk、Fine Writing International、YSTUDIO、大公 Dagong、唐月 TangMoon 的 1 个 published 型号各有 1 条正确的 `made_by` 反向导航；缺失 published reverse link：0。

## 边界

Phase432 只完成 owned checkpoint 中五个已有品牌页的内容深化与审核发布链路验证。全量内容修复、其余未覆盖品牌／型号、正式迁移、Turso、生产部署、真人遍历和线上逐条复查仍未完成，不能据此调用 `update_goal({status:"complete"})`。

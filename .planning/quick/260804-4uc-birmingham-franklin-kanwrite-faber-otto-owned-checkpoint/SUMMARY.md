# Phase 443 摘要：五个品牌页深化

## 交付范围

本阶段只处理已有实体 Birmingham Pen Company、Franklin-Christoph、Kanwrite、Faber-Castell 与 Otto Hutt。正文分别补充品牌沿革、产品线边界、材料／finish、笔尖与上墨、维护、选购和后续研究入口；没有新增品牌或型号实体，也没有改变 canonical slug。

写入路径为 `checkpoint.db` owned copy。脚本沿用 `recordEntityContentReview` 的 fact/language/media 审核和 `publishEntity` 发布路径；脚本拒绝 remote 环境、符号链接和真实资料库路径，并在写入前后核验 catalog snapshot。

## 阶段证据

- 定向测试：`pnpm exec tsx --test tests/content/phase443-brand-depth-refresh.test.ts` 通过；1/1，约 38.5 秒。测试覆盖 remote 选择拒绝、五个 markdown 文件、审核—发布、primary media、型号反向导航、内容 hash、replay noop 与真实资料库快照不变。
- checkpoint SHA-256：`185963c96cd46c9d3bd863169aef57e2738af1d5a0b5b9388886e93141a25110`。
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，与阶段前一致；`PRAGMA integrity_check`：`ok`。
- 数据量：981 entities、935 public entities、673 published publications。

## 五个品牌回读

| brand | 正文字符 | approved refs | 独立来源组 | primary media | status | 已发布型号反向导航 |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Birmingham Pen Company | 3345 | 5 | 5 | 1 | published | 1/1 |
| Faber-Castell | 2970 | 5 | 5 | 1 | published | 8/8 |
| Franklin-Christoph | 3325 | 5 | 5 | 1 | published | 2/2 |
| Kanwrite | 2804 | 6 | 6 | 1 | published | 2/2 |
| Otto Hutt | 2993 | 5 | 5 | 1 | published | 4/4 |

内容质量审计：690 audited entities，668 active，22 retired lineage excluded；duplicate name groups 0、suspicious pen articles 0、thin brand/model entities 0、`made_by` blockers 0。

Library contract：sources 2720、sourceItems 4463、claims 4073、citations 11062、stories 718、events 877、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4，检查通过。

Biome 检查通过。全仓 TypeScript 仍只有既有基线 3 项错误：`phase346-jinhao-x450-x750.test.ts` 的两个 TS7022，以及 `sync-local-catalog-to-turso.test.ts` 缺少 `NODE_ENV` 的 TS2741；本阶段没有新增错误。`git diff --check` 在提交前复核。

## 未完成边界

Phase 443 只是五个已有品牌页的内容深化，不代表 Fountain Pen Knowledge Graph 全量目标完成。仍需继续处理剩余薄内容、缺失的重要品牌／型号、全站关系与媒体审计，随后才进行真实资料库正式迁移、全量自动检查、真人遍历、部署和线上逐条复查。

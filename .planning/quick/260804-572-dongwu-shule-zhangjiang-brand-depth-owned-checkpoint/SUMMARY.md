# Phase 444 摘要：东吴、书乐、长江品牌页深化

## 交付范围

本阶段只处理已有实体 DongWu、ShuLe 与 ZhangJiang 三个品牌。正文以 948、2398、988 三个已经存在的具体型号为导航入口，补足品牌身份边界、英文转写风险、相邻型号分流、旧笔核验、维护与选购建议；没有新建品牌或型号，也没有把相似名称合并。

来源层级保持克制：三页沿用 Phase 235 的白丁 Alan 具体型号评测和本站原创事实图；DongWu 与 ZhangJiang 增加 The Fountain Pen Network 中国品牌名录／索引，ShuLe 增加 FPN 的 2212 讨论，ZhangJiang 增加 Reddit 长江旧笔讨论。2212、Changjiang、Type 28 都只作相邻线索，未回填 2398／988 的规格、年代或制造者关系。

写入路径为 `checkpoint.db` owned copy。脚本沿用 `recordEntityContentReview` 的 fact/language/media 审核和 `publishEntity` 发布路径；脚本拒绝 remote 环境、符号链接和真实资料库路径，并在写入前后核验 catalog snapshot。

## 阶段证据

- 定向测试：`pnpm exec tsx --test tests/content/phase444-dongwu-shule-zhangjiang-brand-depth.test.ts` 通过；1/1，约 24.7 秒。测试覆盖 remote 选择拒绝、三份 markdown、审核—发布、primary media、型号反向导航、内容 hash、replay noop 与真实资料库快照不变。
- checkpoint SHA-256：`581e53e2fea17ac5e0e259092d74972235299c676f3c7f85ee291ce069974a0c`。
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，与阶段前一致；`PRAGMA integrity_check`：`ok`。
- 数据量：981 entities、935 public entities、673 published publications。

## 三个品牌回读

| brand | markdown 字符 | 发布正文字符 | approved refs | 独立来源组 | primary media | status | 已发布型号反向导航 |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| DongWu | 3506 | 2852 | 4 | 4 | 1 | published | 1/1 |
| ShuLe | 3521 | 2694 | 4 | 4 | 1 | published | 1/1 |
| ZhangJiang | 3503 | 2648 | 5 | 5 | 1 | published | 1/1 |

实体质量审计：690 audited entities，668 active，22 retired lineage excluded；duplicate name groups 0、suspicious pen articles 0、thin brand/model entities 0、`made_by` blockers 0。

Library contract：sources 2724、sourceItems 4467、claims 4080、citations 11069、stories 718、events 877、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2406、commonsMedia 4，检查通过。

Biome 检查通过。全仓 TypeScript 仍只有既有基线 3 项错误：`phase346-jinhao-x450-x750.test.ts` 的两个 TS7022，以及 `sync-local-catalog-to-turso.test.ts` 缺少 `NODE_ENV` 的 TS2741；本阶段没有新增错误。`git diff --check` 通过。

## 未完成边界

Phase 444 只是三个已有小众品牌页的内容深化，不代表 Fountain Pen Knowledge Graph 全量目标完成。仍需继续处理剩余薄内容、缺失的重要品牌／型号、全站关系与媒体审计，随后才进行真实资料库正式迁移、全量自动检查、真人遍历、部署和线上逐条复查。

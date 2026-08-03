# Phase 445 摘要：Postal、Nakaya、Morrison 品牌页深化

## 交付范围

本阶段只处理已有实体 Postal Pen Company、Nakaya 与 Morrison 三个品牌。正文分别补足邮购／透明储墨、手工漆艺命名层、纽约早期与战时 Patriot 的品牌导航；没有新增品牌或型号，也没有把 Sager、Roxy、相邻笔形、军种版本或订单选项错误合并。

来源层级沿用既有包：Postal 使用 PenHero、Antique Digger、OneBid、World Radio History 与原创图；Nakaya 使用官方品牌入口、尺寸表、订单、维修和公告；Morrison 使用 Morse Museum、FountainPen.it、PenHero、Munson Pens、Peyton Street Pens、Vintage Pen Doctor 与原创图。

写入路径为 `checkpoint.db` owned copy。脚本沿用 `recordEntityContentReview` 的 fact/language/media 审核和 `publishEntity` 发布路径；脚本拒绝 remote 环境、符号链接和真实资料库路径，并在写入前后核验 catalog snapshot。

## 阶段证据

- 定向测试：`pnpm exec tsx --test tests/content/phase445-postal-nakaya-morrison-brand-depth.test.ts` 通过；1/1，约 26.5 秒。测试覆盖 remote 选择拒绝、三份 markdown、审核—发布、primary media、型号反向导航、内容 hash、replay noop 与真实资料库快照不变。
- checkpoint SHA-256：`69d0b5d4e0793150b7e5212a9f9d6923d978281234f41ca1975e9cea28b95b00`。
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，与阶段前一致；`PRAGMA integrity_check`：`ok`。
- 数据量：981 entities、935 public entities、673 published publications。

## 三个品牌回读

| brand | markdown 字符 | 发布正文字符 | approved refs | 独立来源组 | primary media | status | 已发布型号反向导航 |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Postal Pen Company | 3843 | 2631 | 5 | 5 | 1 | published | 1/1 |
| Nakaya | 3500 | 2697 | 4 | 3 | 1 | published | 4/4 |
| Morrison | 3981 | 2702 | 6 | 6 | 1 | published | 1/1 |

实体质量审计：690 audited entities，668 active，22 retired lineage excluded；duplicate name groups 0、suspicious pen articles 0、thin brand/model entities 0、`made_by` blockers 0。

Library contract：sources 2724、sourceItems 4467、claims 4084、citations 11070、stories 718、events 877、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2405、commonsMedia 4，检查通过。

Biome 检查通过。全仓 TypeScript 仍只有既有基线 3 项错误：`phase346-jinhao-x450-x750.test.ts` 的两个 TS7022，以及 `sync-local-catalog-to-turso.test.ts` 缺少 `NODE_ENV` 的 TS2741；本阶段没有新增错误。`git diff --check` 通过。

## 未完成边界

Phase 445 只是三个已有历史／手工品牌页的内容深化，不代表 Fountain Pen Knowledge Graph 全量目标完成。仍需继续处理剩余薄内容、缺失的重要品牌／型号、全站关系与媒体审计，随后才进行真实资料库正式迁移、全量自动检查、真人遍历、部署和线上逐条复查。

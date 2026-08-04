---
status: complete
---

# Phase 468：深化 Waterman Commando、Patrician、Taperite 结果

## 结果

- 深化三个已有 Waterman canonical 型号：Commando、Patrician、Taperite；没有创建重复实体，也没有把 Hundred Year、Lady Patricia、Parker 51 或 C/F 的资料合并进来。
- 正文补足战时／装饰艺术／战后产品线的历史边界、材料与尖端证据、版本识别、试写记录、维修风险、选购字段和图片证据规则。
- 复用 Phase 160 的 Waterman 官方 heritage／care、Vintage Pens、Fountain Pen Network、Azahara、Pencil Ponder、PM Pens 与 Fountain Pen IT 来源；每页继续使用原有原创 factual SVG，明确非产品照片。

## Checkpoint 与数据库保护

- owned checkpoint：`.planning/quick/260804-daz-phase-468-deepen-existing-waterman-comma/checkpoint.db`
- 应用后 SHA-256：`ed5f00553978c0ffd384b06b24def32acc1b63c283e4a94cedb865264409ee23`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；阶段前后保持不变。
- `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：无记录。

## 发布回读

| 型号 | entity id | 正文 | approved refs | primary media | publication | content hash |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Waterman’s Commando | `XFAIQh9DFHy5` | 2887 | 6 | 1 | published | `sha256:v3:68a2ba2a1f2ab444f3d0a2d3796837e3e16a6703c55e3ac8441fc7cee996d6fa` |
| Waterman’s Patrician | `L7-9RXn0xgQr` | 2992 | 6 | 1 | published | `sha256:v3:c737f5b1306002a3bd08fce1028daf442940c573e6676af9167ca3226fa33563` |
| Waterman’s Taperite | `tjNAIANBlu4H` | 2921 | 6 | 1 | published | `sha256:v3:e3dc0b4d7386037310eca43132019721fe040453e3171664658a76daca6310f8` |

三个型号均保持恰好一条 Waterman `made_by` 和一条 `reverse` 导航；fact/language/media/publication review、contract version 3 和 approved hash 一致，readiness blocker 均为 0、publishable 均为 1。首次 apply 三个实体均 `published`；第二次 replay 三个实体均 `noop`。

## 审计证据

- 定向测试：`pnpm exec tsx --test tests/content/phase468-waterman-commando-patrician-taperite-depth.test.ts`，1/1 通过，约 36 秒。
- Library contract：通过。计数为 sources 2734、sourceItems 4478、claims 4483、citations 11466、stories 718、events 957、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2405、commonsMedia 4。
- Entity quality audit：690 entities，668 active，22 retired lineage excluded；duplicate name groups 0、suspicious pen articles 0、thin entities 0、made_by blockers 0。
- Readiness/coverage：inventory 690（brand 119／pen 571）、content_ready 668、published/public 668、published blockers 0、backlog 22；此次目标页均已 ready/public。
- `tsc --noEmit` 仍只有既有基线的 3 个错误：Phase 346 Jinhao 测试两个 TS7022，以及 Turso migration 测试缺少 `NODE_ENV` 的 TS2741；没有 Phase 468 新错误。
- Biome 定向检查与 `git diff --check` 通过。

## 未完成边界

本阶段只深化三个 Waterman 历史型号，未迁移真实资料库，未完成其余品牌／型号的全量内容修复、正式 Turso 迁移、全站真人遍历、生产部署和线上逐条复查；长期全量 goal 继续保持 active。

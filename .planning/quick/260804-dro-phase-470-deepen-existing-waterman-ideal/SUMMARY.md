---
status: complete
---

# Phase 470：深化 Waterman Ideal No. 52、No. 7 结果

## 结果

- 深化两个已有 Waterman canonical 型号：Ideal No. 52、Ideal No. 7；没有创建重复实体，也没有把 52V、No.5、Ink‑Vue No.7、Patrician 或 Hundred Year 的资料合并进来。
- 正文补足编号体系、boxed lever、硬橡胶／Ripple／overlay／celluloid、彩色笔尖／casein／color disk、维修风险、样本证据、选购路径和图片边界。
- 复用 Phase 162 的 Waterman 官方 heritage、Richard’s Pens 型号档案与 USPTO boxed-lever 专利；每页继续使用原有原创 factual SVG，明确非产品照片。

## Checkpoint 与数据库保护

- owned checkpoint：`.planning/quick/260804-dro-phase-470-deepen-existing-waterman-ideal/checkpoint.db`
- 应用后 SHA-256：`72e49116d176a032992a16c9c82fc972a4c99dadd27fb8272094c9d838c5d46b`
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；阶段前后保持不变。
- `PRAGMA integrity_check`：`ok`；`PRAGMA foreign_key_check`：无记录。

## 发布回读

| 型号 | entity id | 正文 | approved refs | primary media | publication | content hash |
| --- | --- | ---: | ---: | ---: | --- | --- |
| Waterman’s Ideal No. 52 | `AqN2ex1B7A2S` | 3087 | 4 | 1 | published | `sha256:v3:ff507ca6602ec286f0798560a05ebe55a1abcf7e82a136a21267caf69c7d04ec` |
| Waterman’s Ideal No. 7 | `LABL8G83Je3e` | 3117 | 4 | 1 | published | `sha256:v3:ce7ed24c4737e7a6303215c04341316a337a8bb41299a3529c060cc7e3119847` |

两个型号均保持恰好一条 Waterman `made_by` 和一条 `reverse` 导航；fact/language/media/publication review、contract version 3 和 approved hash 一致，readiness blocker 均为 0、publishable 均为 1。首次 apply 两个实体均 `published`；第二次 replay 两个实体均 `noop`。

## 审计证据

- 定向测试：`pnpm exec tsx --test tests/content/phase470-waterman-ideal-no52-no7-depth.test.ts`，1/1 通过，约 26 秒。
- Library contract：通过。计数为 sources 2734、sourceItems 4478、claims 4511、citations 11494、stories 718、events 962、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2405、commonsMedia 4。
- Entity quality audit：690 entities，668 active，22 retired lineage excluded；duplicate name groups 0、suspicious pen articles 0、thin entities 0、made_by blockers 0。
- Readiness/coverage：inventory 690（brand 119／pen 571）、content_ready 668、published/public 668、published blockers 0、backlog 22；此次目标页均已 ready/public。
- `tsc --noEmit` 仍只有既有基线的 3 个错误：Phase 346 Jinhao 测试两个 TS7022，以及 Turso migration 测试缺少 `NODE_ENV` 的 TS2741；没有 Phase 470 新错误。
- Biome 定向检查与 `git diff --check` 通过。

## 未完成边界

本阶段只深化两个 Waterman 早期编号型号，未迁移真实资料库，未完成其余品牌／型号的全量内容修复、正式 Turso 迁移、全站真人遍历、生产部署和线上逐条复查；长期全量 goal 继续保持 active。

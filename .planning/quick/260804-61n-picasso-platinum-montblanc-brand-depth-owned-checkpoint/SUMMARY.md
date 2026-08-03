# Phase 447：Picasso、Platinum、Montblanc 品牌页深化结果

## 结果

- 三个已有品牌实体均在 owned checkpoint 中完成正文、来源、时间线和导航刷新；没有新建重复实体，也没有改写受保护的 Montblanc Writers Edition quick 目录。
- Picasso 品牌正文 2663 字符，Platinum 2612 字符，Montblanc 2724 字符；三页的研究文件均超过 3500 字符，并保留官方、档案或专业资料的来源层级。
- apply 通过 `recordEntityContentReview` 的 fact/language/media 审核后调用 `publishEntity`；没有直接写入 published 状态。

## Checkpoint 与数据库保护

- owned checkpoint：`.planning/quick/260804-61n-picasso-platinum-montblanc-brand-depth-owned-checkpoint/checkpoint.db`
- 应用后 SHA-256：`33d5aacfd1e9b4e1b058af75e9895de5d95b98aa10a8beba023a141a6c5ca8fa`
- 真实资料库 SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，阶段前后不变。
- `PRAGMA integrity_check`：`ok`。

## 发布回读

| 品牌 | entity id | 正文 | approved refs | 独立来源组 | primary media | publication |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Picasso | `5zbJPFGxfCXu` | 2663 | 6 | 6 | 1 | published |
| Platinum | `e51tJpejEkXY` | 2612 | 6 | 5 | 1 | published |
| Montblanc | `CJM8uLY0LmIX` | 2724 | 8 | 4 | 1 | published |

每个品牌现有已发布 `made_by` 型号的品牌反向导航均恰好一条；三项内容审核和 publication review 均为 approved，content revision 与 reviewed revision、contract version 3 和 approved hash 一致。

首次 apply 返回三个 `published`，内容 hash 分别为：

- Picasso：`sha256:v3:f2d7a109a707fb9c7524ab4aed70637ac3a7280c318c45d150274a37b92f31bf`
- Platinum：`sha256:v3:789d4637539220949f9c675dcb339ac5fb3df2e28bab18566dff380b123ec554`
- Montblanc：`sha256:v3:99ca65cc40217b07f6cbe4bc39903c062801b0017f128723e48c334c11df59b1`

第二次 replay 三个实体全部返回 `noop`。

## 审计证据

- 定向测试：`pnpm exec tsx --test tests/content/phase447-picasso-platinum-montblanc-brand-depth.test.ts`，1/1 通过。
- Entity quality audit：690 entities，668 active，22 retired lineage excluded；duplicate name groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- Library contract：通过。计数为 sources 2728、sourceItems 4472、claims 4102、citations 11086、stories 718、events 893、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2405、commonsMedia 4。
- Library coverage diagnostic：brands 115/119 ready、4 gaps；models 553/571 ready、16 gaps；诊断平均均为 97/100。剩余 gap 属于全量目标的后续工作，不能由本阶段代替。
- Biome 与 `git diff --check` 通过。`tsc --noEmit` 仍只有既有基线的 3 个错误：Phase 346 Jinhao 测试两个 TS7022，以及 Turso migration 测试缺少 `NODE_ENV` 的 TS2741。

## 未完成边界

本阶段只完成三个品牌页的可追溯深化，未迁移真实资料库，未完成 4 个品牌 gap、16 个型号 gap、全量公开页面真人遍历、正式部署与线上逐条复查；长期全量 goal 继续保持 active。

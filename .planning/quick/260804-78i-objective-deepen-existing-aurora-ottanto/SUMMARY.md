# Phase 452 验收摘要

## 结果

- 在 Phase 451 owned checkpoint 上深化三个既有 canonical 型号：Aurora Ottantotto Millerighe 801 `phase336-pen-aurora-ottantotto-millerighe`、Aurora Ipsilon Italia B17-A `phase338-pen-aurora-ipsilon-italia`、Montegrappa Elmo 01 `phase85-pen-montegrappa-elmo-01`。
- 复用 Aurora 官方商品/系列/目录/历史与 FountainPen.it、Pen-House/Vecchietti，以及 Montegrappa 官方商品/目录/历史与 Pen Chalet；Elmo 01 额外把官方历史 source 明确加入型号 pack 后通过 source 合同。
- 三份研究正文总字符数分别为 Millerighe 3537、Ipsilon Italia 3536、Elmo 01 3754；发布后的 `body_md` 分别为 2883、2909、2957 字符。
- 三个型号均保持一个 `made_by` 与一个品牌反向 `reverse`，每页 5–6 条 approved references、至少 3 组独立来源、1 个 approved primary media；publication 均为 `published`。

## 应用与回放

首次 apply：

- Aurora Ottantotto Millerighe：`sha256:v3:f93f0949eb8be72ab2a19f32690b7c2fa2025eee422b064581b7303d6d72d0eb`
- Aurora Ipsilon Italia：`sha256:v3:28f25237600414033efbeb9a1cf69a54ab551ccd366cdaba8a0cf3a83a12b67b`
- Montegrappa Elmo 01：`sha256:v3:44aa0248eb46d72c299cd503aa8bcf012744245f7048c6bfc0e7a9793eed86b9`

同一命令 replay 三项均为 `noop`。apply 只在独立 checkpoint copy 中进行，使用 `recordEntityContentReview` 的 fact/language/media 审核与 `publishEntity` 发布；没有直接写 publication 状态。

## 验收证据

- 定向测试：`tests/content/phase452-aurora-montegrappa-model-depth.test.ts` 通过；测试曾捕获并修复 Elmo 01 history source 未进入 model pack 的合同问题。
- `PRAGMA integrity_check`：`ok`。
- quality audit：690 entities；668 active；22 retired lineage excluded；duplicate name groups 0；suspicious pen articles 0；thin brand/model entities 0；made_by blockers 0。
- library contract：sources 2732、sourceItems 4476、claims 4182、citations 11165、stories 718、events 909、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2405、commonsMedia 4；`Library contract OK`。
- Biome 定向检查与 `git diff --check` 通过。
- `tsc --noEmit` 仍只有既有基线的 3 个错误：Phase346 Jinhao 测试 2 个 TS7022、Turso migration 测试 1 个 TS2741；本阶段没有新增 TypeScript 错误。
- 真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；Phase452 checkpoint SHA-256 为 `b66bd22142f0410dbda06cc40005a42553b01aeda43cefee05ada59fbeca36ef`。

## 文件边界

本阶段拥有的代码与测试为：

- `scripts/data/phase452-aurora-montegrappa-model-depth.ts`
- `scripts/apply-phase452-aurora-montegrappa-model-depth.ts`
- `tests/content/phase452-aurora-montegrappa-model-depth.test.ts`
- 三份既有 Aurora/Montegrappa 研究正文与本目录的 `PLAN.md` / `SUMMARY.md`

其他未跟踪 research、`.next-phase*` 目录、旧 quick 目录和真实数据库均未删除、未提交、未写入。

# Phase 491 Plan: deepen Eversharp representatives

## Goal

在不新增实体、不触碰真实 `data/fpkg.db` 的前提下，深化已有 canonical 的 The Eversharp Envoy、The Eversharp Coronet 与 The Eversharp Bantam。每页补充可核查的历史、机构、版本、维护、选购和来源，并通过既有审核—发布链路写入 caller-owned checkpoint copy。

## Scope and ownership

- Owned content: 三份 Phase 491 research markdown、`scripts/data/phase491-eversharp-depth.ts`、`scripts/apply-phase491-eversharp-depth.ts`、`tests/content/phase491-eversharp-depth.test.ts` 及本 quick 目录的计划／总结文件。
- Protected: `data/fpkg.db`、他人未跟踪的 research、`.next-phase*` 与 `260719-665-montblanc-writers-edition-patron-of-art-` 等既有 checkpoint。
- Reuse: Phase 169 Envoy/Coronet 与 Phase 190 Bantam canonical identity、现有原创 factual SVG；不创建 duplicate 实体或新图片。

## Tasks

1. [ ] 核对 Envoy、Coronet、Bantam 既有身份和来源；确认官方历史、PenHero、Vintage Pens、FountainPen.it、Collectors Weekly、Peyton Street 等来源的作用域。
2. [ ] 写三份自然中文 research 正文，并通过 refresh 型 `CuratedEntityPack` 合并新来源、claims、spec evidence、variants 与 timeline。
3. [ ] 在 caller-owned checkpoint copy 迁移 032，运行首次 apply、审核三项、`publishEntity`，再 replay 验证 noop；运行定向测试。
4. [ ] 运行 integrity/FK、library contract、质量审计、targeted Biome、TypeScript baseline 与 staged diff 检查；只提交本批文件。

## Verification contract

- 每份正文总长至少 3,600 字符、`body_md` 至少 2,800 字符，且不含 `made_by`、`数据库`、`仓库` 等实现词。
- 三个 target identity 保持 `pen` 类型、原 slug、单一 Eversharp `made_by` 与反向导航；每个拥有至少 5 条 approved references、1 张 approved primary SVG。
- 每个 target 的 fact/language/media/publication review 均 approved，publication revision/hash 对齐，首次 apply 后 replay 全部 noop。
- 真实目录快照前后完全不变；全局 quality/library 检查不得引入 duplicate、broken link 或 public blocker。

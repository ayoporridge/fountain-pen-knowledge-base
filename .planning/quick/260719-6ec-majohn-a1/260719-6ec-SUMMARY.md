---
phase: quick
plan: 260719-6ec
status: complete
completed_at: 2026-07-19T04:55:19+08:00
---

# Quick Task 260719-6ec Summary

## Outcome

- 新增 Majohn 品牌正文与既有 A1 正文的类型化内容包；Majohn／Moonman 只保留为一个品牌谱系，A1 只有一条 canonical `made_by` 指向 Majohn。
- A1 的带夹、无夹、EF 与 F 作为四个版本维度写入；F 只从 2024 年零售证据起算，不倒填到首批 A1。
- 品牌和 A1 分别使用两张不同的 `site-original` 主图，均以自然中文明确标注为本站原创编辑插画（AI 辅助制作）、非实物照片、不代表具体配色或生产批次；旧 TTpen 零售图不再作为 A1 主图。
- 从 Phase 22 提取了一个接受 pack 列表的薄通用导出，Montblanc 原入口继续委托该导出；Majohn 入口没有复制应用器或新增 runner。
- owned checkpoint 副本内 Majohn 与 A1 均可发布，品牌公开型号集合精确包含 A1；重复应用返回两个 `noop`。

## Scope boundary

- 未打开写客户端连接到 `data/fpkg.db`；迁移与应用只发生在 `copyCheckpointedCatalogToDisposableCopy` 创建的 caller-owned 副本，测试结束再次核验真实 main／WAL／SHM 快照未变。
- Pilot 维护说明只在 A1 正文中作为同类伸缩机构参考，没有作为 Majohn 官方来源写入结构化来源关系。
- 外部页面没有伪装成冻结存档：`archiveLocator` 明示 `live-source-not-frozen`、`external_archive=false` 与 `raw_source_stored=false`；未暴露 `.planning` 路径。
- 未触碰生产、部署、搜索、LLM、Playwright 或其他内容批次。

## Verification

- `pnpm exec tsx --test tests/content/phase22-montblanc.test.ts tests/content/phase23-majohn.test.ts` — 2 passed, 0 failed
- `pnpm exec tsc --noEmit --pretty false` — passed
- Biome — included test file plus three config-excluded script files分别通过 scoped／stdin check
- `pnpm build` — passed；18 个静态页生成完成

## Residual risk

- 本批外部证据使用诚实的 live-source locator，而不是不可变的第三方网页快照；来源页面未来可能发生漂移或下线，后续可补 Common Crawl／Internet Archive locator，但不影响本批对“未存档”的明确披露。
- 两张主图是编辑示意图，不可用于判断实物颜色、饰件、尺寸比例或具体批次。

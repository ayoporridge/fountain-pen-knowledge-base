---
phase: 424
status: complete
created: 2026-08-03
---

# Phase 424：Faber-Castell 普通 Fine Writing 深化

## 目标

在 owned checkpoint copy 中深化已有 Faber-Castell 品牌页及 Ambition、e-motion、Ondoro、NEO Slim、LOOM 五个型号。修正文案、官方 SKU 来源、材料/颜色 variant、维护和选购边界；不新增重复实体，不触碰 Graf von Faber-Castell Classic。

## 执行清单

1. 用 Phase 58 的现有实体和原创 factual SVG 作为基线，载入五份 Phase 424 正文。
2. 追加官方产品页、产品目录、press note、说明书及有限的专业二级资料，确保每个型号至少八个独立来源组。
3. 通过既有 `entity_links`、`recordEntityContentReview`、`publishEntity` 路径修正品牌关系并发布到 checkpoint copy。
4. 首次 apply 后执行身份、正文、规格证据、来源、媒体、审核 hash、publication/readiness 检查；重放必须为 `noop`。
5. 运行定向测试、Biome、TypeScript 和 diff 检查；只暂存 Phase 424 明确拥有的文件并提交。

## 安全边界

- 真实 `data/fpkg.db` 仅作只读 protected catalog，所有试验写入都在 disposable owned copy。
- 不使用 Turso/远程环境变量，不改搜索、LLM、Playwright 或通用验收基础设施。
- 保留其他 agent 的 research、`.next-phase*` 和既有 quick checkpoint；提交前逐项检查 `git status --short`。

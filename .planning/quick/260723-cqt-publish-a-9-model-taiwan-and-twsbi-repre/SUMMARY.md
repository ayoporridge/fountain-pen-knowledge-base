---
quick_id: 260723-cqt
status: complete
completed: 2026-07-23
product_commit: 2ac1947
---

# Phase 141 summary: Taiwan and TWSBI representative batch

本批在不触碰真实 `data/fpkg.db` 的前提下，完成了 8 个型号内容包：YSTUDIO Classic Revolve、Laban 325、Fine Writing International Fenestro、Opus 88 Omar、TWSBI Swipe、IWI Laureate、标准 TWSBI Diamond 580，以及 TWSBI Diamond 580ALR；同时新增 4 个有明确来源的品牌导航页。既有 Opus 88 与 TWSBI 品牌 ID 被保留，新增型号只通过型号 payload、当前 hash 审核与 `publishEntity` 发布，不把已有品牌页作为“带型号写入”的副作用重写。

## 身份与边界

- `V9IvGskSYan0` 原混名 `三文堂-twsbi-580-580al` 原位收束为标准 `twsbi-diamond-580`，保留 stable ID、建立旧路径永久跳转，并另建独立 580ALR sibling；没有复制第二个标准 580。
- Cypress Crown Mini 被明确拒绝：现有展会与 Pai Pen Pro 资料能命名候选，却不能证明 Mr. Cypress 是制造者，因此没有创建实体、品牌关系或媒体。
- 每个发布页均有自然中文正文、规格/历史或来源窗口、版本边界、维护与选购提示、来源化 claims、独立 factual SVG；SVG 明确是 non-photo、non-logo、not-to-scale、non-colour-proof。

## 验证

- owned checkpoint copy 定向 TAP：1/1 通过；首轮返回 12 个发布结果（4 个新品牌 + 8 个型号），重放全部 `noop`。
- 检查覆盖：空 reviewer、remote selector、保护库快照、当前 hash 的 fact/language/media/publication reviews、品牌/型号关系、580 原位 identity、580ALR sibling 与 legacy redirect。
- `pnpm exec tsc --noEmit --pretty false`、owned Phase 141 Biome、`xmllint` 全部 SVG、`git diff --check` 均通过。
- 真实库 SHA-256 仍为 `85015867a0e144cfe8cfa7ad5670a3813220209a0e2c63265b072eac18a385dc`；没有正式迁移或远程写入。

## 产品提交

`2ac1947 feat(content): publish Taiwan and TWSBI representative batch`，只包含本批 31 个产品文件。该提交是局部内容批次，不代表全站内容 goal 完成。

## 范围边界

全量目标仍未完成：尚未完成所有品牌/型号审计、正式真实库迁移、全站自动检查、真人遍历、部署和线上逐条复查。下一批应继续从既有研究矩阵中选择同一品牌或同一来源族的缺口，复用本批的来源闭包与 model-only 发布路径。

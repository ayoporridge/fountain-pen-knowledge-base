# Phase 233：BanJu 与 ShangHai 空品牌壳退休

## 结论

这一步不是把两个真实型号“删掉”，而是把没有可验证型号的遗留品牌占位从公开品牌路由中撤下。

- `半句 (BanJu)`（`banju`，实体 `S3JHYQtqJExx`）只有一篇已经标记为 `deprecated` 的研究占位文章，没有 `pen`、`nib` 或任何有效的型号关系。
- `上海 (ShangHai)`（`shanghai`，实体 `uppuHJzvuw5k`）没有型号、nib、文章反向关系或任何 `entity_links`。
- 两者都没有足够的品牌目录、产品页或专业档案来支持一个自然中文品牌页，更不能用空壳摘要充当品牌内容。

## 处理边界

保留实体行和 taxonomy ledger，避免破坏历史引用；将品牌 publication 标记为 `retired`，清除可能存在的关系，并为 `/brand/banju` 与 `/brand/shanghai` 建立 `hard_404`。不创建宽泛跳转，也不把旧研究文章提升为公开页面。

这两个品牌与 `东吴`、`书乐`、`长江` 不同：后三者各自仍有具体 pen 实体和白丁 Alan 评测入口，因此继续留在研究 backlog，不能因为资料少就退休。

## 核验来源

本动作依赖 checkpoint copy 的实体、关系、publication 和 story 状态核验；没有把网络搜索结果当作“品牌不存在”的证明。若未来出现品牌目录、型号目录或可独立复核的实物档案，应通过新的 identity action 恢复／重建 canonical brand，而不是复用当前 hard-404 路由。

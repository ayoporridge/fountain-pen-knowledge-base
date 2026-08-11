---
status: complete
quick_id: 260811-auq
scope: offline-only
---

# 离线 canonical checkpoint production build 与全站遍历

Phase 582 最新 owned checkpoint 已通过 Next.js production build；现有 `article-quality` 契约在本地 production server 上 2/2 通过。sitemap 共 1,071 条唯一公开路由：670 个型号、115 个品牌、255 篇文章，以及分类、专题、概念和静态入口，均已进入逐路由请求。

高并发遍历中只有 8.37 MB 的 `/library/sources` 超过单请求 30 秒；空闲状态单独复测为 200、0.861601 秒，因此它是并发压力边界，不是坏路由。站内静态图片实际请求 790 个变体；外部 image-proxy 变体不继续逐张等待 CDN，而交给仓库既有媒体审计。

本轮找到两个真实前台问题：

- 195 个已发布实体正文仍含 `## model_specs` 与 JSON 代码块，其中 180 个型号已有独立结构化规格行，15 个品牌本就不应带型号规格块。
- 800 个公开实体使用 `site-original` 主图；品牌／型号档案 renderer 把这个内部许可 slug 原样显示给读者。

这两项已转入独立定向内容修复与 renderer 回归。真实 `data/fpkg.db` SHA-256 始终为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；没有 Turso 请求或真实数据库写入。本 quick 只是离线验收与问题定位，不代表全量 goal 完成。

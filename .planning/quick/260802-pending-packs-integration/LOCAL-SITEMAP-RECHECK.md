# Local public sitemap recheck

## Scope

在正式本地库 `data/fpkg.db` 完成迁移后，用已构建的 Next standalone 应用在本机启动，只复查 sitemap 中的公开 URL；这不是生产线上验收，也没有使用 Playwright 或新增通用验收框架。

## Result

- `GET /sitemap.xml`: HTTP 200，174,832 bytes，921 个公开 URL。
- 921 个 URL 的并发 HTTP 复查：920 个 HTTP 200；第一次冷启动时 `/library/sources` 超时 1 次。
- 对 `/library/sources` 以 30 秒超时重试：HTTP 200，4,829,493 bytes。
- 重点品牌和型号页面均返回 HTTP 200：Pilot Custom URUSHI、Pilot、Wancher、Waterman、Visconti、Aurora、SCRIBO、Sailor。
- 重点页面响应体均非空；没有因远端重复 story 或 primary media 触发的 cardinality 错误日志。

## Boundary

这是本地正式库的静态页面复查。生产部署、生产 sitemap 全量请求和真人逐页复查仍待 Fly 登录后执行。

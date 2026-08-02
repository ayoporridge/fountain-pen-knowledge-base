# Vercel online sitemap recheck

## Scope

2026-08-03 对当前公网 `https://fountain-pen-graph.vercel.app` 做一次 sitemap 全量 HTTP 读检查。它用于记录现有 Vercel 线上状态，不等同于待执行的 Fly 生产部署；没有写数据库，也没有新增 Playwright/通用验收框架。

## Result

- `GET /sitemap.xml`：HTTP 200，174,832 bytes，921 个公开 URL。
- 首轮有界遍历（8 并发、每路 25 秒、最多 2 次重试）：919 个 HTTP 200，2 个 HTTP 500，均为聚合页 `/library` 与 `/library/sources`；没有小于 500 bytes 的成功响应。
- 延长超时复核：`/library` HTTP 200、70,425 bytes（90 秒上限）；`/library/sources` HTTP 200、4,902,482 bytes（120 秒上限）。因此 921 个 sitemap URL 最终均可达，聚合页属于慢/冷启动风险，不应在短超时首轮被误判为稳定 500。
- `/pen/pilot-custom-urushi` HTTP 200、81,918 bytes，页面含 `Pilot Custom URUSHI` 与 `FKV-88SR`；`/brand/pilot` HTTP 200、133,633 bytes。
- 重点成功页面与两个聚合页响应体没有出现 `Application error`、`SQLITE`、`invalid-story-cardinality` 或 `invalid-primary-media-cardinality` 标记。

## Boundary

这是当前 Vercel 线上版本的 HTTP 复查。Fly 认证仍未完成，Fly 部署、部署后 sitemap 遍历、真人逐页浏览和线上逐条复查仍是未完成工作。

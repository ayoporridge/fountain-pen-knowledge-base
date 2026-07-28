---
name: Diplomat current catalogue phase 329
status: complete
completed: 2026-07-28
---

# Phase 329 完成摘要

## 完成内容

- 新增 Diplomat Nexus、CLR、Esteem、Traveller 四个型号内容包，复用现有 Diplomat 品牌实体。
- 每个型号补齐自然中文正文、规格、上墨、维护、选购、版本差异、身份边界和来源。
- 官方当前商品/集合/服务资料与专业二手资料交叉记录；颜色、饰件和尖幅保持 variants，不重复建基础实体。
- 为四个型号增加本站原创 factual SVG，并明确非产品照片、非 Logo、非比例图、非颜色校样边界。
- apply 脚本使用既有 `recordEntityContentReview` 与 `publishEntity` 路径，不绕过 publication guard；修正四个型号的 `made_by` 与品牌反向导航。

## 验证证据

- `pnpm exec tsx --test tests/content/phase329-diplomat-current.test.ts` 通过（owned disposable checkpoint，含 remote-env 拒绝、迁移、发布、来源/媒体/拓扑、重放 noop 和真实库快照不变）。
- `pnpm exec biome check scripts/data/phase329-diplomat-current.ts scripts/apply-phase329-diplomat-current-content.ts tests/content/phase329-diplomat-current.test.ts` 通过。
- `pnpm exec tsc --noEmit --pretty false` 通过。
- `git diff --check` 通过。

## 迁移边界

本 quick 只完成 checkpoint 验证；Phase 329 尚未正式写入真实 `data/fpkg.db`，也未作为全量 goal 完成证据。真实数据库、线上部署和其他 agent 的未跟踪 research/`.next-phase*`/受保护 quick 目录均未改动。

# Phase 421 checkpoint summary

## 结果

- 目标实体：`phase283-pelikan-m805` / `pelikan-souveran-m805`
- 内容包：`phase421-pelikan-m805-refresh-v1`
- 首次 checkpoint apply：`published`
- replay：`noop`
- 内容 hash：`sha256:v3:5b5d544aad39f03105b57d9d6713bbfb36ece396d4467b312d73edd43037f21d`
- 定向测试：`1/1` 通过，约 `102.0s`（最终回归）

## 内容与关系读回

- 正文：8,006 Unicode 字符
- 来源：16 条，14 个 independence groups
- variants：14 个（edition_group 7、color 3、nib 4；父子关系 7）
- primary media：1，复用既有 M805 factual SVG
- `made_by`：M805 → Pelikan 1 条；品牌 `reverse` → M805 1 条
- spec：Pelikan 品牌、18K/750 全铑尖、差动活塞、树脂/cellulose acetate 与钯色饰件、141 mm/13 mm、29.3 g、M805 状态均有回读值

## 发布门禁读回

- `entity_publications.status = published`
- `content_revision = reviewed_content_revision = 298`
- `reviewed_contract_version = 3`
- fact/language/media/publication reviews：当前内容 hash 均 `approved`
- `public_entity_readiness`：`blocker_count = 0`、`publishable = 1`
- `PRAGMA integrity_check`：`ok`

## 真实资料库保护证据

- 试验副本：`.planning/quick/260803-u6f-pelikan-m805-refresh-owned-checkpoint/checkpoint-final/fpkg.db`
- 真实 `data/fpkg.db` apply 前后 SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`
- 最终读回时真实库 WAL/SHM sidecar 均不存在（所有 checkpoint 客户端已关闭）；未向真实库执行写入。

## 代码与检查

- 定向测试通过；Biome check 通过；`git diff --check` 通过。
- `pnpm exec tsc --noEmit` 仅剩仓库既有 3 个 baseline diagnostics（phase346 两个 TS7022、Turso migration test 一个 TS2741），无 Phase 421 新增诊断。

# Phase 420 checkpoint summary

## 结果

- 目标实体：`2muSiS2rOSd7` / `pelikan-souveran-m815-metal-striped`
- 内容包：`phase420-pelikan-m815-refresh-v1`
- 首次 checkpoint apply：`published`
- replay：`noop`
- 内容 hash：`sha256:v3:7b1c5a465968dde5fe8a0c8309f945d23ee3b143fa477b14c6c85f883a7ad42e`
- 定向测试：`1/1` 通过，约 `95.3s`

## 内容与关系读回

- 正文：8,270 Unicode 字符
- 来源：16 条，13 个 independence groups
- variants：13 个（edition_group 5、material 3、nib 4、market_sku 1；父子关系 7）
- primary media：1，复用已有 M815 Black/Blue factual SVG
- `made_by`：M815 → Pelikan 1 条；品牌 `reverse` → M815 1 条
- spec：品牌、18 ct／18K-750 尖、差动活塞、黄铜／镀钯条纹、版本尺寸与重量、Special Edition 状态均有回读值

## 发布门禁读回

- `entity_publications.status = published`
- `content_revision = reviewed_content_revision = 378`
- `reviewed_contract_version = 3`
- fact/language/media/publication reviews：全部 `approved`
- `public_entity_readiness`：`blocker_count = 0`、`publishable = 1`
- `PRAGMA integrity_check`：`ok`

## 真实资料库保护证据

- 试验副本：`.planning/quick/260803-tsw-pelikan-m815-refresh-owned-checkpoint/checkpoint-final/fpkg.db`
- 真实 `data/fpkg.db` apply 前后 SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`
- 真实 WAL：0 bytes；SHM：32,768 bytes；未向真实库执行写入。

## 代码与检查

- 定向测试通过；Biome check 通过；`git diff --check` 通过。
- `pnpm exec tsc --noEmit` 仅剩仓库既有 3 个 baseline diagnostics（phase346 两个 TS7022、Turso migration test 一个 TS2741），无 Phase 420 新增诊断。

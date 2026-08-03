# Phase 422 checkpoint summary

## 结果

- 目标：既有 Wancher 品牌导航 + 三个既有津轻漆 SKU；未创建新实体
- 首次 checkpoint apply：品牌与三 SKU 均 `published`
- replay：四个实体均 `noop`
- 定向测试：`1/1` 通过，约 `68.2s`

## 三个 SKU 读回

| 实体 | 正文 | 来源/独立组 | 变体 | 内容 hash |
| --- | ---: | ---: | ---: | --- |
| Nanako Nuri | 6,120 | 11 / 11 | 5（edition_group 1、material 1、nib 2、variant 1） | `sha256:v3:aa1611a5cbeb46add8be969c18593f6ebf728bab52f3a3819103534c30c41b05` |
| Raden Midori-age | 6,159 | 11 / 11 | 6（edition_group 1、material 1、nib 3、variant 1） | `sha256:v3:45527864d85d720656f0c4e896a8e66684c28af4416336799947a678f9fa3718` |
| Shiro-age | 5,939 | 11 / 11 | 5（edition_group 1、material 1、nib 2、variant 1） | `sha256:v3:6e7420688a978ee423fb2920c13107252e2a96e89885252206e6f3e0b7a5c03b` |

- 每个 SKU：`made_by` → Wancher 1 条、品牌 `reverse` 1 条；primary media 1；model spec 与 11 条字段证据均有读回值。
- Spec 明确保留 exact page 未公开的尺寸、重量和年份，不从兄弟津轻漆 SKU 回填。

## 发布门禁读回

- Wancher 品牌：`published`，`content_revision = reviewed_content_revision = 678`，contract 3，readiness `publishable = 1` / `blocker_count = 0`。
- Nanako：`published`，revision `250` 对齐，contract 3，readiness 可发布。
- Raden：`published`，revision `253` 对齐，contract 3，readiness 可发布。
- Shiro-age：`published`，revision `250` 对齐，contract 3，readiness 可发布。
- 四类 review 在各自当前内容 hash 下均为 `approved`；旧 hash 的 revoked 记录保留为审计历史。
- `PRAGMA integrity_check`：`ok`。

## 真实资料库保护证据

- 试验副本：`.planning/quick/260803-uns-wancher-tsugaru-refresh-owned-checkpoint/checkpoint-final/fpkg.db`
- 真实 `data/fpkg.db` apply 前后 SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`
- 最终读回时真实库 WAL/SHM sidecar 均不存在（checkpoint 客户端已关闭）；未向真实库执行写入。

## 代码与检查

- 定向测试通过；Biome check 通过；`git diff --check` 通过。
- `pnpm exec tsc --noEmit` 仅剩仓库既有 3 个 baseline diagnostics（phase346 两个 TS7022、Turso migration test 一个 TS2741），无 Phase 422 新增诊断。

# Phase 364 结果摘要

## 内容

本批已完成并提交前验证。当前包包括：

- Wancher 品牌导航：`.planning/content-research/wancher-brand-phase364.md`。
- 三个 exact SKU 正文：Nanako Nuri、Raden Kara-nuri Midori-age、Kara-nuri Shiro-age。
- 三张原创 factual SVG、`scripts/data/phase364-wancher-dream-pen-tsugaru.ts`、owned-copy apply 脚本和定向回归测试。

## checkpoint 证据

- 真实 `data/fpkg.db` 与 `checkpoint/protected.db` SHA-256 均为 `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；apply 只写 `checkpoint/fpkg-copy-source.db`，副本 SHA-256 为 `4772997af897f51fd9c3be7367182de363ae22599c6cd6b1333c89481f5f20da`。
- 首次 apply：Wancher 品牌与三 SKU 均 `published`；内容 hash 分别为品牌 `sha256:v3:90a0e26e1375afde96f92285dd237e77cd9755e98754f91093848991e12d467a`、Nanako `sha256:v3:afe6d3dc10e32dc6f9ef8bd81402e3b2d194582b63504c302fa2e8072247b67d`、Raden `sha256:v3:3b048286b0a4816dc60969983eeb89443c96bf7b1275a13f1fb56e216411deae`、Shiro `sha256:v3:33e933fc19221135f2351ba369577f594abde4b4cdbe78498bfe7831a5ab7909`。
- 第二次 replay 四个实体均 `noop`，hash 不变。
- SQL evidence 已保存于 `checkpoint/sql-evidence.json`：品牌正文 2040 字符；Nanako 2152、Raden 2084、Shiro 2072 字符；三 SKU 分别有 5／6／5 个 approved variants、10 个 approved spec evidence、6 个 references、1 条 maker、1 条 reverse、1 个 approved primary media，以及 fact/language/media/publication 四类 approved review。
- 定向测试 `tests/content/phase364-wancher-dream-pen-tsugaru.test.ts`：1/1 通过（首次发布、回放 noop、受保护源快照未改变）。
- `git diff --check` 通过；目标测试文件 Biome check 通过。项目 Biome 配置忽略 `scripts/data/` 与 `scripts/apply-*` 路径，故这些脚本按现有仓库规则不计入 Biome 文件处理。
- `pnpm exec tsc --noEmit` 仍只有既有基线错误：`tests/content/phase346-jinhao-x450-x750.test.ts` 的 TS7022 两处，以及 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 TS2741；本批文件未新增错误。

## 未完成事项

本批不等于全量 goal 完成；仍需继续补齐真正未覆盖品牌／型号，最后完成正式迁移、全量检查、真人遍历、部署和线上逐条复查。

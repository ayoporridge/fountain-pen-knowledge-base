# Phase 365 结果摘要

## 内容

本批已完成 owned checkpoint apply 与定向回归。当前包包括 Pilot 品牌导航、Custom 槐正文、原创 factual SVG、data/apply 脚本与测试。

## checkpoint 证据

- 真实 `data/fpkg.db` 与 `checkpoint/protected.db` SHA-256 均为 `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；apply 只写 `checkpoint/fpkg-copy-source.db`，副本 SHA-256 为 `6b54ea79be5c64d89ff3086d252cc0588171cd0497aa34e0bea1b6dd859da293`。
- 首次 apply：Pilot 品牌 `published`（`sha256:v3:155f6b3a02898a9ab3cc914f69ff80d3ead92188ab7d5d80ac6618ed6b2104aa`），Custom 槐 `published`（`sha256:v3:07b071829c4c42b34365fb98bce108479cb6d43a21b4fdc68b1fdc68074ceabc`）；第二次 replay 两者均 `noop`。
- SQL evidence 已保存于 `checkpoint/sql-evidence.json`：品牌正文 2917 字符；Custom 槐正文 3382 字符；有 5 个 approved variants、11 个 approved spec evidence、8 个 references、1 条 maker、1 条 reverse、1 个 approved primary media，以及 fact/language/media/publication 四类 approved review。
- 定向测试 `tests/content/phase365-pilot-custom-enju.test.ts`：1/1 通过（首次发布、回放 noop、受保护源快照未改变）。
- `git diff --check` 通过；目标测试文件 Biome check 与 TypeScript 通过。全仓 `pnpm exec tsc --noEmit` 的基线错误仍为 phase346 的 TS7022 两处和 Turso migration test 的 TS2741。

## 未完成事项

本批不等于全量 goal 完成；仍需继续处理真正未覆盖的 Pilot／Wancher SKU 与其他品牌／型号，最后正式迁移、全量检查、真人遍历、部署和线上复查。

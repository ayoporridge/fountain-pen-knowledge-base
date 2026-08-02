# Phase 366 结果摘要

## 内容

本批完成 Pilot 品牌导航与三个独立型号：Custom 楓 FK-2000K、Capless 木轴 FC-25SK／FC-2500RR、Capless 螺鈿 FCN-5MP。每个型号都有自然中文正文、官方字段、版本差异、维护／选购边界和独立原创 factual SVG。

## checkpoint 证据

- `checkpoint/protected.db` 与真实 `data/fpkg.db` 的 SHA-256 均为 `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；真实库未被写入。
- `checkpoint/fpkg-copy-source.db` apply 后 SHA-256 为 `b15493c67e8dc6bc042059078d123cd24d1b3b21f9bb2d5660435725bfa9dc4a`；副本含 WAL／SHM 侧车仅属于 owned checkpoint。
- 首次 apply：Pilot 品牌与三个型号均为 `published`；第二次 replay 四个实体均为 `noop`。哈希保存在 `checkpoint/first-apply.json` 与 `checkpoint/replay.json`。
- `checkpoint/sql-evidence.json`：品牌正文 2522 字符；楓 2621、木轴 2485、螺鈿 2543；variants 分别 5／7／7；references 分别 8／9／8；spec evidence 各 11；每个型号 1 条 primary media、1 条 maker 与 1 条 reverse；四类最新 review 均 approved。

## 回归

- `pnpm exec tsx --test tests/content/phase366-pilot-special-routes.test.ts`：1/1 通过（约 46 秒）。
- `pnpm exec biome check tests/content/phase366-pilot-special-routes.test.ts`：通过。
- `git diff --check`：通过。
- 全仓 `pnpm exec tsc --noEmit` 仍只记录既有 phase346 `TS7022` 两处与 Turso migration test `TS2741` 基线错误；Phase366 文件未新增 TypeScript 错误。

## 未完成事项

本批不等于全量 goal 完成。仍有尚未正式迁移到真实库的内容包与待覆盖型号；最终正式迁移、全量检查、真人遍历、部署和线上逐条复查仍待完成。

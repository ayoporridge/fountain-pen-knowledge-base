# Phase 367 结果摘要

## 内容

本批补齐 Pilot Capless 絣（`FCN-2MR`）、Capless Stripe（`FC-3MS`）、Capless SE（`FCSE-3MR`）与特殊合金（`FCS-1`）四条独立型号路线，并更新 Pilot 品牌导航。每页都有自然中文正文、官方规格、版本／颜色差异、供墨与维护、选购边界、来源和原创示意图；没有把普通 Capless 的 18K 信息误写到 FCS-1。

## checkpoint 证据

- `checkpoint/protected.db` 与真实 `data/fpkg.db` 主文件 SHA-256 均为 `526bacec454eb969ac1dccbaa9e8e823f9996927171d2e149d18b5683e3e6fb2`；本批没有写入真实库。
- `checkpoint/fpkg-copy-source.db` 首次 apply 后、replay 后主文件 SHA-256 均为 `92459e6875b58e26d4ac36c99251a66da1bb040e8242cfd8cbd75a0f58880dfe`；副本的 WAL／SHM 侧车仅属于 owned checkpoint。
- `checkpoint/first-apply.json` 记录品牌与四个型号均为 `published`；`checkpoint/replay.json` 记录五个实体均为 `noop`，内容哈希未变。
- `checkpoint/sql-evidence.json`：品牌正文 2049 字符；四个型号正文分别 2031／2081／2095／2078 字符；variants 分别 5／4／6／5；每个型号 references 7、spec evidence 11、primary media 1、maker 1、reverse 1；最新 fact／language／media／publication review 全部 `approved`。

## 回归

- `pnpm exec tsx --test tests/content/phase367-pilot-capless-families.test.ts`：1/1 通过（约 57 秒）。
- 后续将运行 Biome、`git diff --check` 与全仓 `pnpm exec tsc --noEmit`；类型检查若仍出现 phase346 与 Turso migration test 的既有基线错误，单独记录，不扩大本包范围。

## 未完成事项

本批不等于全量 goal 完成。仍有尚未正式迁移到真实库的内容包、待覆盖的品牌／型号以及最终正式迁移、全量自动检查、真人遍历、部署和线上逐条复查。

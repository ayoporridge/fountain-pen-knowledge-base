---
name: deepen-the-existing-benu-briolette-canon
status: complete
created: 2026-08-09
---

# Offline BENU Briolette canonical depth

## Objective

在不连接 Turso、也不修改真实 `data/fpkg.db` 的前提下，深化已有 BENU Briolette canonical。保留 `s59BENU_BRIO` 与既有 BENU `made_by` 关系，只补充官方当前资料、样本边界、自然中文正文、规格证据和维护／选购语境。

## Non-goals

- 不新建 BENU 品牌或颜色型号实体。
- 不把 Ruby Forest、Island Breeze、Snow Season、Luminous 等颜色或样本升级为独立 canonical。
- 不写入 Turso、真实资料库或线上环境；不扩建通用验收、Playwright 或 AI runner。
- 不触碰其他 agent 的 research、`.next-phase*` 或受保护 quick 目录。

## Verification contract

- 应用脚本只接受明确的 owned checkpoint copy，并拒绝远端环境变量。
- 首次应用发布已有 Briolette，重放返回 `noop` 且内容 hash 不变。
- 模型正文自然中文不少于 5,000 Unicode 字符；来源、claims、spec evidence、primary media 和唯一 `made_by` 关系均可回读。
- 定向测试、TypeScript、Biome、SVG XML、library contract、quality／coverage／readiness 离线审计通过或明确记录既有 backlog。
- 真实 `data/fpkg.db` SHA-256 保持不变，只暂存本批自有文件。

# Phase 471 — Waterman C/F 与 Charleston 内容深化

## 目标

在不触碰真实 `data/fpkg.db` 的前提下，使用既有 canonical entity 和已登记来源，补足 Waterman C/F 与 Charleston 的正文、版本边界、维护/选购建议、时间线和可追溯 claims；通过项目既有审核—发布链路写入 caller-owned checkpoint copy。

## 执行项

1. 调整两份研究正文结构，使 `body_md` 具备可读的自然中文长文，并补入官方年表、专业档案与目录样本的交叉边界。
2. 从 `phase157-waterman-cf` 与 `phase48-waterman-aurora` 复制既有实体包，追加 Phase 471 scope、claims、timeline，不新建重复实体。
3. 在 Phase 470 checkpoint 的 disposable copy 上执行远程环境拒绝、身份/品牌关系、审核、发布和 replay noop 定向回归。
4. 检查 library contract、integrity/FK、质量审计、TypeScript 基线、Biome 与 diff，再只提交本批拥有文件。

## 明确边界

- 试验数据库只使用 `.planning/quick/260804-dro-phase-470-deepen-existing-waterman-ideal/checkpoint.db` 的复制品。
- 不修改、删除或暂存其他 agent 的 research、`.next-phase*`、既有 quick checkpoint，尤其是受保护的 Montblanc quick 目录。
- 不把 Charleston 的目录样本或 C/F 的替代墨囊实验写成全系列硬规格。

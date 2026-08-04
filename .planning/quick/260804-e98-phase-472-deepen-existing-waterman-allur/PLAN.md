# Phase 472 — Waterman Allure 与 Exception 内容深化

## 目标

沿用已存在的 canonical entity，不新增重复的 Waterman Allure 或 Exception 型号；在 caller-owned checkpoint copy 上补充当前 SKU、版本差异、维护和选购边界，并通过审核—发布链路验证。

## 执行项

1. 深化 `waterman-allure-current-phase83.md` 与 `waterman-exception-phase131.md`，保留官方商品页、collection、支持页和专业样本各自的证据范围。
2. 从 Phase 83/131 base packs 复制既有实体，追加 Phase 472 scopes、claims、timeline，不碰 retired 的重复 Allure/Exception entity。
3. 在 Phase 471 checkpoint 的 disposable copy 上执行远程环境拒绝、身份与 `made_by`/`reverse` 关系、审核、发布和 replay noop 回归。
4. 检查 contract、质量、integrity/FK、TypeScript 基线、Biome/diff，并只提交本批文件。

## 边界

- 绝不写 `data/fpkg.db`；checkpoint 及其副本不提交。
- 不把 Allure 的 S0037650 规格、Exception 的 SAP_2214314 或历史样本外推到全家族。
- 保护其他未跟踪研究、`.next-phase*` 与既有 quick 目录。

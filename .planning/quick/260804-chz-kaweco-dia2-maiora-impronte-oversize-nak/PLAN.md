# Phase 466：Kaweco DIA2、Maiora Impronte Oversize、Nakaya Writer Portable 深化

## 目标

在 Phase 465 owned checkpoint 的基础上，复用三个已存在的 canonical pen entity，补足可核实的型号身份、规格边界、版本差异、维护和选购信息；不创建重复实体，不写入真实 `data/fpkg.db`。

## 任务

1. 更新三份研究稿，使正文达到自然中文的可读长度，并明确官方资料、第三方样本和购买时效性边界。
2. 以 `CuratedEntityPack` 复用既有 source、media、brand identity 和型号 ID，补入 source-backed claims、timeline 和 selection guidance。
3. 通过项目既有 `recordEntityContentReview` 与 `publishEntity` 路径，在 owned checkpoint copy 发布并检查 `made_by`／reverse 导航。
4. 在定向测试、SQLite 完整性、library contract、readiness、quality、TypeScript、Biome 和 diff 检查后，仅提交本批拥有的文件。

## 验收

- 远程数据库环境变量被拒绝，真实 catalog snapshot 和 SHA-256 前后不变。
- 三个目标实体均保持原 ID／slug，正文、来源、primary media、审核发布和品牌双向关系有效。
- 首次 apply 为 `published`，第二次 replay 全部为 `noop`。
- 全站审计仍明确 backlog 边界；本批不把局部通过冒充全量 goal 完成。

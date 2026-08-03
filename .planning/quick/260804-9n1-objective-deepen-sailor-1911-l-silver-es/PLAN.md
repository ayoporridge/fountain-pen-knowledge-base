# Phase 461：深化 Sailor 1911 L 银饰、Faber-Castell Essentio、Parker Victory

## 目标

在前一批已验证 checkpoint copy 上，补足三个已有 canonical pen entity 的自然中文正文、SKU/版本边界、规格、维护与选购建议；不创建重复实体，不把研究包直接写入真实 `data/fpkg.db`。

## 交付

- 更新 Sailor 1911 L Demonstrator Silver 11-9223、Faber-Castell Essentio、Parker Victory 三份研究正文。
- 复用已有 `CuratedEntityPack`，追加来源、scope、claims 与 timeline；用项目既有 `recordEntityContentReview` + `publishEntity` 路径审核发布。
- 定向测试覆盖 owned checkpoint、远程环境拒绝、身份、正文长度、来源独立组、图片、品牌关系、审核/发布 hash、幂等重放与真实 catalog 不变。
- 跑 integrity/FK/library contract、readiness/entity-quality/library-coverage、TypeScript、Biome 与 diff 检查。

## 明确边界

- 试验数据库仅为本目录下的 `checkpoint.db` 与测试临时副本。
- 不修改或删除其他未跟踪 research、`.next-phase*` 目录及 Montblanc quick 目录。
- 不提交审计 JSON、checkpoint 数据库或其他非本批文件。

## 验收

1. 三个型号各有至少 3500 字研究文件、至少三组独立来源、至少四个已审核引用和一张 primary media。
2. 三个实体在 checkpoint 中保持原 ID/slug/type，各有且仅有一个 `made_by` 与一个品牌反向导航关系。
3. 三项 fact/language/media review 与 publication review 均对应最新 content hash，publication 为 published、contract version 3、blocker 为 0。
4. 同一 apply 再次运行全部返回 noop；真实 catalog snapshot 前后不变。
5. 记录实际 checkpoint hash、计数、质量/覆盖审计结果和已知 TypeScript 基线错误，提交只包含本批文件。

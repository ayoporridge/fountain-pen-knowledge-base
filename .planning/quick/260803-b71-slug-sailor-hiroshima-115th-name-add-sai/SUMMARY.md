---
quick_id: 260803-b71
slug: sailor-hiroshima-115th
status: complete
completed_at: 2026-08-03
commit: 2740e2a
---

# Phase 376 摘要

## 结果

- 新增两个真实缺失的 Sailor 具体型号：HIROSHIMA 寄木细工 `10-1115` 与 HIROSHIMA モミジ `10-1116`。
- 两个型号均有自然中文正文、规格 JSON、历史／项目背景、版本与兄弟型号边界、C/C 补墨、木质件维护、选购／验收建议、9 条来源和原创 factual SVG。
- `10-1116` 明确保留英文官网 Material／Weight 泛化字段与日本页／官方 PDF 的冲突，采用日本资料的枫木油仕上与 34.5 g，不把 10-1115 的寄木写入其规格。
- 颜色选择器和跨市场 `328`／`320` 代码均保留为同一 MF 变体，不创建重复实体。

## 验证证据

- 定向测试：`pnpm exec tsx --test tests/content/phase376-sailor-hiroshima-115th.test.ts`，1/1 通过。
- 测试验证：拒绝远程环境、正文长度与来源独立组、SVG 非照片标记、首发 published、规格／来源／媒体／四项审核、冲突、maker／reverse 拓扑、replay noop，以及真实资料库快照未改变。
- 持久 owned checkpoint：`checkpoint/fpkg-copy.db`；首次应用和 replay 输出分别见 `first-apply.json`、`replay.json`，SQL 回读见 `sql-evidence.json`。
- 首次应用：品牌和两个型号均 `published`；replay：三者均 `noop`。
- 真实库 SHA-256 保持 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；checkpoint 写入后为独立副本 `24e16f49c9519a4f3ffa64b4ed3e87715ed72976d99d3524e05e41ce5c3cf7c8`。

## 边界

本 quick task 没有写入 `data/fpkg.db`、Turso 或线上站点；没有删除或暂存其他 agent 的 research、`.next-phase*` 或既有 quick checkpoint。全量内容修复 goal 仍保持 active，正式迁移、全站真人遍历、部署和线上逐条复查尚未完成。

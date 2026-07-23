# Phase 84 publication guard repair

## 问题

Phase 84 同时更新 Platinum 与 Pilot 品牌和型号。品牌 publication 的拓扑变更会使已发布型号进入 `in_review`；原脚本在品牌分组之间完成后没有为所有受影响型号重新走当前 hash 审核，因此 replay 不能全 noop。

## 修复

- 保留 `recordEntityContentReview` 与 `publishEntity` 作为唯一审核／发布路径。
- 两个品牌和全部型号内容写入后，先确认两个品牌公开，再逐个重新确认受影响型号。
- 增加批次级 `published` 状态断言，防止拓扑变更留下 `in_review`。

## 非目标

- 不直接更新 `entity_publications` 为 published。
- 不写真实 `data/fpkg.db`，不扩建通用 runner 或 readiness 框架。

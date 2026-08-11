---
quick_id: 260811-ryz
status: complete
implementation_commit: f996d249
completed_at: "2026-08-11T21:34:05+08:00"
scope: direct-content-repair
phase_number: 597
---

# Phase 597 Summary：Nahvalur Key West、Triad 与 Pen of the Year 2022–2026

## Outcome

在 Phase 596 caller-owned checkpoint 的独立 copy 上完成 Nahvalur 品牌深化，并发布七个互不混名的 canonical 型号：Key West、Triad、Tiger 2022、Rabbit 2023、Dragon 2024、Snake 2025、Horse 2026。实现提交为 `f996d249 feat(content): add Nahvalur Key West Triad and annual editions`，仅包含计划声明的 18 个实现文件。

本批未打开或写入真实 `data/fpkg.db`，未访问 Turso，未扩建通用 runner、Playwright 或 readiness 基础设施。Phase 597 完成仅代表一个内容批次完成；full-corpus goal 继续 active。

## Content and identity

- 写入八篇来源化研究／中文正文，以及七张互不相同的 1600×900 本站原创示意图；图片均明确为非产品照片。
- Key West 保持单一基础型号；Key Largo、Islamorada、Pride 2024 与八个 2021 售罄 SKU 只作为 edition／时态证据。
- Triad 只为 fountain-pen F／M 建立 edition-group → market-SKU 拓扑；同页 RollerBall 明确排除。
- 五个 Pen of the Year 年度版分别绑定 Tiger 222、Rabbit 223、Dragon 224、Snake 888、Horse 999 的限量、材料、笔尖与机构证据。
- Nahvalur 品牌页由七个既有型号扩展到十四个公开型号；所有 made_by 关系完整，既有型号 digest 保持不变。

## Safety and replay evidence

- Phase 596 source checkpoint main SHA-256：`81bf7975b41e9820b86546ac9406bf82b04eaadcf6761e6041241c7ece4dc5b3`。
- 真实 `data/fpkg.db` main SHA-256：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。
- Phase 597 persistent checkpoint main SHA-256：`50f8ae9c81999e5341d788426af2c6333fe5e6affd9919fd198b1c213a3b701b`。
- source checkpoint 与真实库 main/WAL/SHM family 在测试前后保持不变。
- wrapper 对实体 ID、slug、名称、alias 四类 collision 及三类 remote selector fail closed。
- fresh disposable copy 首次 apply 后品牌与七个型号均为 `published`；persistent checkpoint 完整 replay 后八个 pack 均为 `noop`。

## Verification

- Phase 597 定向回归：1/1 PASS，`508084.989833 ms`；覆盖 first apply、replay、baseline +7、品牌 7→14、SKU topology、时态／排除证据、四项 reviews 与受保护库快照。
- TypeScript、目标 Biome、七张 SVG 的 `xmllint`、18-path staged diff-check 全部通过。
- SQLite `integrity_check=ok`，foreign-key check 无行；current-public primary local path duplicate group 为 0。
- entity quality：817 个 active public entity；duplicate、thin、suspicious、broken made_by 均为 0。
- library contract：3847 sources、5813 source items、7095 claims、16469 citations、869 stories、1220 events、1138 media 等均通过。
- public media audit：833 checked、833 healthy、0 failed。
- production build 通过，18/18 static pages 完成；隔离服务上的品牌页与七个型号页均 HTTP 200，正文关键标记和七张 SVG hash 回读一致。

## Readiness boundary

- Inventory：841（119 brands + 722 pens）。
- Published / content-ready / public：817。
- Published blockers：0；public blockers：0。
- Backlog：24 个 retired lineage。
- `inventory_complete=true` 与 `public_clean=true` 只证明当前候选库存已审计且公开子集干净；它不证明外部型号覆盖已经封板。由于 retired backlog 和尚未完成的外部覆盖收口，审计仍为 `content_complete=false`、`complete=false`。

## Deviations resolved

- Key West 首轮因缺少 qualifying professional secondary group 被 publication gate 拒绝；加入 Goldspot 的 `fill_system` 二级规格交叉证据后通过，未降低门槛。
- wrapper CLI 的异步进程提前退出改为显式 keep-alive，并在完成／失败后释放；未绕过审核发布链路。
- staged diff-check 发现研究稿与 SVG 尾部多余空行后按 owned paths 修正；Triad 的 Pen Chalet URL 在补丁中短暂误写并立即恢复为已核验地址。
- standalone server 不携带根 `public/` 目录导致媒体 404；最终使用显式 disposable DB 的标准 Next 服务完成页面与媒体回读，没有修改通用运行时。

## Remaining full-goal work

- 继续处理 IKKAKU by Nahvalur 及其漆艺产品的品牌／子品牌身份和型号覆盖。
- 冻结外部全量库存后，才正式迁移真实本地库和 Turso。
- 在正式库上执行全量自动检查、真人遍历全部公开页面、生产部署与线上逐条复查。

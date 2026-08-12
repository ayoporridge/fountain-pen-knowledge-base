---
quick_id: 260812-tmx
status: complete
phase_number: 601
scope: retired-lineage-closure
source_checkpoint: .planning/quick/260812-p9u-ystudio-portable-desk-resin-yakihaku-kaz/checkpoint-final/catalog.db
---

# Phase 601 Plan：24 条 brand／pen backlog 与 1 条 retired nib 收口

## Goal

以 Phase 600 最终 checkpoint 中 24 条 retired brand／pen backlog 与 1 条 retired nib 为唯一输入，不重做全量库存盘点。逐条区分已完成 canonical merge／split、应转品牌或具体型号的 placeholder、确实仍缺身份资料的条目；优先重放仓库已有身份修复包，补齐缺失 lineage／redirect，避免旧路由 404 或混名复活。

## Safety boundary

- 所有写入只发生在 Phase 600 checkpoint 的 caller-owned copy；不写真实 `data/fpkg.db`，不访问 Turso。
- 先复用现有 `apply-phase*.ts`；存在可重放包时不复制实现、不新建实体。
- 不把 retired donor 重新发布，不绕过 publication review，不把一对多 split 强行重定向到任一 sibling。
- 不修改或提交其他未跟踪 research、`.next-phase*`、其他 quick 目录，尤其保护指定 Montblanc quick。

## Tasks and verification

1. **Backlog disposition ledger**
   - 记录 25 条 retired 实体（24 条 brand／pen + 1 条 nib）的 blocker、lineage、redirect、canonical successor 与证据来源。
   - 分为 terminal lineage、missing route closure、split navigation required、identity research required 四组。

2. **Replay existing repairs first**
   - 在 owned copy 重放已存在但未进入当前候选链的身份修复包，首先验证 Phase 504 Pelikan M800。
   - verify：首次仅补缺失关系或路由，第二次 replay 为 no-op；源 checkpoint 与真实库 family hash 不变。

3. **Close deterministic old routes**
   - 对唯一 successor 的 retired donor 补 permanent redirect 与 lineage；对类型 placeholder 转向正确品牌或具体型号。
   - 一对多 split 只建立系列导航或保留解释性 fallback，不任意选择 sibling。

4. **Targeted acceptance**
   - 覆盖 collision、remote selectors fail-closed、24 条 disposition、redirect readback、published canonical digest 不变、SQLite integrity/FK 与完整 replay。
   - 只做与本批身份收口直接相关的定向回归，不扩建通用验收设施。

5. **Handoff**
   - 输出 remaining research queue；只有确实缺可靠身份资料的条目留待下一批外网研究。
   - 精确暂存本批文件并提交；full-corpus goal 保持 active。

---
quick_id: 260811-hoq
status: complete
date: 2026-08-11
---

# Add sourced LAMY Lx and LAMY dialog cc content packages

在 Phase 585 最终候选库的 owned checkpoint copy 上新增两个经官方资料确认、且当前目录尚不存在的独立 LAMY 型号；不访问 Turso，不写入 `data/fpkg.db`，不改动搜索、LLM、Playwright 或通用验收基础设施。

## Task 1: 固化来源、身份边界与自然中文正文

- **Files:** `.planning/content-research/lamy-lx-phase586.md`, `.planning/content-research/lamy-dialog-cc-phase586.md`, `public/images/library/site-original/phase586/lamy/*.svg`
- **Action:** 依据 LAMY 官方现行产品页、官方 press release／护理／笔尖资料和具名专业样本，分别写清介绍、规格、历史、版本边界、维护和选购建议；原创 SVG 明示非产品照片。
- **Verify:** 两篇正文各不少于 2,000 个 Unicode 字符，来源可追溯，不含 `model_specs` JSON 或数据库内部术语；两张 1600×900 主图互不重复。
- **Done:** Lx 与 dialog cc 的身份、现行 SKU、历史和相邻型号边界不混写。

## Task 2: 建立 CuratedEntityPack 与审核—发布链路

- **Files:** `scripts/data/phase586-lamy-lx-dialog-cc.ts`, `scripts/apply-phase586-lamy-lx-dialog-cc-content.ts`
- **Action:** 复用 Phase 426 LAMY brand pack；创建 `lamy-lx`、`lamy-dialog-cc` 两个独立 pen pack，补唯一 `made_by`／brand reverse 关系，拒绝远端环境、slug／name／alias 冲突和非 owned copy；经 fact/language/media review 与 `publishEntity` 路径发布。
- **Verify:** 首次 apply 发布两个型号并刷新品牌，重放全为 noop；publication revision、contract v3 readiness、public view 和关系终态一致。
- **Done:** 不直接改 `entity_publications.status`，不写真实资料库，两型号与品牌导航形成唯一拓扑。

## Task 3: 定向回归与离线候选验收

- **Files:** `tests/content/phase586-lamy-lx-dialog-cc.test.ts`, 本 quick 目录下未提交的 checkpoint/evidence，`260811-hoq-SUMMARY.md`
- **Action:** 从 Phase 585 r4 复制 owned checkpoint，运行 collision／remote rejection／首次应用／重放测试、TypeScript、Biome、SQLite integrity、内容完整性、readiness、media、library contract 和本地页面抽查；记录真实库前后 hash。
- **Verify:** 所有定向与全局离线检查通过；公开品牌／型号增量为 +2，真实 `data/fpkg.db` hash 不变；精确检查 Git diff 后只提交本批次拥有的研究、SVG、data、wrapper、test、PLAN/SUMMARY/STATE。
- **Done:** 产生可继续累积的 Phase 586 checkpoint；Turso 同步、部署和线上复查明确保留为总 goal 后置任务。

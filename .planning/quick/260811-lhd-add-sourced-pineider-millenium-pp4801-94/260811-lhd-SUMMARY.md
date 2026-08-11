---
status: complete
quick_id: 260811-lhd
scope: direct-content-repair
source_candidate_sha256: 23bcef02269a11600d59b1d5e1b466d984664b5acb7e6f2f6a64a9c116ad8b74
output_checkpoint_sha256: 48da69a895ed9a4bd2eaf7e0a454fcfc6fad83607cab90f5252024d43e6d9c58
implementation_commit: 661110907aa4567d49889e61fd96de949a6b4d37
completed_at: 2026-08-11T08:10:39Z
duration: 34m14s
---

# Phase 591：发布 Pineider Millenium 与 Psycho

本 quick 在 Phase 590 owned candidate 的一份新 caller-owned checkpoint 上，发布 Pineider Millenium `PP4801 / 945` 与 Psycho `PP4301 / 468`，并把 canonical Pineider 品牌导航从七个公开型号扩为九个。Turso 未被查询，真实 `data/fpkg.db` 与 Phase 590 source candidate 未被 SQLite-open 或写入；本次只完成这两个型号，full-corpus goal 继续保持 active。

## 已交付

- Millenium 锁定 current exact identity `PP4801 / 945`，保存 F／M／S／B／EF 五个完整 child SKU、88 支、aluminum／black PVD、14K hyperflex、marine-steel clip、Twist Magnetic Lock 与 piston filling。官网单 n `Millenium` 是 canonical，官方文章双 n `Millennium` 是 searchable alias；Arman Black Aluminum／PVD／Trilogy 的 `PP4801G20` 同码档案进入 resolved conflict，不授权 current name、尺寸、重量或开孔结构。
- Psycho 锁定 current Palladium `PP4301 / 468` 与 `PP4301-099` 五个 child SKU，记录 140 mm、18.5 mm、Italy、925 silver、nanofusion、Palladium／Yellow Gold／Rose Gold 三个 trim scope、F／M／S／B／EF、14K 与 limited status。Pineider family、Chatterley 正文与 Appelboom 支持 cartridge／converter；Chatterley `Piston Filler` metadata 保留为 rejected evidence。88 被限定为每个 trim／color、每种 writing mode，未扩写成 family-total 88。
- Pineider 品牌页现在链接 Avatar UR、Arco、Rock、Classic Palladium、Tempi Moderni、Grande Bellezza Forged Carbon、Mystery Fast Filler、Millenium 与 Psycho 九个 canonical 节点；只继承 Phase 590 brand pack，没有重放此前七个型号 wrapper。
- 两个型号都通过现有 CuratedEntityPack fact／language／media／publication review 与 `publishEntity` 路径，各有唯一 spec、primary media、`made_by`、品牌 `reverse` 和四类 current-hash approved review。wrapper 对 remote selectors、identity／alias collision、owned path／inode／hard-link、migration、七个既有 Pineider model digest 与 replay 全部 fail closed。
- 两张 1600×900 site-original SVG 使用不同构图，带 `<title>`、`<desc>`、`role="img"` 与“本站原创示意图／非产品照片”边界；`sharp` 原生 1600×900 预览目视无裁切、溢出或错位。Millenium SVG SHA-256 为 `a641dae5c51afaa7a6255242ee3dc508f65b6f344394a163f664b8bc5fb1e567`，Psycho SVG 为 `f07d66bb8d2196d65937f381d18a9fcf2edd32bb7c719c285d9c5b7888a0da3a`。

## 离线验收

- 输入 Phase 590 candidate SHA-256：`23bcef02269a11600d59b1d5e1b466d984664b5acb7e6f2f6a64a9c116ad8b74`；结束时 main／WAL／SHM family snapshot 与开始时逐字段一致。
- 输出 Phase 591 checkpoint SHA-256：`48da69a895ed9a4bd2eaf7e0a454fcfc6fad83607cab90f5252024d43e6d9c58`；所有 migrate、apply、query、audit 与 readback 都只使用该 copy 或它的临时 successor copy。
- 真实库 SHA-256：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`，结束时仍无 WAL／SHM，前后 snapshot 完全一致。
- 定向回归 1／1 通过（126099 ms）：四类 collision、三个 remote selector 写前拒绝、baseline + missing-target delta、Pineider 7→9、current public／content-ready +2、既有七个 Pineider model digest 不变、首次三包发布与完整 replay 三包 `noop` 均成立。
- TypeScript、精确 Biome、八路径 `git diff --check`、两张 SVG 的 `xmllint` 均通过；SQLite `integrity_check=ok`，`foreign_key_check` 无行，library contract 为 `OK`。
- Readiness：823 个 inventory、799 个 published、799 个 content-ready，published/public blocker 均为 0；24 个 backlog 均为既有 retired lineage，所以 full-corpus `content_complete` 仍如实为 false。
- Entity quality：799 个 active entity 中 duplicate-name group、thin entity、suspicious pen article 与 broken link 均为 0；两个 target 的 `made_by_status` 都是 `exactly_one`。
- Public media：815／815 healthy；current-public approved primary-media path duplicate group 为 0。
- Production build 通过并生成 18／18 static pages，standalone libsql native runtime 已准备。隔离 runtime 的 `/brand/pineider`、两个 `/pen/{slug}` 与两张 SVG 共五个 URL 全部 HTTP 200；品牌页读到两个新增链接，型号页读到 exact codes 与关键 conflict markers，HTTP SVG hash 与提交文件一致。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 收敛 CuratedEntityPack summary 长度**

- **Found during:** 定向回归首次运行
- **Issue:** 三个 summary 超出既有 60–160 Unicode contract。
- **Fix:** 在不删事实边界的前提下压缩为 160、157 与 147 个字符。

**2. [Rule 1 - Bug] 修正 child SKU taxonomy parent kind**

- **Found during:** 定向回归第二次运行
- **Issue:** migration 032 只允许 nib child 挂在 `edition_group`，两个 exact product anchor 误标为 `market_sku`。
- **Fix:** 把两个 parent anchor 改为 `edition_group`，保留 exact product code、scope 与五个 nib child SKU。

**3. [Rule 1 - Bug] 修正 rejected spec evidence 测试列名**

- **Found during:** 定向回归第三次运行的末段 readback
- **Issue:** 测试查询不存在的 `spec_field_evidence.locator`。
- **Fix:** 使用实际 schema 的 `evidence_locator AS locator`；第四次目标回归完整通过。

**4. [Rule 3 - Blocking] 修正 checkpoint 验收命令边界**

- **Found during:** owned checkpoint migrate/readback/server 启动
- **Issue:** `tsx -e` CJS 不接受 top-level await；自定义 readiness SQL 需要经 `entity_id` 联接 slug；nested workspace 的 standalone entry 不在顶层默认路径。
- **Fix:** 使用 async IIFE、按 schema 联接 `entities`／`entity_publications`，并沿用 Phase 590 已验证的隔离 `next start` readback。所有修正只发生在 quick-local checkpoint/evidence runtime，未改通用基础设施。

Quick Look 的 1600×1600 aspect-fill thumbnail 曾制造右侧裁切假象；使用仓库既有 `sharp` 按 SVG 原生 1600×900 栅格化后确认源图没有裁切，因此没有为预览器伪影修改 SVG。

## Known Stubs

None。八个实现文件未发现 TODO、FIXME、placeholder、coming-soon 或阻断目标的数据空壳。

## Threat Review

没有超出 PLAN threat model 的新网络 endpoint、auth path、schema trust boundary 或远程数据库路径。所有数据库操作均受 caller-owned realpath／inode／link／snapshot 与空 remote selectors 约束。

## Evidence

本地 checkpoint 与验收材料保存在本 quick 的 `checkpoint/`、`evidence/` 下，未提交 Git。实现 commit 为 `661110907aa4567d49889e61fd96de949a6b4d37`，仅含计划允许的八个文件。

## 下一步

继续从现有 research、wrapper 与 Phase 591 candidate 推导尚未覆盖的重要型号。内容封板后再统一迁移真实本地库并真人遍历；Turso 可用且明确授权后才考虑云端同步、生产部署和线上逐条复查。full-corpus goal 保持 active。

## Self-Check: PASSED

- 八个实现文件存在，commit `66111090` 可在 Git 历史中读回，且没有 tracked deletion。
- commit 路径集合精确等于八文件 allowlist；当前 index 为空。
- SUMMARY、PLAN、STATE、checkpoint 与 evidence 均未进入实现 commit。
- target regression 与五 URL readback assertion 均可从 evidence 读回为 PASS。

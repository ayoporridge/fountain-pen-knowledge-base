---
status: complete
quick_id: 260811-p8m
scope: direct-content-repair
source_candidate_sha256: d799dd0e07d68a27bcad31a8685088bacde5937bf0534075fd27ed42a6a212e8
output_checkpoint_sha256: 8969d5b008cb33b16bb12ab735889a198c62fb37a9aa470d0d53142a8236ff1b
implementation_commit: f084a0d81ef4b3ef2bbd62788aae64755e710789
completed_at: 2026-08-11T18:50:20+08:00
duration: 44m
---

# Phase 595：新增 Pineider Avatar UR Demo Metal 与 Glossy

本 quick 在 Phase 594 owned candidate 的新 caller-owned checkpoint 上新增两个 Pineider canonical 型号，并把品牌导航从十四个公开型号扩为十六个。Turso 未被查询，真实 `data/fpkg.db` 与 Phase 594 source family 未被 SQLite-open 或写入；本次只完成这一内容批次，full-corpus goal 继续保持 active。

## 已交付

- `Pineider Avatar UR Demo Metal Fountain Pen` 只建一个 canonical 节点。官网同名 `PP3401／608` 普通金属件与 `PP3901／611` Black 分别进入两个 edition group；标准 Avatar UR、Anniversary、Mini、Glossy 与 Deluxe 均未并入。
- Demo Metal 当前 pricing matrix 固化为 31 个 market-SKU child：PP3401 八个、PP3901 二十三个。五个完整但未定价的代码只保存为 rejected evidence，不冒充当前可选 SKU。
- `Pineider Avatar UR Glossy Fountain Pen` 建为独立 `PP4001／602` canonical 型号。当前 selector 只显示 Lapis Blue 406 与 Nero 056，pricing matrix 只建立五个 SKU；EF Lapis 与五组隐藏 suffix 共十六个完整代码保留为 rejected evidence。
- Glossy 官网正文的 `all-black look` 与同页 Lapis Blue／Nero selector 矛盾被明确保存。官网镀钯钢尖作为 canonical current 值；Hamilton 对 Black Glossy 黑色镀层钢尖的描述只作为 retailer trim-scope 冲突证据。
- 两页均覆盖身份、规格、页面时态、版本边界、使用维护、选购核验、图片说明与具名来源。品牌正文 4054 字符，Demo Metal 4099 字符，Glossy 3401 字符。
- 新增两张互不相同的 1600×900 site-original SVG，均带 `<title>`、`<desc>`、`role="img"` 与“本站原创示意图／非产品照片”边界。原生 PNG 渲染目视未见裁切、重叠或错位。

## 审核与发布链路

- Pineider brand refresh 与两个型号 pack 均走现有 `recordEntityContentReview`／`publishEntity` 路径；当前 hash 的 fact、language、media、publication 四类 review 全部 approved，没有直接改 publication 状态。
- wrapper 在写前拒绝任何非空 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，并校验 reviewer、owned realpath、regular file、symlink／hard-link／inode、protected snapshot、client binding 与 migration 032。
- 两个新型号的 entity、slug、canonical name、alias 四类 collision 均 fail closed。十四个既有 Pineider public model 的完整 digest 前后不变；首次三包发布成功，完整 replay 三包全部 `noop`。

## 离线验收

- 输入 Phase 594 candidate SHA-256：`d799dd0e07d68a27bcad31a8685088bacde5937bf0534075fd27ed42a6a212e8`；结束时 main／WAL／SHM family 与 Phase 594 结束快照逐字段一致。
- 输出 Phase 595 checkpoint SHA-256：`8969d5b008cb33b16bb12ab735889a198c62fb37a9aa470d0d53142a8236ff1b`。真实库 SHA-256 仍为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`，且没有 WAL／SHM。
- 定向回归最终 1／1 通过（136104 ms）：四类 collision、三个 remote selector、source／real family、baseline +2、Pineider 14→16、31／5 个当前 SKU、五／十六个拒绝代码、页面内部冲突、四类 review、首次发布与 replay 均有断言。
- TypeScript、目标测试的精确 Biome、两张 SVG 的 `xmllint` 与八路径 staged diff check 全部通过。SQLite `integrity_check=ok`，`foreign_key_check` 无行，current-public approved primary local-path duplicate group 为 0。
- Readiness：830 个 brand／pen inventory、806 个 published、806 个 content-ready，published/public blocker 均为 0；24 个 backlog 均为既有 retired lineage，因此 `content_complete=false` 仍是正确结果。
- Entity quality：806 个 active entity 中 duplicate-name group、thin entity、suspicious pen article 与 broken link 全为 0。Library contract 为 `OK`：3812 sources、5747 source items、7027 claims、16224 citations。Public media 为 822／822 healthy。
- 隔离 production build 通过并生成 18／18 static pages，standalone libsql runtime 已准备。`/brand/pineider`、两个 `/pen/{slug}` 与两张 SVG 共五个 URL 全部 HTTP 200；品牌新增两链接、exact codes、SKU 与冲突标记均从 production server 回读。
- SVG SHA-256：Demo Metal 为 `926f7fe0b26f2c5e812649260b2b3881aa46e2b95aef052b3716ef5484c964d2`；Glossy 为 `73be75065e18df4e24fa858860d8df403056fee0236a031925bd11973998ed1f`。HTTP 回读哈希与文件完全一致。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Format] 用 Biome 机械整理目标测试**

- **Found during:** 精确静态检查
- **Issue:** 测试逻辑通过，但长 `test(...)` 块未符合仓库 formatter 输出。
- **Fix:** 只对目标测试运行 Biome `--write`，随后重新执行 Biome、TypeScript 与完整定向回归；最终均通过。

**2. [Rule 3 - Safety] 更正一次缺少 source selector 的测试命令**

- **Found during:** 格式化后的定向回归重跑
- **Issue:** 第一次命令未传 `FPKG_PHASE595_SOURCE_DATABASE`，测试按设计把默认真实库哈希与 Phase 594 预期哈希比较后立即失败。
- **Fix:** 保留失败 evidence，显式指定 Phase 594 source checkpoint 并启用 pipefail 后重跑；完整 1／1 通过。失败发生在任何迁移或写入之前。

**3. [Rule 1 - Audit] 排除没有 local path 的 primary media**

- **Found during:** SQLite duplicate-path readback
- **Issue:** 第一条诊断 SQL 把七条没有本地路径的 approved primary media 聚为同一个空值组，不能代表图片路径重复。
- **Fix:** 保留第一次输出，按“非空本地路径”重跑；current-public approved primary local-path duplicate group 为 0。

**4. [Rule 3 - Isolation] 纠正 production build 工作目录与 package runner**

- **Found during:** 隔离 build artifact 核验
- **Issue:** 第一次成功 build 没有进入临时目录，不能作为隔离证据；随后在临时目录使用 pnpm 时，pnpm 试图清理 symlinked `node_modules` 并 fail closed。
- **Fix:** 保留两次 attempt evidence，在临时 Git archive 副本内用现有依赖的 `npm run build` 重跑。最终 build、standalone server 与五 URL readback 全部通过。

Biome 配置只纳入 `tests/**` 与少量指定 scripts；两个新 scripts 由 TypeScript、定向回归、首次 apply 与 replay 覆盖，没有扩建通用格式或验收基础设施。

## Known Stubs

None。八个实现文件没有 TODO、FIXME、placeholder、coming-soon 或阻断目标的数据空壳。

## Threat Review

没有新增网络 endpoint、auth path、schema trust boundary 或远程数据库路径。全部数据库操作受 caller-owned realpath／inode／link／snapshot 与空 remote selectors 约束；Turso 未访问。

## Evidence

本地 checkpoint 与验收材料保存在本 quick 的 `checkpoint/`、`evidence/` 下，未提交 Git。实现 commit 为 `f084a0d81ef4b3ef2bbd62788aae64755e710789`，精确包含计划允许的八个文件，3116 insertions、0 deletions。

## 下一步

从 Phase 595 candidate 出发，将剩余重要品牌／型号按同品牌、同证据结构合并为较大的内容批次，减少逐型号重复 checkpoint／build 开销。内容封板后再统一迁移真实本地库并真人全页面遍历；Turso 可用且用户确认后才进行云端同步、生产部署和线上逐条复查。full-corpus goal 保持 active。

## Self-Check: PASSED

- 八个实现文件存在，commit `f084a0d8` 可从 Git 历史读回，且没有 tracked deletion。
- commit 路径集合精确等于八文件 allowlist；实现提交后 index 为空。
- SUMMARY、PLAN、STATE、checkpoint 与 evidence 均未进入实现 commit。
- targeted regression、offline audits、production build 与五 URL readback 均通过。

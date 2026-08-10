---
phase: 565
quick_id: 260810-deepen-wancher-kyoto-urushi-asagao
status: complete
---

# Phase 565 完成记录

## 结果

在 caller-owned checkpoint copy 上深化了既有 canonical 型号 `phase519-wancher-kyoto-urushi-asagao`，没有创建同名实体，也没有把 Kyoto Urushi 的其他颜色合并进来。公开路由仍为 `wancher-kyoto-urushi-kasane-iro-asagao`，正文回读 4,134 字符。

正文与内容包现在明确区分：

- 官方 product id `9324911526103` 与 `kyoto-urushi-asagao` handle；No Clip、Chrome Clip、Gold Clip 三个商品 SKU（`WF-KYUR-DR-KAS-LB`、`WF-KYUR-DR-KAS-LB-CHCL`、`WF-KYUR-DR-KAS-LB-GDCL`）。
- Asagao／Kasane-iro 的命名背景与商品页事实；没有把 Kasane no Irome 背景写成固定色卡或漆液配方。
- Ebonite 笔体与 Urushi 工艺的身份边界、#6 JoWo、Wancher 18K、Keiryu、Keiryu Kodachi、Shogun 18K 笔尖菜单，以及 Plastic／黑 Ebonite／红 Ebonite feed 的可选差异。
- 欧规墨囊／转换器、气密帽、包装、维护、选购和二手核对；对商品页未公开的尺寸、重量、漆层参数、完整制造流程和独立书写体验保留未知边界。

内容通过既有 `CuratedEntityPack`、`recordEntityContentReview`（fact/language/media）和 `publishEntity` 路径发布，保持唯一 Wancher `made_by` 与唯一品牌反向导航。继续复用现有本站原创 factual SVG；它明确是非产品照片、非 Logo、非真实比例图和非颜色校样。

## 发布证据

- 首次 apply：`published`。
- 第二次 replay：`noop`。
- 内容哈希：`sha256:v3:8a4b7a0347c1a7599b1c29711a47011ce871174d1e26c58e7a08ed88b74c1669`。
- 回读：publication 为 `published`，reviewed contract version 为 3，`publishable=1`、`blocker_count=0`；12 个变体、1 个型号规格、1 张 approved primary media、7 条 approved 来源；fact/language/media/publication 当前审核均 approved。

证据文件保存在本 quick 的 `evidence/`：`first-run.json`、`replay.json`、`readback.txt`、`sqlite-integrity.txt`。

## 离线验收

- 定向测试：`pnpm exec tsx --test tests/content/phase565-wancher-kyoto-urushi-asagao.test.ts`，1/1 通过；覆盖 canonical identity、正文边界、来源／变体／规格／媒体、审核发布门、唯一关系、幂等 replay、远程环境拒绝和真实库快照保护。
- TypeScript：`pnpm exec tsc --noEmit` 通过本批文件检查；输出为空，退出码 0。
- Biome、SVG XML 检查、`git diff --check`：通过。
- 生产构建：`pnpm run build` 通过，Next.js 15.5.18 完成 18 个静态页面生成并准备 standalone libsql runtime。
- `check-library-contract.ts`：通过；sources 3,760、sourceItems 5,649、claims 6,911、citations 15,728、stories 837、events 1,149、media 1,105、aliases 2,822。
- `check-data-contract.ts`：通过；实体类型为 article 275、brand 119、concept 13、nib 3、pen 685。
- `audit-entity-quality.ts --json`：809 条 inventory，786 active，23 retired lineage excluded；duplicate groups 0、suspicious pen articles 0、thin entities 0、broken links 0。
- `audit-library-coverage.ts --json`：brand 119（115 ready、4 retired donor gap）；pen 690（671 ready、3 starter、16 retired donor gap）。该审计退出码为 1 是既有 backlog 信号，不是本批目标失败。
- `audit-readiness-v2.ts`：809 audited、786 public/content-ready/published、0 public blockers、23 backlog；`content_complete=false` 仍准确反映全量 goal 尚未完成。

## 数据库保护

- 本批唯一写入：`.planning/quick/260810-deepen-wancher-kyoto-urushi-asagao/evidence/checkpoint/owned-root/catalog-phase565-asagao.db`，checkpoint SHA-256 为 `22b2e723b953692d0db7b124b3b3fc256db769e4d59295a060d9ddb8e3f6c5e2`。
- 真实 `data/fpkg.db` SHA-256 前后均为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；没有写入真实库、Turso、生产或线上站点。
- 未删除、覆盖或暂存其他 agent 的 research、`.next-phase*` 或受保护的 Montblanc quick 目录。

## 全量目标边界

本 Phase 只完成一个已有 Wancher SKU 的离线内容深化与 checkpoint 验证，不能代表全量 goal 完成。仍需继续处理未充分覆盖的真实品牌／型号与 starter，汇总并正式迁移已验证内容到真实资料库，恢复 Turso 后做远端迁移与读回，随后完成全站自动检查、真人遍历、生产部署和线上逐条复查；在这些证据齐全前不调用 `update_goal({status:"complete"})`。

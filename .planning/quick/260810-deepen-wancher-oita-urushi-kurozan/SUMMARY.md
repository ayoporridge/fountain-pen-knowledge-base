---
phase: 566
quick_id: 260810-deepen-wancher-oita-urushi-kurozan
status: complete
---

# Phase 566 完成记录

## 结果

在 caller-owned checkpoint copy 上深化了既有 canonical 型号 `phase521-wancher-oita-urushi-kurozan`，没有创建同名实体，也没有重新启用 Phase 545 已退休的 `phase524-wancher-oita-urushi-kurozan` donor。公开路由保持 `wancher-oita-urushi-kurozan-fountain-pen`，发布正文回读 4,790 字符。

正文现在把 Kurozan 拆成可核对的几层：

- exact product 身份：product id `9241757057239`、handle `oita-urushi-kurozan-fountain-pen`、默认 SKU `WF-DR-OTA-KZ-BARA`。
- 工艺和材料：Ebonite、Oita Urushi、炭粉黑底、朱红点缀、Shikake-bera 旋涡与手工纹理差异；明确这不是政府地理认证或固定色卡。
- 配置边界：JoWo #6、Keiryu、Keiryu Kodachi、18K Shogun；JoWo 只配 Ebonite feed，其余特殊尖面按官方菜单配 Plastic feed；供墨为 converter 或 European International Standard cartridge。
- 版本和购买边界：价格/库存只代表抓取窗口；补充订单记录、二手核验、上墨清洗、漆面维护、写感未知项和原创示意图的非照片边界。

没有从图片或相邻 Wancher 漆艺商品补写尺寸、重量、漆层配方、正式发布日期、固定线宽或独立长期写感。现有 factual SVG 继续作为本站原创材料/配置/护理示意图，明确非产品照片、非比例图、非色卡。

## 发布证据

- 首次 apply：`published`。
- 第二次 replay：`noop`。
- 内容哈希：`sha256:v3:eca74ab606b018573cf94006bfe1655a60864f3c1dcebb07ea1b3b55ada64cfa`。
- 回读：publication 为 `published`，reviewed contract version 为 3，`publishable=1`、`blocker_count=0`；8 个变体（1 edition group、1 market SKU、2 material、4 nib）、1 个型号规格、1 张 approved primary media、7 条 approved 来源；当前 fact/language/media/publication 审核均 approved。
- 重复 donor `phase524-wancher-oita-urushi-kurozan` 仍为 `retired`，`blockers_json=["taxonomy_merged"]`。

证据文件保存在本 quick 的 `evidence/`：`first-run.json`、`replay.json`、`readback.txt`、`sqlite-integrity.txt`。

## 离线验收

- 定向测试：`pnpm exec tsx --test tests/content/phase566-wancher-oita-urushi-kurozan.test.ts`，1/1 通过（约 27 秒）；覆盖 owned copy、远程环境拒绝、canonical/duplicate identity、正文、来源/变体/规格/媒体、唯一 Wancher 双向关系、审核发布门、幂等 replay 和真实库快照保护。
- TypeScript：`pnpm exec tsc --noEmit` 退出码 0，输出为空。
- Biome、SVG XML 检查、`git diff --check`：通过。
- 生产构建：`pnpm run build` 通过，Next.js 15.5.18 完成 18 个静态页面生成并准备 standalone libsql runtime。
- `check-library-contract.ts`：通过；sources 3,760、sourceItems 5,649、claims 6,911、citations 15,728、stories 837、events 1,149、media 1,105、aliases 2,822。
- `check-data-contract.ts`：通过；实体类型为 article 275、brand 119、concept 13、nib 3、pen 685。
- `audit-entity-quality.ts --json`：809 条 inventory，786 active，23 retired lineage excluded；duplicate groups 0、suspicious pen articles 0、thin entities 0、broken links 0。
- `audit-library-coverage.ts --json`：brand 119（115 ready、4 retired donor gap）；pen 690（671 ready、3 starter、16 retired donor gap）。退出码 1 仍只是既有 backlog 信号。
- `audit-readiness-v2.ts`：809 audited、786 public/content-ready/published、0 public blockers、23 backlog；`inventory_complete=true`、`public_clean=true`、`content_complete=false`、`complete=false`。

## 数据库保护

- 本批唯一写入：`.planning/quick/260810-deepen-wancher-oita-urushi-kurozan/evidence/checkpoint/owned-root/catalog-phase566-kurozan.db`，checkpoint SHA-256 为 `728fb859232b179415b0227d0e948619b9b025c31a220b77140a90edbf173086`。
- 真实 `data/fpkg.db` SHA-256 前后均为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；没有写入真实库、Turso、生产或线上站点。
- 未删除、覆盖或暂存其他 agent 的 research、`.next-phase*` 或受保护的 Montblanc quick 目录。

## 全量目标边界

本 Phase 只完成一个已有 Wancher SKU 的离线内容深化与 checkpoint 验证，不能代表全量 goal 完成。仍需继续处理未充分覆盖的真实品牌／型号与 starter，汇总并正式迁移已验证内容到真实资料库，恢复 Turso 后做远端迁移与读回，随后完成全站自动检查、真人遍历、生产部署和线上逐条复查；在这些证据齐全前不调用 `update_goal({status:"complete"})`。

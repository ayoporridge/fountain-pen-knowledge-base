---
quick_id: 260811-tzr
status: complete
implementation_commit: e9dbcc84
completed_at: "2026-08-12T17:12:09+08:00"
scope: direct-content-repair
phase_number: 598
---

# Phase 598 Summary：IKKAKU by Nahvalur 系列与十六个型号

## Outcome

在 Phase 597 caller-owned checkpoint 的独立 copy 上完成 Nahvalur 品牌深化，并建立 `/article/ikkaku-by-nahvalur` 系列导航和十六个 canonical 型号。IKKAKU 保持 Nahvalur 的高端产品系列，不新增错误的第二品牌；每支钢笔只有一个 `made_by` Nahvalur，并通过 `member_of_series` 链接系列导航。实现提交为 `e9dbcc84 feat(content): add IKKAKU by Nahvalur series`，仅包含计划声明的 39 个实现文件。

本批未打开或写入真实 `data/fpkg.db`，未访问 Turso，未扩建通用 runner、Playwright 或 readiness 基础设施。Phase 598 完成只代表一个内容批次完成，full-corpus goal 继续 active。

## Content and identity

- 写入十九份研究／中文正文和十七张互不相同的 1600×900 本站原创事实示意图；全部图像明确标注为非产品照片。
- 当前九款为 Ye-Yu、Pan-Long、Blue Moon、Green Moon、Blood Moon、Dragonfly、Cherry Blossom、Year of the Snake、Year of the Horse。
- 历史七款为 Gradient Urushi、Exclusive Sunburst、Ying-Chun、Lan-Yue Crossflex、Yu-Tu、Rhinoceros Skin Lacquer、Raden Eggshell Black Urushi。
- Gradient Urushi 保持一个 canonical page，并以三组 edition、两个 exact market SKU 和四种笔尖选项表达版本，不制造三篇重复正文。
- Moon Trilogy、生肖版和其他历史型号保持独立产品身份；Lan-Yue Crossflex 与后来的 Blue Moon、Ying-Chun 与 La-Mei、Rhinoceros 的限量和重量冲突均以结构化 evidence／conflict 保存。
- 系列导航沿用 article 的 legacy public 语义，不伪造 migration 032 只为 brand／pen 设置的 publication row；十六支 pen 仍严格通过 fact、language、media、publication 四项 review 与 `publishEntity`。

## Safety and replay evidence

- Phase 597 source checkpoint main SHA-256：`50f8ae9c81999e5341d788426af2c6333fe5e6affd9919fd198b1c213a3b701b`。
- 真实 `data/fpkg.db` main SHA-256：`acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。
- Phase 598 persistent checkpoint main SHA-256：`2cfb3e760b286b3136730eefa8c15d0e2f1395f426da7f380744d0d91a5658eb`。
- source checkpoint 与真实库 main hash 在全部测试、回放、审计、构建和页面回读前后保持不变。
- wrapper 对实体 ID、slug、名称、alias 四类 collision 和三类 remote selector fail closed；测试只把真实库复制为临时 protected guard，wrapper 不接收真实库路径。
- persistent first apply 的品牌、十六个型号和系列导航共十八个结果全部为 `published`；同一 checkpoint 完整 replay 十八个结果全部为 `noop`，content hash 逐项一致。

## Verification

- Phase 598 定向回归：1/1 PASS，`663734.408542 ms`；覆盖 collision、remote selector、first apply、replay、品牌型号 14→30、系列拓扑、四项 reviews、冲突、版本和既有十四个 Nahvalur 型号 digest 不变。
- TypeScript、目标 Biome、十七张 SVG 的 `xmllint`、39-path staged diff-check 全部通过。
- SQLite `integrity_check=ok`，foreign-key check 无行；current-public primary local path duplicate group 为 0。
- entity quality：833 个 active public entity；duplicate、thin、suspicious、broken made_by 均为 0，24 个 retired lineage 明确排除于 active gate 但继续列入总 backlog。
- library contract：3873 sources、5856 source items、7112 claims、16648 citations、886 stories、1221 events、1155 media 等均通过。
- public media audit：850 checked、850 healthy、0 failed。
- production build 通过，18/18 static pages 完成，standalone libsql native runtime 已准备。
- 隔离服务逐页回读品牌、系列导航和十六个型号，共十八个 URL 全部 HTTP 200；品牌页与系列页均含十六条型号链接。十七张 SVG 全部 HTTP 200、`image/svg+xml`，HTTP SHA-256 与磁盘文件逐张一致。
- 十七张 SVG 拼图目视检查无裁切、错位或照片冒充；每张图的事实范围和“非产品照片”声明可见。

## Readiness boundary

- Inventory：857（119 brands + 738 pens）。
- Published / content-ready / public：833。
- Published blockers：0；public blockers：0。
- Backlog：24 个 retired lineage。
- `inventory_complete=true` 与 `public_clean=true` 只证明当前候选库存和公开子集干净；由于 retired lineage 和外部覆盖尚未封板，审计继续给出 `content_complete=false`、`complete=false`，并按设计返回 exit 1。

## Deviations resolved

- 首轮测试依次暴露并修复正文内部字段词、品牌 canonical name、SVG independence key、pack scope key、conflict citation key、专业二级来源组、历史型号 primary/archive 组和 article publication 语义；没有降低发布门槛。
- article replay 最后因状态查询错误使用 `JOIN entity_publications` 而每次重写；改为 `LEFT JOIN` 后完整回归和 persistent replay 均为 noop。
- 真实库 SHM 的外部 mtime／ctime 刷新会制造假阳性；测试改用临时 protected guard，并仍对真实 main/WAL/SHM 的存在、大小、inode 和字节 hash 做外层内容指纹检查，没有放松真实 main hash 保护。
- staged diff-check 发现十三篇 owned Markdown 末尾多余空行后精确删除；被 `.gitignore` 排除的 `scripts/data` 文件按既有内容包模式显式加入，最终 staged allowlist 恰为 39 个文件。

## Remaining full-goal work

- 继续从官方产品目录和现有 research 差集收口真正未覆盖的重要品牌／型号，并处理 24 个 retired lineage 的最终处置证据。
- 外部覆盖封板后，备份并正式迁移真实本地资料库，再执行全量自动检查和真人全部公开页面遍历。
- Turso 可用且迁移门满足后同步远端，部署生产并线上逐条回读正文、关系和媒体。full-corpus goal 保持 active，不能以本批提交标记完成。

---
status: complete
quick_id: 260811-ef3
scope: direct-content-repair
---

# 补齐 LAMY accent、joy、nexx 与 scala 来源化型号页

本 quick 在不连接 Turso、不写真实 `data/fpkg.db` 的前提下，补齐了 LAMY 当前官方目录中缺失的四个独立型号。它只代表一个离线内容批次完成，不代表全量 goal 完成。

## 已完成

- 新增 accent、joy、nexx、scala 四篇自然中文正文，覆盖型号身份、可核实规格、时间证据、版本边界、使用维护与购买建议；官方具体页面的尺寸、重量、尖材和附件只绑定对应 SKU／地区页面。
- 为四支笔分别建立 scopes、core claims、variants、逐字段 spec evidence、官方与独立专业二手来源，明确 accent 钢尖／金尖、joy 单笔／三尖礼盒、nexx／nexx M、scala standard steel／premium 14K 的边界。
- 新增四张互不重复的 1600×900 站内原创 SVG，均在画面内写明“非产品照片”及非比例、非颜色／库存证明等边界；逐张 rasterize 后目视检查无裁切或文字溢出。
- 新建四个精确 pen 实体，分别建立唯一 `made_by → LAMY` 和品牌 reverse 导航；复用 Phase 426 LAMY 品牌包，在拓扑变更后重新走 fact、language、media reviews 与 `publishEntity`，没有直接改 publication 状态。
- apply wrapper 在任何写入前拒绝 Turso／远端变量、真实库、symlink、hard-link、越界 owned root、错误 client 和未迁移 catalog；身份、slug、名称和 alias 冲突均 fail closed。

## 离线候选与验收

- Phase 583 候选叠加 Phase 584 后的 checkpoint SHA-256：`7693306e731e1efdd6159383f94f3bc0fddcdd4915403c5cd2f3357ceec58ea8`。
- 真实 `data/fpkg.db` SHA-256 始终为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；没有真实库写入，也没有 Turso 请求。
- 定向测试验证了 remote refusal、collision refusal、首次发布、五包读回、四类 current-hash review、唯一 maker／reverse／spec／primary media、品牌公开集合净增四个与 replay 全部 `noop`。
- 离线库存现为 119 个品牌、694 个型号；813 个品牌／型号记录中，789 个当前公开条目全部 ready，published blocker 为 0；24 个 retired lineage 保留且不重新发布。
- 新页面正文长度为 2,327–2,575 字符；四页均 `published`、`publishable=1`、`blocker_count=0`。LAMY 品牌当前公开型号数为 15。
- SQLite `integrity_check=ok`；公开 story 的 raw `## model_specs` 残留为 0。媒体审计 805/805 健康、0 失败。
- TypeScript、Biome、SVG XML、diff check 与 production build 通过。production server 实际读取 `/pen/lamy-accent`、`/pen/lamy-joy`、`/pen/lamy-nexx`、`/pen/lamy-scala`、`/brand/lamy`，五页均 200、无 server error／404，品牌页含四条新型号链接；四张 SVG 均以 `image/svg+xml` 返回。

完整 readiness 与媒体报告留在本 quick 的未提交 evidence 目录，候选数据库留在未提交 checkpoint 目录，后续可继续叠加离线包。

## 仍未完成

- 真实库正式迁移、Turso 远端回读、生产部署和线上逐条复查必须等额度恢复后执行。
- 现有实体主表仍有 195 份历史 `body_md` 包含 raw `## model_specs` 副本；Phase 583 已清除实际渲染的 published story，因此当前页面不显示这些 JSON。全量 goal 仍应以独立、可审核的迁移规范化这批非渲染副本，不能把本批 LAMY 提交冒充全库清理。
- 其余真正缺失的重要型号、低质量正文、身份／图片问题仍需继续按来源差集处理；全量 goal 保持 active。

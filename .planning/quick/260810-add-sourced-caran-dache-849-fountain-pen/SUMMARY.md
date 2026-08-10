# Phase 563 Summary — Caran d’Ache 849 Fountain Pen

## 状态

本批离线内容包已完成并准备提交。未连接 Turso，未写入真实 `data/fpkg.db`，未部署或做线上复查；全量 Fountain Pen Knowledge Graph goal 仍未完成。

## 交付

- 新增 `Caran d’Ache 849 Fountain Pen` 型号实体，复用已审核的 `phase139-brand-caran-dache` 品牌；建立唯一双向 `made_by` / 品牌导航关系。
- 正文区分 849 钢笔与 849 圆珠笔、机械铅笔、滚珠笔，以及 Ecridor / Léman；记录六角铝制笔身与笔帽、塑料握位、不锈钢尖、墨囊与 `ink pump`（转换器）边界、瑞士制造、颜色／市场／时间性价格和维护保修。
- 收录官方当前可核对的 7 个型号层变体：Metal Blue EF/F/M/B 四个 SKU、Black Code F/M 两个参考号，以及 849 钢笔颜色家族导航；不把颜色或尖幅拆成独立实体。
- 加入带 `non-photo`、`non-logo`、`not-to-scale`、`non-colour-proof` 标记的本站原创 factual SVG，不把示意图冒充产品摄影或颜色校样。
- 资料分层包含 Caran d’Ache exact product pages、849 Family、Ecridor 边界页、FAQ、官方条款、2024 Fine Writing catalogue，以及 Pen Chalet / The Pen Addict 的署名专业二级评测；评测中的尺寸和书写结论均限定为样本观察。

## 验证证据

- owned checkpoint 首次运行品牌与 849 均为 `published`；replay 两者均为 `noop`，内容 hash 保持：849 `sha256:v3:28f428ffb124d41b10e43f8cacf742722ddeb2c42307a9d65ba0211873eb4186`。
- checkpoint 读回：849 `published`、`publishable=1`、`blocker_count=0`、`is_public=1`，正文 6450 字符，11 个来源引用，7 个版本，fact/language/media/publication 审核均为 `approved`。
- 定向测试通过；`pnpm exec tsc --noEmit`、Biome、SVG XML、`git diff --check`、生产 `pnpm run build` 通过。
- 离线 readiness / coverage / quality / library / data 审计：809 个实体（119 brands、690 pens），786 个公开且可发布，0 个 published/public blocker；23 个 backlog 仍是既有 retired donor。quality 诊断为 0 duplicate groups、0 suspicious pen articles、0 thin active entities、0 broken `made_by` links。全量 verdict 仍为 `content_complete=false`、`complete=false`。
- 真实 `data/fpkg.db` SHA-256 在本批前后保持 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。

## 边界

本批只证明 849 内容包可以在受保护副本中通过审核—发布链路并可重放，不证明真实库已经迁移、Turso 已回读、生产站点已部署，也不证明全站内容修复完成。后续继续在额度恢复前处理其他缺失或证据不足型号；额度恢复后再进行正式迁移、远端读回、部署、真人遍历和线上逐页复查。

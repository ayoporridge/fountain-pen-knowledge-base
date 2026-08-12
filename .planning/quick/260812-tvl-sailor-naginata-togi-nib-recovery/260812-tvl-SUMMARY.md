---
status: complete
quick_id: 260812-tvl
phase_number: 603
---

# Quick 260812-tvl Summary

## Outcome

Phase 603 恢复 Sailor Naginata-Togi（长刀研）为独立 published nib 条目。官方资料表明它是可跨 10-7121、Bespoke 与 KOP 产品出现的 Special Nib／研磨体系，不是其中任意一支整笔；因此复用原 nib ID 与 slug，不把它合并到 10-7121，也不把第三方 Naginata-style grind 混入 Sailor 身份。

内容包新增自然中文正文、官方与可靠二手来源、别名、与 10-7121 的关系及一张 1600×900 事实示意图，并通过 `recordEntityContentReview` 与 `publishEntity` 完成 fact／language／media 审核。旧路由层的强制 hard-404 已移除，使已发布 nib 能通过通用实体页访问。

所有数据库写入仅发生在 Phase 602 caller-owned checkpoint copy；真实 `data/fpkg.db` 未写入，Turso 未访问。

## Verification

- 定向回归 1/1 PASS；覆盖名称／别名冲突、三类 remote selector 拒绝、首次发布、完整 replay no-op、来源／主图／关系、10-7121 publication hash 不变，以及旧 hard-404 已移除。
- 持久 checkpoint 首次 apply 为 `published`，replay 为 `noop`；publication hash 均为 `sha256:v3:0e8037eac876a546fead543da9ba4a444132c4be7ba2280ad5334c58d6ba4ae1`。
- 最终 checkpoint SHA-256：`1fca38d561e419c2583029779a78193a6bfe2faa61b5e7e12c1eae956afaba2b`。
- Phase 602 source SHA-256 仍为 `c80141cabc2d9f3f46c455d1cc3ae30a7d5983db2d938585861e544ff9db36f7`；真实库仍为 `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`。
- SQLite integrity `ok`、foreign key 0；TypeScript、Biome、xmllint、diff check 与 production build（18/18 static pages）通过。
- `/nib/sailor-naginata-togi` 与 `/pen/sailor-naginata-togi-10-7121` 均 HTTP 200；nib 页回读 Special Nib、1991、10-7121、Bespoke、KOP 等关键标记。
- SVG 原文件与 HTTP 响应 SHA-256 同为 `f077a059276382eb593a58e6f65a4c611c1798d8b9b26329d27e2366e8a6b1b2`；原生 1600×900 目视无裁切或错位。
- `public_entities` 总数 1118，brand／pen 仍为 849；public media dry-run 866/866 healthy。

## Remaining Queue

已知未决身份降至 5 条：Shanghai、Banju、Saier、Yisihua、SKB派顿 F10／F21。完成这些裁决后继续外部品牌／型号覆盖冻结；正式迁移、全量真人遍历、部署与线上逐条复查仍未执行，full-corpus goal 保持 active。

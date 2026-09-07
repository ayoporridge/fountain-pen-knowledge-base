# Phase 619 Summary

本 quick 修复了公开百科中六个品牌页与具体型号页之间的模板化正文重复：当代 OMAS、当代 Delta、Santini Italia、HongDian、Kanwrite、Eboya。六个现有 brand entity 现在承担品牌导航职责；已有型号页的正文、规格、版本、来源、claims、media、timeline、relations 和 identity 均保留。

## 结果

- 新的六份品牌-only Markdown 均通过 pack 约束：body 至少 2,600 Unicode 字符、文件至少 3,500 字符，并保持至少三组独立来源。
- 安装后六页正文长度为：OMAS 2,984、Delta 3,118、Santini 3,037、HongDian 3,210、Kanwrite 2,763、Eboya 2,825。
- `tests/content/phase619-brand-model-dedup.test.ts` 通过（1/1）：六个目标首次均为 `published`，replay 全部 `noop`；品牌 identity、反向 navigation、审核与 publication 状态均通过。代表型号正文逐字保持不变：OMAS Ogiva 2,091、Delta Dolcevita Mid-Size 2,241、Santini Libra Intenso 2,258、HongDian N7 Rabbit 2,966、Kanwrite Heritage 2,211、Eboya HOUJU M 2,383。
- 安装后关系总量仍为 1,644；目标品牌的 references、claims、scopes、media、timeline payload 与原拓扑保持一致。品牌—型号公开正文的重复组为 0；SQLite integrity 与 foreign-key check 均通过。

## 正式本地迁移与回读

- 所有迁移和 apply 均在 `.planning/quick/260907-i99-de-template-brand-model-pages/formal-local-v2/` 的 owned disposable copy 上完成，并经过 032 migration、data contract、article/content、public boundary、library、migrations、evidence contract、publication gate、entity quality、public media 和 Markdown verification gates。
- 真实库已做原子本地安装。安装前 `data/fpkg.db` SHA-256 为 `2ad7654ca4109f7fef42b9ec0234c4d01a499a8d8bef9d96b64344314c4c4836`（93,970,432 bytes），回滚备份位于 `formal-local-v2/real-preinstall-fpkg.db`；安装后 SHA-256 为 `272331bb03df6f21ab324e04c963f70755a6a5e554056a01f70baea7bd86724b`（94,052,352 bytes）。
- 安装后直接读取六个目标 brand rows，确认 `contract_version=3`、fact/language/media reviews approved、publication `published`、content revisions 对齐；受保护 catalog 的 entity_links fingerprint 未变化。

## 构建与路由

- `pnpm build` 通过（Next.js 15.5.18，生成 18 个页面并准备 standalone runtime）。清空 Turso 相关环境变量启动本地生产服务后，六个品牌页、六个代表型号页及 `/api/entities/{current-omas,hongdian,kanwrite,eboya}` 均返回 HTTP 200。

## 边界

本阶段只证明本机真实 SQLite、构建和本地生产路由；Turso SQL read 仍被服务端拒绝（`BLOCKED: Operation was blocked: SQL read operations are forbidden`），因此未声称远端迁移、部署或线上回读完成。全量内容 goal 仍保持 active；工作区中与本阶段无关的既有修改和未跟踪研究目录均未纳入本阶段提交。

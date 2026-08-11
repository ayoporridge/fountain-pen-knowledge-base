---
quick_id: 260811-fm7
status: complete
completed: 2026-08-11
scope: public-content-residue-cleanup
---

# Phase 585：规范化公开实体主表的 raw model_specs 副本

## 结果

在 Phase 584 caller-owned checkpoint 的新副本上，精确清除了 195 个当前公开
brand／pen 的 `entities.body_md` 中完整 `## model_specs` JSON section：180 个 pen、
15 个 brand、共 195 个 block。Phase 583 已清理的 published story 保持逐字不变；
180 条结构化 `model_specs` 保留，15 个 brand 仍为 0 条结构化型号规格。4 条 retired
lineage 的历史 residue 明确保留，不重新发布。

正文更新后，每个目标都重新记录 current-hash fact、language、media review，并通过
`publishEntity` 写入 publication review、恢复 `published`；脚本没有直接把 publication
状态改成 published。最终 195 个目标全部 public、ready，实体正文与对应 published
story 对齐；CLI replay 为 0 条变更。

## 候选与安全边界

- 最终候选：`checkpoint-r4/catalog.db`，SHA-256
  `f09703b1d175587fad0803fb3b3e01f5427aac5914e738c08c40cfe9b7adc87c`。
- 上游 Phase 584 候选 SHA-256：
  `7693306e731e1efdd6159383f94f3bc0fddcdd4915403c5cd2f3357ceec58ea8`。
- 真实 `data/fpkg.db` SHA-256 始终为
  `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；没有真实库写入，
  没有 Turso 请求。
- wrapper 在首个写事务前拒绝 remote env、真实库、symlink、hard-link、越界 owned
  root、错误 client 与未迁移 catalog；remote-refusal 后 owned copy 哈希不变。
- 清理器复用 Phase 583 的严格 JSON parser，只删除完整、可解析 section；清理后
  pen 正文下限 1,400 字符、brand 下限 2,000 字符。

## 验收

- 完整首跑执行了 195 条清理、780 条 current review／publication review，并通过
  wrapper 内全部 post-publication 校验。测试随后只因两条过时的样本文本断言失败；
  断言已按当前深化正文修正，完成态定向测试与 replay 为 1 passed、1 intentional skip、
  0 failed。没有为了重复相同数据库写入再跑一次 43 分钟首跑。
- SQLite `integrity_check=ok`；当前 published entity residue 0、published story residue 0、
  retired entity residue 4、published blockers 0。
- readiness：813 个品牌／型号进入审计，119 brands、694 pens；789 个当前公开条目全部
  content-ready、published、public，published/public blockers 均为 0；24 条 backlog 全为
  retired lineage。
- quality：789 active、24 retired excluded；duplicate groups 0、suspicious pen articles 0、
  thin entities 0、broken `made_by` links 0。
- media：805/805 healthy、0 failed；Library contract 通过（3,744 sources、5,635 source
  items、6,952 claims、15,843 citations、841 stories、1,159 events、1,110 media）。
- TypeScript 与目标 Biome 通过。现有 Phase 584 production build 读取 Phase 585 候选后，
  `/pen/wancher-tsuikin-kanhizakura`、`/pen/caran-dache-ecridor`、`/brand/lamy` 均为
  200、唯一 H1、无 raw heading／server error；实体 API 为 200，并继续只公开身份字段。

首个阈值预检副本、被中止的慢路径副本以及一次并发打开同一 WAL 后触发 `SIGBUS` 的副本
均保留在本 quick 内，不删除、不提交，也不作为成功证据。最终 r4 在测试运行期间保持独占，
未复现原生崩溃。

## 全量 goal 边界

本 quick 只完成历史 entity-body residue 规范化，不代表全站内容 goal 完成。Turso 恢复前
仍可继续做官方目录差集、缺失型号内容包、身份与图片修复、完整离线候选重放、本地自动检查、
本地人工遍历，以及所有内容收口后的真实本地库正式迁移。必须等待 Turso 的只有云端正式
同步与远端回读、依赖云库的生产部署和线上逐条复查；goal 保持 active。

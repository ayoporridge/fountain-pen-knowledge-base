# Phase 487 执行摘要

## 结果

已在 owned checkpoint copy 完成并验证三项已有型号的来源化深化：

| 型号 | entity id | slug | 正文字符 | approved 引用 | primary 主图 |
| --- | --- | --- | ---: | ---: | ---: |
| TWSBI VAC700R | `16So7O06Q6K1` | `twsbi-vac700r` | 2928 | 9 | 1 |
| Noodler's Nib Creaper | `dLplUlM5weWq` | `noodlers-nib-creaper` | 2807 | 11 | 1 |
| Jinhao 9019 Dadao | `phase90-pen-jinhao-9019` | `jinhao-9019-dadao` | 2813 | 7 | 1 |

三者均保持 `pen` 类型、canonical slug 和既有品牌身份；每个型号各有且仅有一个 `made_by` 与一个品牌反向 `reverse` 导航。主图分别为既有站内原创示意图，状态为 `approved` + `primary`。

## 发布与幂等证据

第一次运行 `scripts/apply-phase487-twsbi-vac700r-noodlers-creaper-jinhao9019-depth.ts`：

- `16So7O06Q6K1` → `published`，hash `sha256:v3:4556c49f6263b11855d476ae6347247026d43942a4baa2015032478d1b41690f`
- `dLplUlM5weWq` → `published`，hash `sha256:v3:c8490abd7d174e521482b1ad82d678b0a5dec723880aca96d2676d49ea25fb03`
- `phase90-pen-jinhao-9019` → `published`，hash `sha256:v3:0590232334414eb7678ae4108e516d5dceb9d20f05cc5882cc3bfd1fa481d63a`

第二次运行对三者均返回 `noop`，hash 保持不变。应用路径使用 `recordEntityContentReview`（fact/language/media）和 `publishEntity`，没有绕过 publication guard。

## Checkpoint 与质量检查

Checkpoint：`.planning/quick/260804-iz2-continue-full-fountain-pen-knowledge-gra/checkpoint/checkpoint.db`

- `PRAGMA integrity_check`：`ok`
- `PRAGMA foreign_key_check`：0 条
- `check-library-contract.ts`：OK；sources 2800、sourceItems 4565、claims 4660、citations 11867、media 986、aliases 2407、commonsMedia 4。
- `audit-entity-quality.ts --json`：690 entities，668 active，22 retired；duplicateGroups 0、suspiciousPenArticles 0、thinEntities 0、brokenLinks 0；668 active 均 published/ready，published blockers 0。
- 审计 provenance：source/audit schema migration 均为 035，数据库类型为 `owned_disposable_migrated_copy`。
- 定向 Biome：通过（测试文件；`scripts/data` 目录按项目既有配置被忽略）。
- 全量 `tsc --noEmit --pretty false`：仅复现既有 3 个基线错误：`phase346-jinhao-x450-x750.test.ts` 两个 TS7022，以及 `sync-local-catalog-to-turso.test.ts` 的 NODE_ENV TS2741；本批没有新增错误。
- 本批文件 `git diff --check`：clean。

## 真实库保护

真实 `data/fpkg.db` 在本批前后 hash 均为：

`d93136ec6e5f12812b795f59b549b74d889a8b6d4dbd2c9071304a8107964c77`

本批没有把试验内容写入真实库，也没有进行 Turso 迁移、部署或线上复查。远程 quota 已重置，但远程迁移应留到本地内容批次和正式迁移门槛都完成后执行。

## 全量 goal 边界

Phase 487 只完成三个型号的一个内容批次。所有公开品牌/型号的覆盖审计、剩余空壳和低信息条目、缺失重要品牌/型号、正式 Turso 迁移、全量自动检查、真人遍历、生产部署和线上逐条复查仍未完成；不能以本批结果调用 `update_goal({status: "complete"})`。

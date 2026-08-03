# Phase 423 执行摘要

状态：已完成本批次 owned checkpoint 验证；尚未迁移真实资料库。
范围：Wancher World Tree / Sekai 五个已有木材 SKU；真实 `data/fpkg.db` 不得写入。

## 预期结果

- 品牌 1 个 + 型号 5 个，共 6 个 pack；
- 每个型号正文至少 5,000 Unicode 字符，来源/独立组至少 10，variants 至少 3；
- 关系、四类当前 hash 审核、发布 revision、contract 3 和 readiness 全部通过；
- 重放为 noop，真实 catalog snapshot/hash 保持不变。

## 实际证据

首次 apply（r5）：品牌与五个型号均 `published`；品牌内容 hash 为 `sha256:v3:64270820ad195892a70bf26eb39912fbb49b702b1ad6e1257c6ee087c5a78897`。

| 实体 | 入库正文字符 | 来源/独立组 | variants | spec evidence | primary media | 内容 hash |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| World Tree – Ebony | 5,114 | 10 / 10 | 3 | 11 | 1 | `sha256:v3:9fe349eaa90f072292e89c4cb14855b23eb4b9b633b5bb308645c9c6c24f811f` |
| Sekai Ai | 5,230 | 10 / 10 | 3 | 12 | 1 | `sha256:v3:ebc2fe5da840eea6a4e84624eb192b47ce9f25332fcce84cae732b7137505a8e` |
| World Tree – Teak Wood | 5,068 | 10 / 10 | 3 | 12 | 1 | `sha256:v3:c77ef63cdb1d78f7aecfc3796b1308e1a186b4ba05cbe95771234c551c866f00` |
| World Tree – Verawood | 5,102 | 10 / 10 | 3 | 12 | 1 | `sha256:v3:4c319cf63ea71ae938d91596a881d40b3bb5d4a63b592db64c99c4102ab2d38a` |
| World Tree – Sandalwood | 5,155 | 10 / 10 | 3 | 12 | 1 | `sha256:v3:32495366f0f8b645eb3f7f7c278288fd6ba4dcd6226ec6e9e6d5499a65d89dac` |

品牌回读：9 references / 7 independence groups，`published`，revision `676` 对齐，contract 3，readiness `publishable=1` / `blocker_count=0`。

每个型号：`made_by` → Wancher 1 条、品牌 `reverse` 1 条；当前 hash 的 fact/language/media/publication 四类 review 全部 `approved`；revision 与 reviewed revision 对齐，contract 3，readiness `publishable=1` / `blocker_count=0`。`PRAGMA integrity_check` 返回 `ok`，owned 客户端主库确认是 `checkpoint-final-r5/fpkg.db`。

replay（r5）：品牌与五个型号全部 `noop`。

定向测试：`1/1` 通过，exit 0，约 `92.0s`；Biome check 通过。

TypeScript：应保持既有 3 条基线诊断。
真实数据库 SHA-256：apply 前后均为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。

## 提交边界

只暂存 Phase 423 研究文档、五篇正文、PLAN/SUMMARY、应用脚本、强制数据脚本和定向测试；不暂存任何 checkpoint 二进制，不触碰其他 agent 的 research 文件、`.next-phase*` 或受保护的 Montblanc quick 目录。

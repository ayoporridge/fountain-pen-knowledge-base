---
phase: 424
status: complete
created: 2026-08-03
---

# Phase 424 Summary

## 结果

已在 owned checkpoint copy 完成辉柏嘉普通 Fine Writing 品牌页及五个已有型号的内容深化；没有新增重复实体，也没有触碰 Graf von Faber-Castell Classic。

- 品牌：`xVHzH0mMviM4` / `faber-castell`，正文 2,353 字符，8 个来源组，5 项规格证据，1 张原创主图。
- Ambition：`FBaxbvx7xTbo`，正文 5,134 字符，8 个来源组，3 个 variant，10 项规格证据，1 条 `made_by` 与 1 条反向导航。
- e-motion：`HhQgvkpTJhEc`，正文 5,138 字符，8 个来源组，3 个 variant，10 项规格证据，关系与主图通过。
- Ondoro：`wMSXKOxA9s2X`，正文 5,014 字符，9 个来源组，3 个 variant，10 项规格证据，关系与主图通过。
- NEO Slim：`O4AI01LTE75r`，正文 5,202 字符，9 个来源组，3 个 variant，10 项规格证据，关系与主图通过。
- LOOM：`TDLhXLvIOq6p`，正文 5,390 字符，8 个来源组，3 个 variant，10 项规格证据，关系与主图通过。

六个实体的 `fact`、`language`、`media`、`publication` reviews 均为当前 hash 的 `approved`；publication 的 reviewed revision 与 content revision 对齐，contract version 为 3，`publishable=1`、`blocker_count=0`。副本 `PRAGMA integrity_check` 为 `ok`，`PRAGMA database_list` 指向：

`.planning/quick/260803-vnj-faber-castell-refresh-owned-checkpoint/checkpoint-final-r2/fpkg.db`

首次 apply 的内容 hash：品牌 `sha256:v3:b97292a90bc97a6eebe24c68ab2edf8fe28afdcfc0c6822bfdaa169342995854`；Ambition `sha256:v3:69ce467223dbbc5a7ab56195db23af1ab6e33d043385326ec5d23be63785b8be`；e-motion `sha256:v3:f1b568bcbb1d01358c599a966ce26686a06c4b0a12cddbe8a416a43e680cef34`；Ondoro `sha256:v3:e40a771fc7447e5a2a1383df29e6453054383c1356173df83cdc509747c99f52`；NEO Slim `sha256:v3:fed246ef943e487bb8478275c31242852ec7114d8791ab02d8293ad0299bc6d0`；LOOM `sha256:v3:c5a84df063aceaf45a886d80c445ddbb9815eb45b62cc0476508fdedca3a046d`。同一副本第二次完整回放六个实体均为 `noop`。

定向回归：`pnpm exec biome check tests/content/phase424-faber-castell-refresh.test.ts` 通过；`pnpm exec tsx --test tests/content/phase424-faber-castell-refresh.test.ts` 为 1 pass / 0 fail。真实 `data/fpkg.db` 复制前后 SHA-256 均为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，试验没有写入真实库。

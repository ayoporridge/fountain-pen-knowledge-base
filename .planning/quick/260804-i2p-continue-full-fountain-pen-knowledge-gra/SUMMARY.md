# Phase 484：Chilton Wing-flow、Duke 551 Confucius、Hero 616

## 交付范围

本批只深化三个已有 canonical pen entity，没有新建重复实体，也没有把相似外形、题材或批次合并：

| entity | slug | 内容重点 |
| --- | --- | --- |
| `2XGqrpYS7j0c` | `the-chilton-wing-flow` | 1935–1937 广告/档案、环抱式尖的断裂风险、镶嵌和 5/5S/7/7½/8½ 编码、pneumatic filler |
| `s72DUKE551` | `duke-551-confucius` | 孔子主题竹身、木盒、超大 bent/fude、两缝三瓣尖、overfeed、converter 清洁与题材分流 |
| `T9E_wRGNepqk` | `hero-616` | 钢制 hooded nib、固定 squeeze filler、Parker 51 外形边界、616/616S/升级款批次和小窗 |

研究正文均保留自然中文、来源分层、历史、规格、版本、维护、选购和图片边界；既有 canonical SVG 原样复用，示意图没有被写成产品照片。

## 本批文件

- `.planning/content-research/chilton-wing-flow-phase484.md`
- `.planning/content-research/duke-551-confucius-phase484.md`
- `.planning/content-research/hero-616-phase484.md`
- `scripts/data/phase484-chilton-wingflow-duke551-hero616-depth.ts`
- `scripts/apply-phase484-chilton-wingflow-duke551-hero616-depth.ts`
- `tests/content/phase484-chilton-wingflow-duke551-hero616-depth.test.ts`

apply 脚本只接受 caller-owned、非 symlink checkpoint copy，拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN` 和 `FPKG_DATABASE_URL`，并通过 `recordEntityContentReview` 的 fact/language/media 三项与 `publishEntity` 发布；没有直接写 publication status。

## 验收证据

### 正文与内容包

按 Unicode 字符计数，研究文件总长度/`body_md` 长度分别为：

- Chilton Wing-flow：4,264 / 2,849；
- Duke 551 Confucius：4,332 / 2,810；
- Hero 616：4,227 / 2,800。

三包均通过 `## 来源`、至少两个 independence groups、无 `made_by`/内部数据库词检查；每包保留一张既有 primary media。

### 定向测试

命令：

```text
TURSO_DATABASE_URL='' TURSO_AUTH_TOKEN='' FPKG_DATABASE_URL='' NODE_ENV=test npx tsx --test tests/content/phase484-chilton-wingflow-duke551-hero616-depth.test.ts
```

结果：1/1 pass，约 40.7 秒。测试覆盖 owned checkpoint、远程环境拒绝、exact entity/type/slug、正文长度、approved references、唯一 primary media、`made_by`/`reverse`、四项 content review、contract version 3、publication hash、replay noop 与真实 `data/fpkg.db` 快照不变。

### 持久 checkpoint copy

路径：`.planning/quick/260804-i2p-continue-full-fountain-pen-knowledge-gra/checkpoint/checkpoint.db`

该 copy 从真实库复制而来；apply 首次结果：

```text
2XGqrpYS7j0c   published  sha256:v3:8d118658b24ad283ef70a2458acbb8d4decc485c5d7ba733a93ddaa0e6798cc5
s72DUKE551     published  sha256:v3:bc981ea7b71b0d90593ddaa3b55404892c464ab9ef472d1fd5bb146d3b563f42
T9E_wRGNepqk   published  sha256:v3:009cf710275ec08ae0094c3af7123eff93c14af93565e6faeab08c20b5040be2
```

第二次相同 CLI 调用三个实体均为 `noop`，hash 不变。checkpoint SQL 复核：

- `PRAGMA integrity_check`：`ok`；`pragma_foreign_key_check`：0；
- published body 字符数：Wing-flow 3368、Duke 551 3321、Hero 616 3297；
- 三个实体 `content_revision = reviewed_content_revision`、`reviewed_contract_version = 3`，publication status 均为 `published`；
- `check-library-contract.ts`：sources 2800、sourceItems 4565、claims 4665、citations 11875、stories 718、events 995、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2408、commonsMedia 4，`Library contract OK`；
- `audit-entity-quality.ts`：entities 690、active 668、retired excluded 22、duplicate name groups 0、suspicious pen articles 0、thin entities 0、made_by blockers 0。

### 工具检查

- 项目配置包含的 Phase 484 test 通过 Biome check；全量 TypeScript 未产生本批错误。
- `pnpm exec tsc --noEmit --pretty false --incremental false` 仍只报告既有基线三项：`tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022，以及 `tests/migration/sync-local-catalog-to-turso.test.ts:76` 的 NODE_ENV TS2741。

## 未完成边界

Phase 484 不是全量目标完成证明。以下工作仍未完成：

1. 其余低信息或错误身份的公开品牌/型号仍需继续按批研究和复核；
2. 本批尚未迁移进真实 `data/fpkg.db`，也未写入 Turso；
3. Turso 远端读写仍受 starter plan rows-read overage 的服务端阻断；
4. 全量内容包完成后的正式迁移、生产部署、真人逐页遍历、线上逐条复查和最终全站证据汇总仍待执行；
5. 因此不得将本批、任一 Phase 或单次测试通过标记为整体 goal 完成。

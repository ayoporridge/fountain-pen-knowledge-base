# Phase 485：Sailor Professional Gear KOP、SKB ES-520、Majohn V60

## 交付范围

本批只深化三个已有 canonical pen entity，没有新建重复实体，也没有把相似外形、书法尖或市场别名合并：

| entity | slug | 内容重点 |
| --- | --- | --- |
| `s39PGKOP9618` | `sailor-professional-gear-kop-10-9618` | 10-9618-420/620、超大型双色 21K、PMMA、φ20×142 mm、37.0 g、受注生产、平顶与 King Profit/普通 Pro Gear 边界 |
| `s61SKBES520` | `skb-es-520` | 55 度书法尖、垂直/倾斜线宽提示、RI-60/#301A 套装、环保回收料、台湾品牌时间线与 RS-301N 配件边界 |
| `CHLNJmZaZHB8` | `末匠-majohn-v60` | 三角截面与握位、活塞吸墨、#6 钢尖、Moonman 别名、OMAS 360 相似外形边界、清洗与维修风险 |

研究正文均保留自然中文、来源分层、规格、版本、维护、选购和图片边界；既有 canonical SVG 原样复用，示意图没有被写成产品照片。

## 本批文件

- `.planning/content-research/sailor-professional-gear-kop-phase485.md`
- `.planning/content-research/skb-es-520-phase485.md`
- `.planning/content-research/majohn-v60-phase485.md`
- `scripts/data/phase485-sailor-kop-skb-es520-majohn-v60-depth.ts`
- `scripts/apply-phase485-sailor-kop-skb-es520-majohn-v60-depth.ts`
- `tests/content/phase485-sailor-kop-skb-es520-majohn-v60-depth.test.ts`

apply 脚本只接受 caller-owned、非 symlink checkpoint copy，拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN` 和 `FPKG_DATABASE_URL`，并通过 `recordEntityContentReview` 的 fact/language/media 三项与 `publishEntity` 发布；没有直接写 publication status。

## 验收证据

### 正文与内容包

按 Unicode 字符计数，研究文件总长度/`body_md` 长度分别为：

- Sailor Professional Gear KOP：约 3,982 / 2,850；
- SKB ES-520：约 3,622 / 2,898；
- Majohn V60：约 3,671 / 2,956。

三包均通过 `## 来源`、至少两个 independence groups、无 `made_by`/内部数据库词检查；每包保留一张既有 primary media。数据包加载为 3 个已有 pen entity，来源数分别为 11、10、11，主媒体均 1 张。

### 定向测试

命令：

```text
pnpm exec tsx --test tests/content/phase485-sailor-kop-skb-es520-majohn-v60-depth.test.ts
```

结果：1/1 pass，约 38.4 秒。测试覆盖 owned checkpoint、远程环境拒绝、exact entity/type/slug、正文长度、approved references、唯一 primary media、`made_by`/`reverse`、四项 content review、contract version 3、publication hash、replay noop 与真实 `data/fpkg.db` 快照不变。

### 持久 checkpoint copy

路径：`.planning/quick/260804-id7-continue-full-fountain-pen-knowledge-gra/checkpoint/checkpoint.db`

该 copy 从真实库复制而来，复制前后真实库主文件 hash 均为 `d93136ec6e5f12812b795f59b549b74d889a8b6d4dbd2c9071304a8107964c77`。Phase 485 首次 apply 已在 checkpoint 发布，随后相同 CLI replay 三个实体均为 `noop`：

```text
s39PGKOP9618   noop   sha256:v3:a31b17b4a495fd653959f5f0392afdeec9805a1faf1c7465abd456488f2f894b
s61SKBES520    noop   sha256:v3:01c53889d1b27769659d02839f0b6e7ec9d57a50033b7ab2d8d9e875f309e73f
CHLNJmZaZHB8   noop   sha256:v3:b657e3bb21587f979e177190a269192f871f3ebefba104a0f0b01cc1cbbbe306
```

checkpoint SQL 复核：

- `PRAGMA integrity_check`：`ok`；`pragma_foreign_key_check`：0；
- published body 字符数：KOP 2847、ES-520 3000、V60 3014；
- 三个实体 `content_revision = reviewed_content_revision`、`reviewed_contract_version = 3`，publication status 均为 `published`；
- approved references：KOP 11、ES-520 10、V60 11；approved primary media：各 1。

### 全库 checkpoint 合同与质量

- `check-library-contract.ts --database-path <checkpoint>`：sources 2805、sourceItems 4570、claims 4666、citations 11876、stories 718、events 995、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2408、commonsMedia 4，`Library contract OK`；
- `audit-entity-quality.ts --database-path <checkpoint> --json`：entities 690、active 668、retired excluded 22、duplicate name groups 0、suspicious pen articles 0、thin entities 0、made_by blockers 0；published/public 668，published blockers 0。

### 工具检查

- 项目配置包含的 Phase 485 test 通过 Biome check；scripts/data 目录按 repo Biome 配置不在 processed files 中，模块加载和定向测试覆盖其 TypeScript 路径；
- `pnpm exec tsc --noEmit` 未产生本批错误，仍只报告既有基线三项：`tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022，以及 `tests/migration/sync-local-catalog-to-turso.test.ts:76` 的 NODE_ENV TS2741。

## 未完成边界

Phase 485 不是全量目标完成证明。以下工作仍未完成：

1. 其余低信息或错误身份的公开品牌/型号仍需继续按批研究和复核；
2. 本批尚未迁移进真实 `data/fpkg.db`，也未写入 Turso；
3. Turso 远端额度/读写状态需在用户确认重置后重新做受控迁移试验，当前没有把本批写入远端的证据；
4. 全量内容包完成后的正式迁移、生产部署、真人逐页遍历、线上逐条复查和最终全站证据汇总仍待执行；
5. 因此不得将本批、任一 Phase 或单次测试通过标记为整体 goal 完成。

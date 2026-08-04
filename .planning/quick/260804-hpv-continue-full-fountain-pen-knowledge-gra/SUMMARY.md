# Phase 483：Jinhao 82、Diplomat Elox、Parker T-1

## 交付范围

本批只深化三个已有 canonical pen entity，没有新建重复实体，也没有把相似外形或同色商品合并：

| entity | slug | 内容包 |
| --- | --- | --- |
| `czZTir9yNoeA` | `jinhao-82` | 当代小尺寸树脂/acrylic、旋帽、钢尖与墨囊/转换器；颜色、尖号、样本尺寸和相似型号边界 |
| `phase83-pen-diplomat-elox` | `diplomat-elox` | 双阳极环、铝制笔身、Soft Sliding Click、钢尖/14K，以及 33 g/42 g SKU 口径 |
| `tYohGyB5d9Hp` | `parker-t-1` | 1970–1971 钛制一体尖、尖下调节螺钉、Parker 75 家族关系、停产与维修风险 |

研究正文均保留自然中文、来源分层、历史、规格、版本、维护、选购和图片边界；正文不把示意图写成产品照片。既有 canonical SVG 原样复用。

## 本批文件

- `.planning/content-research/jinhao-82-phase483.md`
- `.planning/content-research/diplomat-elox-phase483.md`
- `.planning/content-research/parker-t1-phase483.md`
- `scripts/data/phase483-jinhao82-elox-parker-t1-depth.ts`
- `scripts/apply-phase483-jinhao82-elox-parker-t1-depth.ts`
- `tests/content/phase483-jinhao82-elox-parker-t1-depth.test.ts`

apply 脚本只接受 caller-owned、非 symlink checkpoint copy，拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN` 和 `FPKG_DATABASE_URL`，并通过 `recordEntityContentReview` 的 fact/language/media 三项与 `publishEntity` 发布；没有直接写 `entity_publications.status`。

## 验收证据

### 正文与内容包

按 Unicode 字符计数，研究文件总长度/`body_md` 长度分别为：

- Jinhao 82：4,128 / 2,857；
- Diplomat Elox：4,248 / 2,861；
- Parker T-1：4,168 / 2,858。

三包均通过 `## 来源`、至少两个 independence groups、无 `made_by`/内部数据库词检查；每包保留至少一张既有 primary media。

### 定向测试

命令：

```text
TURSO_DATABASE_URL='' TURSO_AUTH_TOKEN='' FPKG_DATABASE_URL='' NODE_ENV=test npx tsx --test tests/content/phase483-jinhao82-elox-parker-t1-depth.test.ts
```

结果：1/1 pass。测试覆盖 owned checkpoint、远程环境拒绝、exact entity/type/slug、正文长度、approved references、唯一 primary media、`made_by`/`reverse`、四项 content review、contract version 3、publication hash、replay noop 与真实 `data/fpkg.db` 快照不变。

### 持久 checkpoint copy

路径：`.planning/quick/260804-hpv-continue-full-fountain-pen-knowledge-gra/checkpoint/checkpoint.db`

该 copy 从真实库复制时主文件 SHA-256 为 `d93136ec6e5f12812b795f59b549b74d889a8b6d4dbd2c9071304a8107964c77`；apply 首次结果：

```text
czZTir9yNoeA              published  sha256:v3:7e04e239b55c4665cb99770c5c46a68af23c7fa50829b5e3d537e2da8fc05b74
phase83-pen-diplomat-elox published  sha256:v3:414eeb2c4eef8b060394043d1d963bb16f24978161caa48b47cf0161630be93a
tYohGyB5d9Hp              published  sha256:v3:1f9fbca75b7b4d6a332c4752e5d5e9019548956092bf57c03a6d817747c41a14
```

第二次相同 CLI 调用三个实体均为 `noop`，hash 不变。checkpoint SQL 复核：

- `PRAGMA integrity_check`：`ok`；`pragma_foreign_key_check`：0；
- published body 字符数：Jinhao 82 3319、Diplomat Elox 3405、Parker T-1 3360；
- 三个实体的 `content_revision = reviewed_content_revision`、`reviewed_contract_version = 3`，publication status 均为 `published`；
- `check-library-contract.ts`：sources 2801、sourceItems 4566、claims 4665、citations 11875、stories 718、events 995、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2407、commonsMedia 4，`Library contract OK`；
- `audit-entity-quality.ts`：entities 690、active 668、retired excluded 22、duplicate name groups 0、suspicious pen articles 0、thin entities 0、made_by blockers 0；
- `check-data-contract.ts`：article 275、brand 119、concept 13、nib 3、pen 571，`Data contract OK`。

### 工具检查

- 项目配置包含的 Phase 483 test 通过 Biome check；全量 TypeScript 未产生本批错误。
- `pnpm exec tsc --noEmit --pretty false --incremental false` 仍只报告既有基线三项：`tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022，以及 `tests/migration/sync-local-catalog-to-turso.test.ts:76` 的 NODE_ENV TS2741。

## 未完成边界

Phase 483 不是全量目标完成证明。以下工作仍未完成：

1. 其余低信息或错误身份的公开品牌/型号仍需继续按批研究和复核；
2. 本批尚未迁移进真实 `data/fpkg.db`，也未写入 Turso；
3. Turso 远端读写仍受 starter plan rows-read overage 的服务端阻断；
4. 全量内容包完成后的正式迁移、生产部署、真人逐页遍历、线上逐条复查和最终全站证据汇总仍待执行；
5. 因此不得将本批、任一 Phase 或单次测试通过标记为整体 goal 完成。

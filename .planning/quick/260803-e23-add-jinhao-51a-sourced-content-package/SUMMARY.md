# Phase 384：Jinhao 51A 来源化内容包

## 结果

- 为真实目录中缺失的 `Jinhao 51A` 建立独立 pen 实体，使用稳定 id `phase384-jinhao-51a`、slug `jinhao-51a`，不把它与 Parker 51、Jinhao 911、85 或其他 Parker 51-style 型号合并。
- 正文明确 Parker 51-style 外形参照与品牌／制造关系边界，覆盖 acrylic／plastic／transparent 与 wood body、金属笔帽、hooded EF 与 open/exposed #5 两条笔尖路线、C/C 供墨、尺寸重量样本、维护、选购和资料边界。
- 新增本站原创 factual SVG：`public/images/library/site-original/phase384/jinhao/51a.svg`；标注 `non-photo`、`non-logo`、`not-to-scale`、`non-colour-proof`，不冒充产品照片或颜色校样。

## 来源与数据图

- 来源包包含 6 个外部资料组：Fountain Pen Network（contemporary archive）、Pastor and Pen、Fountain Pen Companion、Mat's Pens、SBRE Brown、Inkquiring Minds；另有 1 个本站原创 SVG source。
- 模型 pack 有 7 个 source references、4 个变体（2 个 material、2 个 nib）、11 个 spec field evidence、11 个事实／编辑 claim、1 个 timeline event、1 个 primary media。
- 未找到可独立核验的 Jinhao 官方 51A 产品页或首发公告；release year、价格、木种、线宽和具体兼容性均按公开样本或市场快照陈述。

## 验证证据

### 定向测试

命令：

```text
pnpm exec tsx --test tests/content/phase384-jinhao-51a.test.ts
```

结果：1/1 passed（约 29 秒）。测试覆盖 owned disposable copy、远程数据库环境拒绝、摘要／正文／变体／SVG marker、审核—发布四项 approved、public_entities、规格、引用、媒体、source groups、冲突、唯一 `made_by`、品牌 reverse navigation、回放 `noop` 和真实目录 snapshot 不变。

### TypeScript 与格式

- `pnpm exec biome check --write scripts/apply-phase384-jinhao-51a-content.ts scripts/data/phase384-jinhao-51a.ts tests/content/phase384-jinhao-51a.test.ts` 成功；Biome 配置只纳入 `tests/**` 与少数指定脚本，因此 data/apply 文件按既有仓库范围检查，未扩大格式化范围。
- `pnpm exec tsc --noEmit` 仍只有既有基线诊断：`tests/content/phase346-jinhao-x450-x750.test.ts:183,184` 的 TS7022，以及 `tests/migration/sync-local-catalog-to-turso.test.ts:76` 缺少 `NODE_ENV`；没有 Phase 384 诊断。

### 持久 owned checkpoint

路径：`.planning/quick/260803-e23-add-jinhao-51a-sourced-content-package/checkpoint/fpkg-copy.db`（不提交）。

- 源资料库快照：`data/fpkg.db` SHA-256 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`；`source-snapshot.json` 仅作证据，不提交。
- CLI apply 输出：Jinhao brand 与 51A 均 `published`；51A content hash `sha256:v3:185e4c7b4235f44ac1aee56afbdf17f35ea664fe313fcb8b534d6a740cb73583`。
- checkpoint readback：951 entities、905 public、643 published，`PRAGMA integrity_check` 为 `ok`；51A body 3,581 chars，4 项当前 reviews 均 `approved`，7 refs，1 primary media，`primary_archive_group_count=1`、`professional_secondary_group_count=4`，0 fact conflicts。
- topology readback：`phase384-jinhao-51a --made_by--> Yulxwu7PuQAU` 恰好 1 条；`Yulxwu7PuQAU --reverse--> phase384-jinhao-51a` 恰好 1 条。
- 真实 `data/fpkg.db` 仍为 950 entities、904 public、642 published，SHA-256 保持 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，没有被试写。

## 交付文件

- `.planning/content-research/jinhao-51a-phase384.md`
- `scripts/data/phase384-jinhao-51a.ts`
- `scripts/apply-phase384-jinhao-51a-content.ts`
- `tests/content/phase384-jinhao-51a.test.ts`
- `public/images/library/site-original/phase384/jinhao/51a.svg`

checkpoint DB、`source-snapshot.json`、其他 research 文件、`.next-phase*` 与既有 quick 目录均保持未提交。

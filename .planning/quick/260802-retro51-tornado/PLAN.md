# Phase 342：Retro 51 Tornado Fountain Pen 系列与 Jefferson

## Scope

- 新增此前库存中缺失的 Retro 51 品牌，并建立 Tornado Fountain Pen 系列导航与官网可核验的 Jefferson 具体 SKU。
- 把 Tornado 1997 起的 rollerball 传统、现行 fountain pen 系列、老款 Schmidt 尖与 2018+ JoWo #6 边界分开；不把 rollerball、ballpoint、pencil 或每个限量主题混成一支钢笔。
- Jefferson 页只写官方商品记录支持的 antique silver、acid-etched barrel、JoWo #6 stainless nib、国际墨囊／转换器、尺寸和一年质保；价格、库存与地区销售状态不写成稳定规格。

## Owned verification

- 只在本目录 `checkpoint/fpkg-copy.db` 复制件上重放，真实 `data/fpkg.db` 与 Turso 均不写入。
- 定向回归覆盖品牌／系列／SKU 身份、maker/reverse topology、Tornado 供墨与笔尖版本边界、Jefferson 官方尺寸、来源与规格证据、四类审核、primary factual SVG、幂等重放与受保护 catalog 快照。
- 完成定向 test、严格 TypeScript、scoped Biome、`git diff --check` 后，只暂存本 Phase 明确拥有的文件。

## Verification result

- `tests/content/phase342-retro51-tornado.test.ts`：通过；覆盖 owned copy、远程环境拒绝、三实体审核—发布、maker/reverse topology、model_specs、primary factual SVG、受保护快照与幂等重放。
- Phase 342 受影响 TS 文件以 `tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler` 定向编译通过。
- Phase 342 checkpoint 首次回放：brand `sha256:v3:2d2894a1d4c3cd9501aee02e0c15f45a48909ffaa7aed7ff7bb10d73cf3d2740`、Tornado family `sha256:v3:623df4e31ed3f70b658e19321c778b8499db4ec640173daccd937ff9f34f38b5`、Jefferson `sha256:v3:4074f6f604bc05ecc376a941b08077abd43774a050b811f0e649ebbc04b88868`；第二次三者均为 `noop`。
- 全量 `tsc --noEmit` 当前仍被仓库既有的 `tests/migration/sync-local-catalog-to-turso.test.ts` `ProcessEnv.NODE_ENV` 类型错误阻断；本 Phase 文件未出现 TypeScript 错误。

## Status

Phase 342 package and owned-checkpoint replay complete. Real catalog and production remain untouched; full-goal coverage and formal migration are still pending.

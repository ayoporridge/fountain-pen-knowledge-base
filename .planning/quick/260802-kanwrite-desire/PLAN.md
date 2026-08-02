# Phase 344：Kanwrite Desire

## Scope

- 在既有 `Kanwrite` 品牌下新增缺失的 `Kanwrite Desire` canonical 型号页。
- 记录官方树脂主体、#6 可换尖、旋帽、cartridge／converter／eyedropper 三种上墨方式，以及 Noir、Marble、Crystal、Solid 变体边界。
- 复用既有 Kanwrite 品牌包作为 Phase 22 的品牌前置包，不创建重复品牌；正文与品牌身份保持原内容字节不变。

## Owned verification

- 只在本目录 `checkpoint/fpkg-copy.db` 复制件上重放；真实 `data/fpkg.db`、Turso 和生产站点不写入。
- 定向回归覆盖既有品牌身份、Desire 型号身份、唯一 `made_by`／reverse topology、来源独立组、10 个规格字段证据、5 个变体、本站原创 factual SVG、四类 current-hash review、远端环境拒绝、品牌正文零扰动、幂等重放与 protected catalog 快照。
- 完成定向 test、受影响 TypeScript、scoped Biome、`git diff --check` 后，只暂存本 Phase 明确拥有的文件。

## Status

Complete for this owned content package. Real catalog and production remain untouched.

## Verification evidence

- `pnpm exec tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --types node scripts/data/phase344-kanwrite-desire.ts scripts/apply-phase344-kanwrite-desire-content.ts tests/content/phase344-kanwrite-desire.test.ts` passed.
- `pnpm exec biome check --write scripts/data/phase344-kanwrite-desire.ts scripts/apply-phase344-kanwrite-desire-content.ts tests/content/phase344-kanwrite-desire.test.ts` passed with no remaining test-file changes.
- `node --test --import tsx tests/content/phase344-kanwrite-desire.test.ts` passed: 1/1 in 104.9s. The owned-copy test verified the existing Kanwrite brand identity, Desire identity, one maker and reverse link, five variants, ten approved spec evidence rows, primary factual SVG, four approved current-hash reviews, remote-write rejection, unchanged brand body/summary, replay idempotence, and protected/real snapshots.
- Dedicated checkpoint replay on `.planning/quick/260802-kanwrite-desire/checkpoint/fpkg-copy.db` first published the reused brand pack and Desire, then returned `noop` for both with stable hashes:
  - `phase259-brand-kanwrite` → `sha256:v3:aa5f4d16f01facb98dbab06349d285c8d569d2ec5c41274913ad2f58f220c312`
  - `phase344-kanwrite-desire` → `sha256:v3:ed5ca75732d74bf8cd08c9c40e5a9cd621ec3d67142f8db0278de73869152d8c`

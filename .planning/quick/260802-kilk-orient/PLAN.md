# Phase 345：Kilk 品牌与 Orient

## Scope

- 新增此前库存中缺失的土耳其 Kilk 品牌，并建立 `Kilk Orient` canonical 型号页。
- 记录伊斯坦布尔／Üsküdar 艺术工作坊语境、Orient 的曲线与向日葵几何纹样、树脂主体、925 银饰件、#6 Bock 钢尖样本和国际卡水／转换器边界。
- 把颜色、Steel／14K 尖材、EF–BB 字幅和零售商 SKU 作为 variants；不把其它 Kilk 型号或单一颜色拆成重复实体。

## Owned verification

- 仅在本目录 `checkpoint/fpkg-copy.db` 复制件上重放；真实 `data/fpkg.db`、Turso 和生产站点不写入。
- 定向回归覆盖品牌／型号身份、唯一 `made_by`／reverse topology、来源独立组、10 个规格字段证据、4 个型号变体、两条品牌时间线、原创 factual SVG、四类 current-hash review、远端环境拒绝、幂等重放与 protected catalog 快照。
- 完成定向 test、受影响 TypeScript、scoped Biome、`git diff --check` 后，只暂存本 Phase 明确拥有的文件。

## Status

Complete for this owned content package. Real catalog and production remain untouched.

## Verification evidence

- `pnpm exec tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --types node scripts/data/phase345-kilk-orient.ts scripts/apply-phase345-kilk-orient-content.ts tests/content/phase345-kilk-orient.test.ts` passed.
- `pnpm exec biome check --write scripts/data/phase345-kilk-orient.ts scripts/apply-phase345-kilk-orient-content.ts tests/content/phase345-kilk-orient.test.ts` passed with no remaining test-file changes.
- `node --test --import tsx tests/content/phase345-kilk-orient.test.ts` passed: 1/1 in 31.9s. The owned-copy test verified brand/model identity, unique maker and reverse links, source groups, two brand timeline events, four model variants, ten approved spec evidence rows, primary factual SVG, four approved current-hash reviews, remote-write rejection, replay idempotence and protected/real snapshots.
- Dedicated checkpoint replay on `.planning/quick/260802-kilk-orient/checkpoint/fpkg-copy.db` first published both entities, then returned `noop` for both with stable hashes:
  - `phase345-kilk-brand` → `sha256:v3:efe4c83ede1a764e8596d14cf9b9d25b24f31a475b63f7981edbafaac9169bd8`
  - `phase345-kilk-orient` → `sha256:v3:a4a3e590617afbfd4658399bd35bc2f1ebec5907ede365ad699a5b47c5986087`

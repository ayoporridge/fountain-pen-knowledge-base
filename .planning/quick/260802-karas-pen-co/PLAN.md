# Phase 343：Karas Pen Co 品牌、INK、Vertex 与 Decograph

## Scope

- 新增此前库存中缺失的 Karas Pen Co 品牌，并建立官方当前仍可核对的 INK、Vertex、Decograph 三条 fountain pen 路线。
- 保留 Karas Kustoms 作为历史检索别名，不把它建成第二个品牌；Fountain K、EDK、Retrakt 等历史／非钢笔对象只在品牌史中划出边界，不用缺失商品页拼规格。
- 把 INK 的全金属机加工、2024 relaunch 与 Bock/K5 结构，Vertex 的树脂／金属材料、snap-cap、三处 o-ring 与 eyedropper 边界，Decograph 的 Signature Series、材料变体与半退休状态分开记录。

## Owned verification

- 仅在本目录 `checkpoint/fpkg-copy.db` 复制件上重放；真实 `data/fpkg.db` 与 Turso 均不写入。
- 定向回归覆盖品牌／型号身份、maker/reverse topology、三条路线的供墨和材料边界、来源证据、primary factual SVG、四类审核、幂等重放与受保护 catalog 快照。
- 完成定向 test、受影响 TS 定向编译、scoped Biome、`git diff --check` 后，只暂存本 Phase 明确拥有的文件。

## Status

Complete for this owned content package. Real catalog and production remain untouched.

## Verification evidence

- `pnpm exec tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --types node scripts/data/phase343-karas-pen-co.ts scripts/apply-phase343-karas-pen-co-content.ts tests/content/phase343-karas-pen-co.test.ts` passed.
- `pnpm exec biome check --write tests/content/phase343-karas-pen-co.test.ts scripts/data/phase343-karas-pen-co.ts scripts/apply-phase343-karas-pen-co-content.ts` passed with no remaining changes.
- `node --test --import tsx tests/content/phase343-karas-pen-co.test.ts` passed: 1/1, 53.2s. The test used disposable protected and owned copies and verified four published packs, identity and maker topology, source groups, model specs/evidence, factual SVG markers, four approved review records, remote-write rejection, and protected/real snapshots.
- Dedicated checkpoint replay on `.planning/quick/260802-karas-pen-co/checkpoint/fpkg-copy.db` published all four entities, then replayed all four as `noop` with stable hashes:
  - `phase343-karas-pen-co` → `sha256:v3:480794bfc010870f75b08093329580d144c1c3c220604bfeef03aa98d16fd331`
  - `phase343-karas-ink-fountain-pen` → `sha256:v3:238e7ea5618c48647be8ca4d724d4e5257be5aa78fdbcdf694826f4ebefeb206`
  - `phase343-karas-vertex-fountain-pen` → `sha256:v3:b849001c74037682a009de5885241159d18d57f6225098776bbce2baa86bc288`
  - `phase343-karas-decograph-fountain-pen` → `sha256:v3:3c65ebe4648e847099efe411493fa3b81614454217035cd5e61441a7e7240dfb`

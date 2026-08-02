# Phase 347 checkpoint summary

## 结果

- `data/fpkg.db` 未写入；回放目标为 `.planning/quick/260802-tibaldi-bononia/checkpoint/fpkg-copy.db`。
- checkpoint 首次回放：
  - `phase347-tibaldi-brand` → `published`，`sha256:v3:70883591a3fde9b9745e7bda347b72015bd078cd6e7fc026381367358992e9db`
  - `phase347-tibaldi-bononia` → `published`，`sha256:v3:5b86c18edbb71b42e0982e89d03266f0c68134134e2315e2cae79eea40a8bf6a`
- 第二次回放两个实体均为 `noop`，hash 与首次一致。
- checkpoint 查询确认：两个实体均 `published`，fact/language/media/publication 四项均 `approved`；Bononia 只有一条 `made_by` 指向 Tibaldi、一条品牌反向 `reverse`，2 个颜色／尖幅变体、1 条 model spec、10 条 approved spec evidence。

## 验证

- 定向测试：`pnpm exec tsx --test tests/content/phase347-tibaldi-bononia.test.ts`，1/1 passed。
- 定向 TypeScript：
  `pnpm exec tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --types node scripts/data/phase347-tibaldi-bononia.ts scripts/apply-phase347-tibaldi-bononia-content.ts tests/content/phase347-tibaldi-bononia.test.ts`
- Biome scoped check passed；`git diff --check` passed。

## 证据边界

Bononia 的尺寸和重量保留为不同评测样本（约 146/129 mm、146.1/163.9 mm、约 23–24 g）；官方未提供完整首发年份、工厂地址、灌墨容量或每批次重量，正文没有补写这些空白。SVG 明确标记为本站原创 factual diagram、非产品照片、非比例图、非色彩证明。

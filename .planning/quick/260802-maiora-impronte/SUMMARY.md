# Phase 348 checkpoint summary

## 结果

- `data/fpkg.db` 未写入；回放目标为 `.planning/quick/260802-maiora-impronte/checkpoint/fpkg-copy.db`。
- checkpoint 首次回放：
  - `phase348-maiora-brand` → `published`，`sha256:v3:065649250322a7c01c8ffd68c7f73844eb58ce4c77639e9ade7b6133a8bcc589`
  - `phase348-maiora-impronte` → `published`，`sha256:v3:e7242a4f1e3561920159e9a48968abbe4a3fa40c81e979bea06ef5fe2f9a9c07`
  - `phase348-maiora-impronte-oversize` → `published`，`sha256:v3:43ef35f52fa6287af78322e8dfa5aa19743efed637ed966bf0bfeb76c8c7dcf3`
- 第二次回放三个实体均为 `noop`，hash 与首次一致。
- checkpoint 查询确认：品牌与两个型号均 `published`；三个实体的 fact/language/media/publication 四项均 `approved`；两个型号各只有一条 `made_by` 指向 Maiora、一条品牌反向导航，2 个变体、1 条 model spec、10 条 approved spec evidence 和 1 个 primary media。

## 验证

- 定向测试：`pnpm exec tsx --test tests/content/phase348-maiora-impronte.test.ts`，1/1 passed。
- 定向 TypeScript：
  `pnpm exec tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --types node scripts/data/phase348-maiora-impronte.ts scripts/apply-phase348-maiora-impronte-content.ts tests/content/phase348-maiora-impronte.test.ts`
- Biome scoped check passed；`git diff --check` 待提交前对 staged files 复核。

## 证据边界

官方 catalog 的 147/157 mm、标准款评测约 147/133 mm、零售商 142.9/152.4 mm 以及 Oversize 的 145.2/143.4/153.7 mm 被分层保存为目录／样本／零售测量；没有强行合成一个精确尺寸。JoWo 归属来自独立资料，官方只确认钢尖与 EF/F/M/B 字幅。SVG 明确标记为本站原创 factual diagram、非产品照片、非比例图、非色彩证明。

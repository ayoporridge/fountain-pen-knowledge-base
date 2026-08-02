# Phase 341：Cleo Skribent 品牌与 Classic 三条路线

## Scope

- 新增此前库存中缺失的 Cleo Skribent 品牌，并把官网当前 Classic Gold、Classic Palladium、Classic Metall 三条钢笔路线分别建立为型号页。
- 保留每条路线内部的 piston 与 cartridge/converter 变体；不把 Gold 的 14K 尖、Palladium/Metall 的钢尖或后续 14K 选项混写成单一固定配置。
- 品牌页解释 Cleo Schreibgeräte 公司、Bad Wilsnack 制造地与 Cleo Skribent 品牌之间的关系；型号页只引用可核验的官方目录／商城与独立样笔资料。

## Owned verification

- 只在本目录 `checkpoint/fpkg-copy.db` 复制件上重放，绝不写 `data/fpkg.db` 或 Turso。
- 定向回归覆盖新品牌与三型号身份、maker/reverse topology、Classic 三路线材料／尖材／供墨边界、来源与规格证据、审核—发布门槛、primary factual SVG、幂等重放和受保护 catalog 快照。
- 完成定向 test、严格 TypeScript、scoped Biome、`git diff --check` 后，只暂存本 Phase 明确拥有的文件。

## Status

In progress. Real catalog and production remain untouched.

# Plan: deepen the existing Platinum PNB-35000H canonical

## Goal

在不使用 Turso、且不写入 `data/fpkg.db` 的前提下，深化已有 `phase126-platinum-pnb-35000h` / `platinum-3776-century-kanazawa-leaf-pnb-35000h`，把三个官方图案 SKU、金泽箔工艺、14K 尖、供墨、保养、选购和与 PNB-30000B/PTL-20000H 的身份边界写成可核查的自然中文内容。

## Tasks

1. 复用 Phase 126 既有实体、品牌关系、官方 exact pages、原创 SVG 和来源，叠加 Phase 554 scope/claims/variants/spec evidence 与完整正文，不创建重复实体。
2. 增加 owned-copy wrapper 与定向回归：拒绝远端环境，检查首次发布、当前审核、规格/来源/媒体、唯一 `made_by`、完整性和 replay noop。
3. 在 Phase 553 最新 checkpoint 上回放，运行 TypeScript、Biome、diff 与本地质量/readiness 检查，记录真实库 hash 未变。
4. 只提交本包拥有的正文、脚本、数据、测试和 quick 证据，保护其它未跟踪文件与 Montblanc quick。

## Source boundary

- Platinum official exact pages for PNB-35000H #3 Fujin Raijin, #55 Matsu Tora and #57 Ascending Dragon: motif, 14K nib, F/M/B, dimensions, weight, Converter-800A, cartridge and paulownia box.
- Platinum dated price list: SKU/motif/nib combinations at a dated snapshot.
- Platinum general manual: cartridge/converter, cleaning and storage guidance; no decorative-finish durability inference.
- Platinum #3776 Century Collectors: independent line grouping and motif context; sample/market observations stay scoped.

## Verification

- Phase 554 test: first publish/readback, replay noop, protected real DB unchanged.
- `pnpm exec tsc --noEmit`, targeted Biome, `git diff --check`, checkpoint library/quality/readiness checks.

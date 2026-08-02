# Phase 372：Sailor SHIKIORI 草遊び与山水

为 Sailor 官方 SHIKIORI 缺口建立两个独立来源化型号组：草遊び `11-0657` 与山水 `11-2050／11-2051`。颜色和市场 SKU 留在型号的 variants 层，不能拆成重复实体；品牌关系必须指向现有 Sailor 节点。

## Owned files

- `.planning/content-research/sailor-shikiori-kusa-asobi-110657-phase372.md`
- `.planning/content-research/sailor-shikiori-sansui-112050-112051-phase372.md`
- `public/images/library/site-original/phase372/sailor/shikiori-kusa-asobi-110657.svg`
- `public/images/library/site-original/phase372/sailor/shikiori-sansui-112050-112051.svg`
- `scripts/data/phase372-sailor-shikiori-kusa-asobi-sansui.ts`
- `scripts/apply-phase372-sailor-shikiori-kusa-asobi-sansui-content.ts`
- `tests/content/phase372-sailor-shikiori-kusa-asobi-sansui.test.ts`
- 本目录的 `SUMMARY.md`

## 验证

1. 使用 Sailor 日本／英文官网、官方专题／新闻稿、补墨与维护说明和专业零售商交叉核对型号、SKU、材质、尖号、填充、尺寸、上市与价格边界。
2. 在 caller-owned checkpoint copy 回放，验证 fact/language/media 三项审核、publication gate、maker/reverse、variants、spec evidence、主媒体和 replay noop；拒绝远程环境变量。
3. 运行定向测试、TypeScript、Biome、`git diff --check`；正式真实库迁移和线上部署仍属于总 goal 的后续阶段。

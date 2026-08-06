# Quick Task 260806-kf7: 补齐 Pilot Prera 色彩逢い Iro-ai 当前官方 SKU 变体，并增强 Prera 页面边界与定向回归

## Goal

在不新建 Pilot Prera duplicate 实体、也不写入真实 `data/fpkg.db` 的前提下，将 PILOT 当前官方目录中的 Prera 色彩逢い（Iro-ai）透明 sibling 从“只有名称的范围提示”提升为带完整官方 SKU、尺寸、供墨和选购边界的可重放 `CuratedEntityPack`。所有试验写入只使用 owned disposable checkpoint copy。

## Tasks

1. **来源化 Iro-ai variant**
   - Files: `.planning/content-research/pilot-prera-phase544.md`, `scripts/data/phase544-pilot-prera-iro-ai-refresh.ts`, `public/images/library/site-original/phase109/pilot/pilot-prera.svg`（仅在需要修正归属时检查，不替换既有原创图）
   - Action: 继承已发布的 `pilot-prera` canonical pack；登记 PILOT Iro-ai 官方产品页与官方目录 PDF 的 21 个商品号，保留 `P-FPR-1` 基础实色与透明 sibling 的身份边界；为 Iro-ai edition group 及 F/M/CM market SKU 写入 product code、市场和规格证据；正文补充自然中文的透明观察、CM 选择、维护与购买边界。
   - Verify: pack 只含 `UrbBB-onjGnF` 一个 pen 实体；没有 `数据库`、`made_by` 或错误 canonical 词；正文和 variants 均包含官方 Iro-ai SKU 范围、CON-40、13.4 mm、120.4 mm、15.4 g。

2. **checkpoint apply 与定向回归**
   - Files: `scripts/apply-phase544-pilot-prera-iro-ai-refresh.ts`, `tests/content/phase544-pilot-prera-iro-ai-refresh.test.ts`
   - Action: 复用项目既有 `recordEntityContentReview` + `publishEntity` 审核发布链路，验证 owned copy、protected catalog snapshot、maker/reverse topology、variant product codes、媒体来源、发布 hash 与 replay noop；拒绝任何远端环境变量。
   - Verify: `pnpm exec tsx --test tests/content/phase544-pilot-prera-iro-ai-refresh.test.ts` 在 disposable checkpoint copy 通过，真实 `data/fpkg.db` inode/mtime/WAL/SHM 不变。

3. **质量门与提交**
   - Files: 本 quick task 目录的 `SUMMARY.md`、`.planning/STATE.md`
   - Action: 运行定向测试、`pnpm exec tsc --noEmit`、Biome 检查与 diff 保护；只暂存本包文件及本 quick task 的明确文档，提交内容代码与测试，再提交 STATE/PLAN/SUMMARY 文档。
   - Verify: TypeScript 只保留已知基线错误；Biome、diff 保护通过；`git status --short --branch` 显示他人 research、`.next-phase*` 与 Montblanc quick 目录未被暂存。

## Scope guardrails

- 不创建 `pilot-prera-iro-ai` 新实体；Iro-ai 是现有 Prera 页面下的官方透明 sibling/variant。
- 不改写、删除或提交其他 agent 的未跟踪 research、`.next-phase*` 或 quick checkpoint 文件。
- 不直接打开、试写或迁移真实 `data/fpkg.db`；所有 apply 只使用由测试创建的 owned copy。

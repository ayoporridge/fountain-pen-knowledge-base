---
name: Diplomat current catalogue phase 329
created: 2026-07-28
status: in_progress
---

# 目标

在 caller-owned checkpoint copy 中新增 Diplomat Nexus、CLR、Esteem、Traveller 四个官方当前目录型号，写入可核实中文正文、规格、版本边界、维护与来源，并修正品牌反向导航。绝不写入 `data/fpkg.db`。

# 文件所有权

- `.planning/content-research/diplomat-nexus-phase329.md`
- `.planning/content-research/diplomat-clr-phase329.md`
- `.planning/content-research/diplomat-esteem-phase329.md`
- `.planning/content-research/diplomat-traveller-phase329.md`
- `scripts/data/phase329-diplomat-current.ts`
- `scripts/apply-phase329-diplomat-current-content.ts`
- `tests/content/phase329-diplomat-current.test.ts`
- `public/images/library/site-original/phase329/diplomat/{nexus,clr,esteem,traveller}.svg`
- 本 quick 目录

# 验证

1. disposable checkpoint copy 迁移到 032 后运行定向 node:test。
2. 运行 TypeScript、Biome、`git diff --check`。
3. 只暂存本清单文件并原子提交；提交前复核 protected/untracked 状态。

# 边界

颜色、饰件、尖幅和精确商品 SKU 作为 variants；不把 Nexus Chrome/Demo/Gold、CLR 五色环、Esteem Lapis/Barley、Traveller Flame/Funky 等重复建成基础型号。官方价格只作为检索日期快照，不作为永久价格。

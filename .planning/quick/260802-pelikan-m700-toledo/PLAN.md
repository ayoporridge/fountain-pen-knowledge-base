# Phase 340：Pelikan Souverän M700 Toledo 具体型号

## Scope

- 在不改写既有 `pelikan-toledo` 工艺 family 导航页的前提下，新增可独立核对的 `Pelikan Souverän M700 Toledo` 型号页。
- 只复用已存在的 Pelikan 品牌实体；把 M700 与 M710、M900/M910、普通 M800 及泛 Toledo 入口分开。
- 资料优先采用 Pelikan 官方 MAM、Pelikan Collectibles 型号档案、Pelikan Fine Writing archival catalog 与官方维护条款；原创 SVG 仅作事实示意图。

## Owned verification

- 只在本目录 `checkpoint/fpkg-copy.db` 上重放；`data/fpkg.db` 与远程 Turso 均不写入。
- 回归覆盖：路径／远程环境保护、型号身份碰撞、Pelikan maker topology、正文长度与身份边界、规格证据、四类内容审核、primary media、幂等重放及受保护 catalog 快照。
- 完成定向 Node test、严格 TypeScript、scoped Biome、`git diff --check` 后，只暂存本 Phase 文件。

## Status

In progress. Real catalog and production remain untouched.

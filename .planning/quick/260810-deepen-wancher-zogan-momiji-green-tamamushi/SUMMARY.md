---
phase: 581
quick_id: 260810-deepen-wancher-zogan-momiji-green-tamamushi
status: complete
completed: 2026-08-10
---

# Phase 581 Summary — deepen Wancher Zogan Momiji Green Tamamushi

## Result

在没有连接 Turso、没有写入真实 `data/fpkg.db` 的情况下，完成了一个现有实体的内容深化
和 duplicate 路由收敛。`phase543-wancher-zogan-momiji-green-tamamushi` 是官方 product id
`9322088038615` 的 canonical 实体；旧 `phase519-wancher-zogan-momiji-green-tamamushi`
不再作为第二个公开型号保留，而是 retired，并将旧 Dream Pen URL 永久重定向到
`/pen/wancher-zogan-momiji-green-tamamushi`。

- 文章文件：8,058 Unicode 字符；`body_md` 5,922 字符。
- 内容包：14 sources、31 claims、10 variants、2 media、18 条 spec evidence、1 条
  明确的 material field/prose conflict。
- 当前官方窗口：Black/Silver Trim，SKU `WF-ZOUR-DREAM-MOTAGR` /
  `WF-ZOUR-DREAM-MOTAGR-SV`，官方 JSON 当前价格均为 US$600；产品页及图片均保留为可回读
  来源。原创 SVG 仍是唯一 primary，官方 CDN 照片作为 gallery，不把示意图冒充产品实拍。

## Verification

- Phase 581 定向 node:test：1 passed / 0 failed，exit 0；覆盖 owned copy、拒绝远端环境、
  首次 apply、replay、canonical published/public、三项审核、旧 duplicate retired、
  redirect、retire lineage、关系数量、来源和媒体。
- TypeScript：`npx tsc --noEmit` exit 0。
- Biome：三个 Phase 581 TypeScript 文件检查通过。
- 真实 `data/fpkg.db` SHA-256：
  `acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a`；定向测试还验证 apply
  前后真实库 hash 与受保护快照不变。
- 详细机器输出保存在本目录 `evidence/target-test.txt`、`evidence/tsc.txt`、
  `evidence/biome.txt`；提交前另执行 staged `git diff --check`。

## Boundary

本批没有使用 Turso，也没有正式迁移真实资料库或部署生产。全量 69/236 库存覆盖的公开页
仍需继续审计与内容补齐；正式迁移、完整自动检查、真人全页面遍历、部署和线上逐条复查仍
未完成。因此不能将 Phase 581 或任何单次提交标记为总 goal 完成。

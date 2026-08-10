# Phase 579：深化 Pilot MR Metropolitan

## 目标

在不新增实体、不使用 Turso、也不写入 `data/fpkg.db` 的前提下，补强已有公开 Pilot MR Metropolitan 条目：把北美 MR Metropolitan、Classic／Animal 版本、与日本 Cocoon 的市场边界、PN91111 的版本化规格、Pilot 供墨系统、维护与选购建议写成可核查的自然中文正文，并用项目既有审核—发布路径在 owned checkpoint copy 上重放。

## 范围

- 只更新已有实体 `phase292-pen-pilot-metropolitan`。
- 复用 Pilot 品牌与现有 maker 关系，不删除或重建会触发品牌降级的 `made_by` 行。
- 复用本站原创 factual SVG；不把 Cocoon、Kakuno 或其他 Pilot 图片冒充 Metropolitan。
- 新增 Phase 579 内容研究、pack、离线 apply wrapper 与定向测试；不触碰真实数据库、Turso、通用验收框架或 Playwright。

## 验收

1. wrapper 拒绝 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`，并验证 owned copy、032 migration 与受保护 catalog 快照。
2. 首次执行为 `published` 或既有状态下 `noop`，重放为 `noop`，hash 稳定；正文不少于 5,000 Unicode 字符，包含身份、规格、市场边界、版本、维护、选购与来源证据。
3. checkpoint 中目标页 `published/public`、readiness 无 blocker、fact/language/media/publication reviews 全部 approved，maker 与 reverse 导航各一条，媒体只有一个 primary，SQLite 完整性和真实库快照不变。
4. 通过定向 test、TypeScript、Biome、diff check 与 production build；提交前只暂存本批明确拥有的文件。

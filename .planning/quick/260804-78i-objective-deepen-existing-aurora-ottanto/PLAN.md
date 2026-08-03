# Aurora Ottantotto Millerighe、Ipsilon Italia、Montegrappa Elmo 01 深化

## 目标

在 Phase 451 owned checkpoint 上深化三个已有 canonical 型号页：Aurora Ottantotto Millerighe 801 `phase336-pen-aurora-ottantotto-millerighe`、Aurora Ipsilon Italia B17-A `phase338-pen-aurora-ipsilon-italia`、Montegrappa Elmo 01 `phase85-pen-montegrappa-elmo-01`。复用既有官方商品/目录/历史、专业零售和原创事实图，不建立重复实体，不触碰真实 `data/fpkg.db`。

## 内容边界

- Millerighe 801 只承载黑色树脂、millerighe 纹饰、镀金帽、活塞和 EF/F/M/B 的具体商品边界；Resina、chrome cap、银帽和历史 88 不互填。
- Ipsilon Italia 只承载 B17-A 蓝色树脂、三色漆环、镀铬饰件和墨囊/转换器语境；其它 B17 颜色、Ipsilon Resin、Quadra 与圆珠/roller 独立记录。
- Elmo 01 是树脂钢尖 cartridge/converter 型号；Elmo 02 与活塞、金尖路线的 Elmo 02 Plus 只作关系对照，不继承规格。

## 实施与验收

1. 只在本目录 checkpoint copy 上 apply；脚本拒绝 remote、符号链接、硬链接和真实数据库，并核验 `032_taxonomy_identity.sql`。
2. 三个 `CuratedEntityPack` 通过 `recordEntityContentReview` fact/language/media 审核，再由 `publishEntity` 发布；不直接写 publication 状态。
3. 三份正文各至少 3500 字符，发布 body 各至少 2600 字符；每个型号至少 4 条 approved references、3 组独立来源、1 个 approved primary media，恰好一条 maker 与一条 reverse。
4. 定向测试验证 canonical ID/slug、审核 hash、发布状态、回放 `noop` 和真实库快照不变；随后跑 integrity、quality audit、library contract、Biome、diff check 与 TypeScript 基线。

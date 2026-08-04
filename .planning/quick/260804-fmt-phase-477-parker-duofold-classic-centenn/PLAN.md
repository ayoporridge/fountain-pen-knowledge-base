# Phase 477：Parker Duofold Classic Centennial 与 1921–1938 家族深化

## 目标

在不新建重复实体的前提下，深化两个已有 canonical Parker 条目：

- `sYO0meaAoJ_V` / `the-parker-duofold`：1921–1938 Duofold 历史家族导航；
- `h8mHobX3YCPS` / `派克-parker-世纪-duofold`：现代 Duofold Classic Centennial。

两页分别处理历史家族与现行 Centennial，不把古董 button filler 的材料、尺寸或维护字段回填到现代页，也不把现代 cartridge/converter 规格回填到古董页。

## 资料边界

- Parker 官方历史时间线：1921 Duofold launch、Big Red 与 1928 新塑料语境；
- Parker 官方 Duofold 100 新闻稿：2021 百年致敬、1920/1930 年代材料与颜色历史边界；
- Parker 官方当前 SKU 1931381 页面：Centennial Size、Classic Black、precious resin、23K gold-plated trims、18K solid-gold rhodium-plated nib、Fine/Medium 选择及 Fountain Pen 字段；
- Parker 官方 Nib Exchange 与清洁/Refills 页面：尖幅交换期限、cartridge/converter 护理、清洗和存放；
- VintagePens 与 Penography：Senior、Junior、Lady、Special、Vest Pocket、De Luxe、streamlined、hard rubber/Permanite、button filler 与家族鉴别边界。

## 执行顺序

1. 在 Phase 476 checkpoint 上创建 caller-owned copy；
2. 读取已有 Phase 34 pack，写入两页自然中文正文、来源、claims、spec/timeline；
3. 通过 `recordEntityContentReview` 的 fact/language/media 审核，再经 `publishEntity` 发布；
4. 修复并核验每个型号唯一 `made_by` 与品牌反向 `reverse` 导航；
5. 在同一 checkpoint 做首次 apply、replay、契约、SQLite 完整性、质量与覆盖审计；
6. 仅提交本批研究、data/apply/test 与摘要文件；真实 `data/fpkg.db` 保持只读。

## 验收标准

- 两个 ID、type、slug 与既有 canonical 完全一致；
- 每页正文至少 2,700 字符，含来源段且不泄露内部实现词；
- 每页至少 4 个 approved references、恰好 1 个 approved primary media；
- fact/language/media/publication 四项审核均为当前 approved；
- publication 为 published，contract version 为 3，approved hash 与当前内容一致；
- 首次 apply 为 published，第二次 replay 全部为 noop；
- owned checkpoint `PRAGMA integrity_check` 为 `ok`，`PRAGMA foreign_key_check` 无行；
- `data/fpkg.db` 的快照在 apply 前后完全不变。

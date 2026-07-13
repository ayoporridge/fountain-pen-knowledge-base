# Phase 12 Summary: 链接、身份与分类纠错

**Completed:** 2026-07-13
**Requirements:** DATA-01, DATA-02, DATA-03, DATA-04

## Delivered

- 公开详情路由只接受真实类型与真实实体；无效两段式命名空间返回 404，不再产生 200 空壳。
- 未解析 wiki-link 退化为普通文字；旧站 `.htm/.html` 链接规范化到原站，危险与无意义相对链接不再输出。
- Pilot Custom 823、Pelikan M800、Parker 51、Sailor Pro Gear 与 Aurora 品牌泛称统一到唯一规范身份，旧 URL 保留规范跳转。
- Kimberly Pockette 圆珠笔与 Pilot Iroshizuku 墨水线从钢笔型号重分类为文章；LAMY 2000 标题修正。
- 所有公开读取器统一使用发布边界：规格、来源、时间线、事实、图示、媒体和社群内容只输出允许公开的状态。
- 退役 `/library/coverage`、`/library/media`、`/library/community` 三个内部运营性质页面，并从 sitemap 和馆藏入口移除。
- 公开 API 改为明确字段白名单，不再泄漏数据库 ID、原始正文、导入路径、内部状态和未映射字段。
- 策展专题中的旧实体引用会先映射到规范实体，公开页面不再产生重复身份链接。

## Data Result

- 数据库实体：582
- 公开实体：568
- 公开钢笔型号：237
- 可公开的 approved 型号规格：12
- 外键检查：通过
- 非钢笔实体持有型号规格：0

历史重复记录暂保留在数据库内以便回溯，但被统一公共过滤器隐藏；公开 sitemap、分类、关系、API 和详情页只呈现规范身份。

## Verification

- `pnpm check:data-contract`：通过
- `pnpm check:public-boundary`：通过（568 entities / 237 pens / 12 approved specs）
- `pnpm lint`：通过，保留 1 条既有 CSS `!important` 警告
- `pnpm build`：通过
- Playwright 规范身份、公开 API、canonical/sitemap/robots：通过
- 全量 sitemap 可见文字内部状态检查：通过
- 全量 sitemap 页面所有站内链接状态与真实 H1 检查：通过

## Deferred

- 复合型号、系列集合页的拆分与规格信息契约进入 Phase 15。
- 历史重复记录的物理删除不影响公开体验，暂不做不可逆清理。

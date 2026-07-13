# Audit-Fix Classification — 2026-07-13

**Source:** production full-site audit of 599 sitemap URLs, 573 public entities, all discovered internal links, and 3,406 unique image assets.

| ID | Finding | Severity | Classification | Route |
|----|---------|----------|----------------|-------|
| F-01 | 公开搜索功能与当前版本范围冲突 | High | auto-fixable | Phase 11 |
| F-02 | 问 AI、聊天与 LLM 路径超出当前版本范围 | High | auto-fixable | Phase 11 |
| F-03 | 删除搜索后需要完整分类发现路径 | High | manual-authorized | Phase 11 |
| F-04 | 31 个 404 与 310 个公开空壳目标 | High | auto-fixable | Phase 12 |
| F-05 | Custom 823、M800、Parker 51 等重复实体 | High | auto-fixable | Phase 12 |
| F-06 | 错误实体类型与内部字段/占位状态泄漏 | High | auto-fixable | Phase 12 |
| F-07 | 25 个确定硬破图与图片代理异常 | High | auto-fixable | Phase 13 |
| F-08 | 234/244 型号页重复展示首图 | High | auto-fixable | Phase 13 |
| F-09 | 高白边、低清和错配封面 | Medium | manual-authorized | Phase 13 |
| F-10 | 文章相对链接、javascript 与原站交互残留 | High | auto-fixable | Phase 14 |
| F-11 | 翻译标记、残缺 ref、Markdown 泄漏与标题层级 | High | auto-fixable | Phase 14 |
| F-12 | 型号故事批量模板腔和典型拼接病句 | Medium | manual-authorized | Phase 15 |
| F-13 | 95.1% 型号规格未 approved 仍正常展示 | High | manual-authorized | Phase 15 |
| F-14 | 笔尖、上墨与概念分类缺乏中文结构和实体关系 | High | manual-authorized | Phase 15 |
| F-15 | 手机导航视觉为空 | High | auto-fixable | Phase 16 |
| F-16 | 对比页重复暴露原始字段 | High | auto-fixable | Phase 16 |
| F-17 | 图谱手机可读性、节点截断和起点选择问题 | Medium | manual-authorized | Phase 16 |
| F-18 | 多 H1、泛化 alt、重复 title 与来源英文界面 | Medium | auto-fixable | Phase 16 |
| F-19 | 缺少覆盖本轮问题的全量回归门禁 | High | auto-fixable | Phase 17 |

`manual-authorized` 表示原审计修复流程会因跨模块或设计判断将其列为 manual-only，但用户已明确授权按审计结论自主修复，因此纳入本里程碑执行。

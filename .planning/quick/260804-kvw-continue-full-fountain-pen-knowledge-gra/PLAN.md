# Phase 492：深化 Sailor 长刀研、雪月空葉与 1911 Large

## 目标

在不创建重复实体、不写入真实 `data/fpkg.db` 的前提下，深化三个已有 Sailor canonical pen：Naginata Togi 10-7121、SHIKIORI 雪月空葉 11-1224、1911 Large Silver Trim 11-2024。正文需要把官方 SKU、笔尖／材料／上墨、版本边界、维护和选购建议写清，并沿用现有原创事实图与品牌关系。

## 交付

- 三份 Phase492 来源化中文研究正文，各自包含规格 JSON、自然中文 body 和官方／独立来源。
- 一个复用既有 `CuratedEntityPack` 的数据模块；不新增品牌或型号实体。
- 一个只接受 caller-owned checkpoint 的 apply 脚本，使用 `recordEntityContentReview` 的 fact/language/media 审核和 `publishEntity` 发布路径。
- 定向测试覆盖远端环境拒绝、身份、正文长度、来源组、图片、品牌／反向关系、审核发布 hash、幂等重放和真实目录不变。

## 安全边界

- 试写副本：`checkpoint/checkpoint.db`；从真实目录复制前后核对快照。
- 绝不直接试写真实 `data/fpkg.db`；不改动其他 agent 的 research、`.next-phase*` 或 Montblanc quick 目录。
- 不新增通用 AI 验收、Playwright 或 readiness 框架；只调用既有定向检查。

## 验收

1. 定向测试通过，首次 apply 三项均 `published`，第二次均 `noop`。
2. 三个目标在 checkpoint 中保持原 ID／slug／pen 类型；每个恰好一个 `made_by`、一个品牌到型号 `reverse`，一个 primary media；审核四项与当前内容 hash 对齐。
3. checkpoint `integrity_check=ok`、foreign-key violations=0；library contract 通过；质量审计无 duplicate、suspicious pen article、thin entity、broken link。
4. readiness 记录当前全站事实：690 entities、668 published/public、22 backlog；旧锁定基线仍为 681，`--verify-baseline` 因漂移拒绝，不能忽略。
5. 全局 `tsc --noEmit` 只保留既有三处基线错误；定向 Biome 和 `git diff --check` 通过。

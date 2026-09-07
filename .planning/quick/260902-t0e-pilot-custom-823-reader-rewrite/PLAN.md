---
quick_id: 260902-t0e
task: pilot-custom-823-reader-rewrite
status: complete
---

# Phase 615：Pilot Custom 823 读者正文重写

## 目标

为 canonical `/pen/pilot-custom-823` 替换旧的重复模板式正文，保留既有型号身份、规格、来源、关系和媒体资产，并通过项目既有 `recordEntityContentReview` 与 `publishEntity` 审核—发布链路。退休的旧中文 slug 继续保持 retired，不新增实体。

## 执行任务

1. 写入来源化中文研究稿，覆盖上墨动作、规格、颜色、相邻 Custom 选择、维护运输、二手检查和图片边界。
2. 在 caller-owned checkpoint copy 中更新 canonical entity/story 的正文与来源标记；只允许正文和故事字段变化。
3. 记录 fact/language/media 三项 current-hash review，通过 `publishEntity` 发布并验证 publication/readiness/public membership。
4. 定向测试首次运行、远程环境拒绝、关系与退休重复实体不变、全局 public body 去重和 replay 幂等。
5. 通过格式、TypeScript、diff 检查后，再按独立 formal-local 流程迁移真实本地资料库；Turso/线上迁移因读配额阻塞不在本任务内宣称完成。

## 受保护边界

- 试验数据库只能位于测试创建的 caller-owned 临时目录。
- `data/fpkg.db`、其他 agent 未跟踪研究文件、`.next-phase*` 和受保护 quick 目录不得被修改或提交。
- 任何 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN` 或 `FPKG_DATABASE_URL` 非空时脚本拒绝运行。

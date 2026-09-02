# Phase 614：重复品牌故事清理

## 目标

修复公开内容审计发现的三组逐字重复：Ingersoll 品牌／Dollar Pen、依人 Yiren 品牌／878、YongXu 品牌／286。只重写品牌入口故事，保留型号正文、来源、规格、媒体和关系；所有试验仅在临时 caller-owned checkpoint copy 中进行。

## 约束

- 真实 `data/fpkg.db` 只读保护，脚本拒绝继承 Turso 或其他远程数据库选择。
- 发布必须经过 `recordEntityContentReview` 的 fact/language/media 三项和 `publishEntity`，不直接改 publication 状态。
- 不删除或暂存其他 agent 的 research、`.next-phase*` 或既有 quick 目录。

## 验收

1. 三个品牌与对应型号身份、`made_by`／`reverse` 关系保持不变。
2. 品牌和型号正文不再相同；三组目标之外的 payload 不变。
3. 三个品牌均保持 published、public、readiness blocker 为 0，当前 publication hash 有四类审核记录。
4. 第一次回放报告 3 个 published，第二次回放全部 noop。
5. 全量公开正文不再出现重复 body；真实数据库快照和 SHA-256 保持不变。
6. 定向测试、TypeScript、diff check 和本地回读有证据。

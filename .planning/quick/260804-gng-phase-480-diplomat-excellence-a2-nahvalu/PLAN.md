# Phase 480：Diplomat Excellence A2、Nahvalur Schuylkill、Delike Element 深化

## 目标

在不新建重复实体的前提下，深化三个已有 canonical 型号：

- `phase83-pen-diplomat-excellence-a2` / `diplomat-excellence-a2`；
- `s59NAHVALUR_SCHUYLKILL` / `nahvalur-schuylkill`；
- `_gbRalCJARx3` / `delike-element`。

资料优先使用 Diplomat、Nahvalur 的当前官方商品/集合页，再以独立评测、可靠零售档案和型号目录补足实物体验与版本边界。正文分别说明 A2 与 A+ 的帽机制、Schuylkill 与 Original Plus 的活塞/真空差异、Element 与 Alpha/Kaweco 相邻短笔的黄铜与接口差异。

## 执行与验收

1. 以 Phase 479 checkpoint 为基线，复制到本批 caller-owned checkpoint；
2. 只通过既有 `recordEntityContentReview`（fact/language/media）和 `publishEntity` 审核—发布链路，拒绝远程环境与真实资料库路径；
3. 核验三个 pen 的 exact slug/type、唯一 `made_by`、品牌反向 `reverse`、approved references、primary media、spec evidence 和四项当前审核；
4. 定向测试覆盖正文/来源阈值、远程选择拒绝、真实目录快照保护、publication gate 与 replay noop；
5. 运行 library contract、质量/覆盖审计、SQLite integrity/FK 和全量 TypeScript 检查；
6. 提交前只暂存本批 research、data/apply/test/PLAN/SUMMARY，排除 checkpoint、其他 research、`.next-phase*` 与受保护 Montblanc quick 目录。

## 明确边界

本批只深化三个已有型号，不代表全量品牌/型号内容修复完成；不执行真实 `data/fpkg.db` 迁移、生产部署、真人全站遍历或线上复查。

# Phase 479：Pelikan Twist、Majohn Wancai、Asvine V126 内容深化

## 目标

在不新建重复实体的前提下，深化三个已有 canonical 型号：

- `wnzMt5lugvtc` / `pelikan-twist`；
- `OKxZn-scQfN5` / `末匠-majohn-丸彩`；
- `phase88-pen-asvine-v126` / `asvine-v126`。

Pelikan 以官方 Twist 当前页、MAM 产品记录和 Pelikan Collectibles 档案核对 P457、SKU、扭转握位、墨囊、尖幅和邻近学生线；Majohn 以官方导航、独立评测、中文专业资料和玩家讨论核对直灌、帖帽、树脂与 Moonman/Majohn 边界；Asvine 以当代产品入口、两篇独立 V126 评测和相邻型号资料核对真空杆、止墨阀、钢尖及样本体验边界。

## 执行与验收

1. 以 Phase 478 checkpoint 为只读基线，复制到本批 caller-owned checkpoint；
2. 通过 `recordEntityContentReview` 的 fact/language/media 审核与 `publishEntity` 发布，拒绝远程环境和真实资料库路径；
3. 核验每条 canonical 的 slug/type、唯一 `made_by`、品牌反向 `reverse`、approved references、primary media、model specs 和四项当前审核；
4. 定向测试覆盖正文/来源阈值、真实目录快照保护、发布门槛与 replay noop；
5. 运行 library contract、质量/覆盖审计、SQLite integrity/FK 检查和全量 TypeScript 检查；
6. 提交前只暂存本批 research、data/apply/test/PLAN/SUMMARY，排除 checkpoint、其他 research、`.next-phase*` 和受保护 Montblanc quick 目录。

## 明确边界

本批只深化三个已有型号，不代表全量品牌/型号内容修复完成；不执行真实 `data/fpkg.db` 迁移、生产部署、真人全站遍历或线上复查。

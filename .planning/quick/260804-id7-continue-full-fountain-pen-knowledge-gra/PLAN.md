# Phase 485：深化 Sailor Professional Gear KOP、SKB ES-520 与 Majohn V60

## 目标

在不重复建实体的前提下，继续处理真实公开型号中信息量偏低、但已有 canonical identity 的一批：

- `s39PGKOP9618` / `sailor-professional-gear-kop-10-9618`；
- `s61SKBES520` / `skb-es-520`；
- `CHLNJmZaZHB8` / `末匠-majohn-v60`。

KOP 重点补齐官方 10-9618-420/620、超大型 21K、平顶与 King Profit 的边界、受注生产和维护；ES-520 重点补齐 55 度书法尖、RI-60/#301A 套装、环保回收料与品牌历史边界；Majohn V60 重点补齐三角握位、活塞操作、Moonman 别名、OMAS 360 相似外形的证据边界和维修风险。

## 执行与验收

1. 复用 Phase 39、Phase 143、Phase 182 的 canonical pack 和既有原创 factual SVG，只替换正文并追加本批来源、claims、spec evidence、variants 与 timeline；
2. 仅通过 `recordEntityContentReview` 的 fact/language/media 三项和 `publishEntity` 审核—发布链路；拒绝远端环境与真实资料库路径；
3. 在真实库复制出的 caller-owned checkpoint 上核验 exact type/slug、唯一 `made_by`、品牌反向 `reverse`、approved references、primary media、publication gate 和 replay noop；
4. 三份正文均不少于 3,600 Unicode 字符，`body_md` 均不少于 2,800，包含自然中文来源、规格、历史/版本、维护、选购与图片边界，正文不出现内部实现词；
5. 运行定向测试、SQLite integrity/FK、library contract、质量审计、Biome、全量 TypeScript，并记录既有基线错误；
6. 提交前只暂存本批 research、data/apply/test/PLAN/SUMMARY，保护所有其他 research、`.next-phase*`、checkpoint 和 Montblanc quick 目录。

## 明确边界

本批只深化三个已有型号，不代表全量品牌/型号内容修复完成；不执行真实 `data/fpkg.db` 迁移、Turso 远端写入、生产部署、真人全站遍历或线上逐条复查。

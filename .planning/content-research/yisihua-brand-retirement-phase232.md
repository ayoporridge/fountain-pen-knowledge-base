# YiSiHua（意斯华）品牌遗留节点退休记录

研究日期：2026-07-26。本记录只说明身份处置，不把旧品牌壳重新包装成内容页。

## checkpoint 证据

- `cVCGtVIb8WBd` 已是公开的 `Asvine P36 Titanium Piston-Filling Fountain Pen`，唯一 `made_by` 指向 `Asvine`；旧 `/pen/意斯华-p36` 已永久跳转到 `/pen/asvine-p36`。
- `mx3fnAnteiHS` 的类型仍为 `brand`、slug 为 `yisihua`，但从当前 owned checkpoint 看没有入站或出站 `entity_links`，没有公开型号，也没有可发布的来源化品牌正文；只剩旧的过时故事和待审核别名。
- 因此不能把 P36 再挂回 YiSiHua，也不能把 YiSiHua 泛化为 Asvine 的同义品牌。旧 `/brand/yisihua` 采用 `hard_404`，保留历史路由记录但不制造错误品牌页。

## 处置边界

这不是删除实体，也不是把两个品牌合并。退休动作保留实体和 taxonomy ledger，撤下旧出版状态、移除残留关系，并记录可重放的 hard-404。P36 的具体旧型号路由继续指向 Asvine；品牌级入口不做广义跳转，避免把一条具体型号的修正误读成整家公司身份证明。

## 参考来源

- FPnibs：Asvine P36 商品页：https://www.fpnibs.com/products/asvine-p36
- Fountain Pen Network：Asvine P36 讨论：https://www.fountainpennetwork.com/forum/topic/376060-asvine/
- 项目既有 P36 内容研究：`.planning/content-research/research-hongdian-asvine-2026-07-20.md`

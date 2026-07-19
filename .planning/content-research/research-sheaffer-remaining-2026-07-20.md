# Sheaffer：P0 之后的存量条目、错误边界与下一批实施建议

**调研日期：** 2026-07-20  
**范围：** 仅研究；未打开数据库、checkpoint 或执行任何写入脚本。  
**目标：** 把现有 raw 页面和重要缺口切成能直接来源化的型号页，避免把上墨机制、产品家族、具体 SKU 与中文渠道名混为一页。

## 结论先行

下一批应先处理五个已有 raw 页：`sheaffer-s-balance`、`sheaffer-s-pfm`、`sheaffer-s-snorkel`、`sheaffer-s-tuckaway`、`targa-by-sheaffer`；紧随其后处理 `犀飞利-sheaffer-帝国元首`，但它必须改名、拆分或退役，不能以这个中文名继续发布。`sheaffer-s-connaisseur` 是第二批，适合与一个现行 Sheaffer Icon 一起补上，以免品牌页只有历史机制笔、没有在售产品入口。

不要把它们全部做成同一粒度。Balance、Snorkel 是**家族导航页**；PFM 是**边界清晰的型号家族**；Targa 是**长生命周期型号家族**；Tuckaway 是**便携家族**；Imperial 应先以**年代/家族导航页**取代“帝国元首”这个混名。每个家族页要列出具体可辨认子型，而不是把子型的笔尖、帽材、上墨方式写成整个家族的固定规格。

## 现有身份与不可回退的 P0 状态

| 角色 | ID / slug | 当前处理结论 |
|---|---|---|
| 品牌 | `tVXnzDSFCcPP` / `sheaffer` | 保留，品牌页应反向链接所有已公开 canonical 型号/家族节点。 |
| 已退役 raw Craftsman | `qQbWP5zGOGSL` / `sheaffer-s-craftsman` | 已在 Phase 56 拆为 Balance-era Craftsman、33T、Tip-Dip Craftsman；不可重新把三者合回一个泛页。 |
| 已退役 raw Touchdown TM | `OxA3ZMr8ULNQ` / `sheaffer-s-touchdown-tm` | 已拆为 `touchdown-tm` family；不能把 Snorkel 填回 TM 页面。 |
| 新建 P0 | `s56SHFCRBAL` / `craftsman-balance` | Balance-era Craftsman，非整个 Balance。 |
| 新建 P0 | `s56SHFCR33T` / `craftsman-33t-1949-lever` | 1948 catalog 的杠杆 33T，非所有 No.33。 |
| 新建 P0 | `s56SHFCRTDTIP` / `craftsman-tip-dip-touchdown` | 后期 Tip-Dip Craftsman，非 Snorkel。 |
| 新建 P0 | `s56SHFTDTM` / `touchdown-tm` | 1950–1952 Thin Model family，非单一 SKU。 |

下列仍在库存中的 raw slug 已由 `import-model-gap-sources.ts` 明确登记，且目前只有 research/旧文章语义：`sheaffer-s-balance`、`sheaffer-s-connaisseur`、`sheaffer-s-pfm`、`sheaffer-s-snorkel`、`sheaffer-s-tuckaway`、`targa-by-sheaffer`，以及中文混名 `犀飞利-sheaffer-帝国元首`。它们的随机实体 ID 没有被写进静态仓库文件；本任务遵守“不读 DB/checkpoint”的边界，故不猜造 ID。实施者应在 **owned checkpoint copy** 的预检中按这些 slug 读取既有 ID、断言 type=`pen` 与唯一 `made_by`，再由迁移复用该 ID 或建立明示的 retire/redirect/hard-404 决策。不要在 data 文件里臆造一串“看起来稳定”的替代 ID。

## P1：历史核心五页

### 1. `sheaffer-s-balance` → `sheaffer-balance`（家族导航）

- **身份：** 1929–c.1941 的流线型 Balance 不是一支固定 SKU，也不是 Craftsman 的同义词。它应成为战前 Sheaffer 的家族导航，明确链接已发布的 `craftsman-balance`，并列出 Senior / Junior / Lifetime / Statesman 等为后续子节点或待来源化 sibling，而非在正文中虚构一个统一规格。
- **版本边界：** 对外只写“lever-fill、Vacuum-Fil 与不同尺寸/材料的历史成员并存”；不要把某一支 No.3、No.33、白点、长度、颜色写成全族属性。Craftsman 的 33T 和 1950 年后的 Tip-Dip 均为独立页。
- **来源组合：** Richard’s Pens Balance profile（家族、外形与年代） + PenHero Penography（年代相邻关系） + 可靠维修资料（仅在写 Vacuum-Fil 维护边界时）。第一批不需要新建每个尺寸的页面。
- **品牌页链接：** Balance、Craftsman (Balance)、Craftsman 33T、Tuckaway；未来再补 Senior/Lifetime、Statesman 等明确型号。

### 2. `sheaffer-s-snorkel` → `sheaffer-snorkel`（机制家族导航）

- **身份：** 1952–1959 的 Snorkel 是 Touchdown 气压囊加伸缩管的产品家族；它不是某一支“潜艇钢笔”，也不能把所有成成员统一写为 Triumph 金尖。PenHero 对机制的描述明确：管子从 feed 伸出，笔尖不需入墨；需要密封件/O-ring 才能维持气压。
- **应列出的子型集合：** TM Snorkel family、Admiral、Saratoga、Statesman、Valiant、Crest、Sentinel、Clipper；PFM 只作为后继的旗舰 Snorkel sibling 链接，不应吞进普通 Snorkel 的变体表。
- **页面字段策略：** 正文说明机制、年代与购买维修检查；规格表写“按子型变化”，不填统一材质/笔尖。子型表每行记录帽材、笔尖样式/材质、trim、尖码和是否白点，并附 catalog/evidence locator。
- **最小可发布范围：** 先发布家族页 + `PFM`；不要求在同一 batch 创建全部七个子型页。若要另拆首批子型，优先 `Snorkel Admiral`（入门）和 `Snorkel Statesman`/`Crest`（金尖/高阶）两页，避免只有机械说明而无消费选择入口。

### 3. `sheaffer-s-pfm` → `sheaffer-pfm`（1959–1968 型号家族）

- **身份：** PFM = Pen For Men，1959 推出。不是“普通 Snorkel 大号版”的泛称，而是 inlaid nib 首次出现的旗舰家族；1959–1963 保有完整五级阵容，PFM III 与 V 续列，最终至 1968 停产。
- **可核验版本：** PFM I / II 是 palladium-silver nib（I 无 White Dot）；III / IV / V 是 14K nib；III Autograph、demonstrator 是应在 variants 中标明稀有程度的 sibling，而不是封面图通用代表。I/II 的银色尖与 III–V 的 14K 尖不可互填。
- **机制与尺寸：** 使用 Snorkel（非 Legacy 的 cartridge-compatible modified Touchdown）；PenHero 对 PFM、Imperial 的对照样本给出约 5 3/8 in closed、5 3/4 in posted，只能作为该比较中的样本/版本参考，不能宣传为全部 PFM 的官方固定尺寸。
- **图像：** 优先本站原创结构图，分别画 Snorkel tube、inlaid nib、PFM I–V 的材质差异；不拿 PFM V 金帽照片冒充 PFM I/II。外部 archive 图片必须先通过版权/许可审核。

### 4. `sheaffer-s-tuckaway` → `sheaffer-tuckaway`（1940–c.1950 家族）

- **身份：** Tuckaway 是短身、以 posted 书写和随身携带为核心的家族，不是单一尺寸。已知历史阶段包括 1940 lever-fill、1941 Vacuum-Fil、1942 Triumph redesign、1949 Touchdown 语境；具体实物必须通过上墨结构、尖型与夹子/帽身细节定代。
- **必须写清的反例：** “短 = Tuckaway”不成立；Tuckaway 的早期杠杆、Vacuum-Fil、Triumph、Touchdown 不可混写维修方法和笔尖。不要把战时广告性别话术当成今天的产品事实。
- **优先关联：** Balance（设计年代）、Triumph nib（笔尖技术）、Touchdown TM（机制转折），并可与现代 pocket pen 建立概念链接，但不应以比较代替历史证据。

### 5. `targa-by-sheaffer` → `sheaffer-targa`（1976–c.1998 家族）

- **身份：** Targa 为 1976 推出的全新产品线，后续长期存在；它是 inlaid nib 的现代化承接者，既不是 Imperial 的改名，也不是 Legacy 的前身。PenHero 记载多数 Targa 为 14K nib，低价全不锈钢款可为 steel nib；这必须按 variant 填写。
- **版本边界：** 标准 Targa（1976–c.1998）与 Slim Targa（1982–1995）分列 sibling；1992–1996 Fred Force 10 为限量/合作特别款，不写进标准 Targa 的默认规格。饰面丰富不等于每种饰面都是独立型号。
- **页面结构：** 一页家族正文 + variant table（standard / all-stainless / slim / selected special edition）；把具体 finish、笔尖、converter 类型留在有来源的行中。旧文所谓“一支现代日用线”要改为版本化资料页。

## P2：重命名、拆分与现代断层

### `犀飞利-sheaffer-帝国元首`：不得继续发布

“帝国元首”不是可靠的英文型号对应。现有中文文章已经承认它可能是 Imperial 或 Legacy 的混合误译；但这两条线的年代、结构与上墨不同：

- **Imperial（1961–c.1998）**：PFM 之后的细长 inlaid-nib 家族；早期 IV/VI/VIII、Triumph/Masterpiece 与后续 Lifetime/Touchdown/cartridge 均有不同配置。1961 早期 IV 和 VI 为 14K inlaid nib；Imperial IV plastic cap/barrel，VI stainless cap，VIII gold-filled cap。不要把 `Imperial`、`Dolphin 500/800/1000`、`Triumph Imperial` 自动合并。
- **Legacy（1995 起、后有 Legacy 2 / Heritage）**：全金属、PFM 尺寸取向、modified Touchdown 且可用 cartridge，18K inlaid nib；不是 Snorkel，不能把 PFM 的伸缩管写过去。

**实施决策：** retire 该中文 slug，并做永久跳转到 `sheaffer-imperial` **仅当**原页内容与数据库/旧 URL 的意图能确认是 Imperial；若无法确认，应 hard-404 并把其搜索别名保留在品牌页面的“错误/旧称”说明中，避免误导进入某个有完整规格的型号页。随后单独创建 `sheaffer-imperial` 和 `sheaffer-legacy` 两个家族页，不要一个页面包办两者。

### `sheaffer-s-connaisseur`：下一批而非本批强行并入

- **身份：** 1985–c.1995 的 Connaisseur，是后期端正、开放式尖的高阶线；与 Targa 的嵌入式尖定位不同。PenHero chronology 可用作年代锚，具体 14K/18K、Lacqué、Grand/regular、converter 与尺寸仍需逐个 catalogue 或可信 archive 复核。
- **建议：** PFM/Snorkel/Targa/Imperial 完成后再做。其优势是链接 1980–1990 年代复兴线，风险是现有资料页容易被“现代复古”的泛叙事填满而没有具体 variant 证据。

### 新增 `sheaffer-icon`：补上现行产品入口

官方当前 Icon 9108 产品页可直接支撑一个**现行型号家族**页面：Art Deco silhouette、wraparound clip with colour inlay、White Dot、polished stainless-steel nib、随盒 piston converter 与两枚 Classic cartridges。页面不能把官网营销语的 “flexible nib” 扩展成具体 flex 等级，也不能将单一 9108 Matte Black SKU 误写成所有 Icon 的颜色、笔尖或价格。应把 9108 作为有 SKU 的 variant，其余颜色/尖型以当前官方产品页再补。

## 建议的实施批次（不扩大到全谱系）

### Phase 60 — `Sheaffer historical anchors`

1. 复用 raw `sheaffer-s-balance`、`sheaffer-s-snorkel`、`sheaffer-s-pfm`、`sheaffer-s-tuckaway`、`targa-by-sheaffer` 的 ID，canonicalize slug/name/title/aliases。
2. 处理 `犀飞利-sheaffer-帝国元首`：先以 checkpoint copy 核验实际内容与旧 slug，再决定 redirect 或 hard-404；新建明确的 `sheaffer-imperial` family，不能直接把内容覆盖到旧混名实体。
3. 创建/更新品牌包：品牌页的“已公开型号”反向集合至少包含 Phase 56 四页 + Balance / Snorkel / PFM / Tuckaway / Targa / Imperial，按历史时期分组；没有来源化的 sibling 不能以“已完整型号页”假装出现。
4. 每页 ≥2 个独立证据组：官方历史广告/目录或一手 archive + PenHero/Richard’s Pens 等专业资料；维修事实另引 Vintage Pens 或同等维修资料，不能用零售 listing 替代。
5. 使用原创 factual SVG，不复用相似金帽、白边产品图，也不把某一 variant 图当全家族产品照。

### Phase 61 — `Sheaffer modern bridge`

1. `sheaffer-s-connaisseur` canonicalize，完成 variant/年代边界。
2. 新增 `sheaffer-legacy` 与 `sheaffer-icon`；Icon 是现行官方来源化页面，Legacy 是历史家族页。
3. 品牌页分为：战前流线、Touchdown/Snorkel 工程、inlaid-nib 传承、后期/现行。每个节点只列真正已发布可打开页面。

### 后续，不应提前塞进本批

Imperial 的 IV/VI/VIII、Snorkel 的 Admiral/Statesman/Crest、Targa slim、Prelude、NoNonsense、Crest Modern、Intrigue 都值得有页面，但先作为 family variant/待建 sibling。只有获得各自的 catalog/model evidence 后再拆独立型号，避免再次制造空壳与版本污染。

## 定向验收清单

- 旧 Craftsman / TM redirect 与 retire 继续生效；Phase 60 不得逆转。
- 每个 raw canonical 页：正文说明“是什么、哪个年代、核心结构、版本差异、维护与购买核对、来源”，并验证正文不是旧文章摘录或营销空话。
- `PFM` 页面同时出现 I/II 的 PdAg 与 III–V 的 14K 边界；不可把 PFM 写成 Legacy 或 Imperial。
- `Snorkel` 页面明确为 family，并不声称所有成员是 Triumph 14K。
- `Imperial` 与 `Legacy` 为两个实体；“帝国元首”不再作为可公开型号标题。
- 品牌页查询所有 `made_by → tVXnzDSFCcPP` 的公开 canonical pens；反向链接与这些公开页面一致，既不漏已发布页，也不列未完成 placeholder。
- 迁移只在 disposable owned copy 测试；验证 duplicate replay 为 `noop`、唯一 maker、品牌 reverse link、redirect/hard-404，以及真实 `data/fpkg.db` main/WAL/SHM 快照未变。

## 资料源（实施时请再次访问并记录 retrievedAt）

### 官方现行

- [Sheaffer Icon 9108 Matte Black 产品页](https://sheaffer.com/products/sheaffer%C2%AE-icon-9108-matte-black-fountain-pen-with-gloss-black-trim-medium) — 当前 SKU、steel nib、converter/cartridges、包装与设计声明；适合 Icon 当前 variant，不可泛化全系列。

### 历史目录与专业档案

- [PenHero — Sheaffer Penography](https://www.penhero.com/PenGallery/Sheaffer/Sheaffer.htm) — 代表型号的年代表；用于确定 family 与时期，不作为每个变体唯一规格来源。
- [PenHero — Sheaffer PFM: The Pen For Men 1959–1968](https://www.penhero.com/PenGallery/Sheaffer/SheafferPFM.htm) — PFM I–V、Autograph、demonstrator、Snorkel、inlaid nib 与时间边界。
- [PenHero — The Snorkel: A Sheaffer Innovation In Filling](https://www.penhero.com/PenGallery/Sheaffer/SheafferSnorkelGuide.htm) — Snorkel/Touchdown 原理与退休时间边界。
- [PenHero — Evolution of the Sheaffer Inlaid Nib](https://www.penhero.com/PenGallery/Sheaffer/SheafferInlaidNibs.htm) — PFM → Imperial → Targa → Legacy → Intrigue 的笔尖谱系；尤其用于否定“所有相似笔都是同一型号”的错误。
- [PenHero — Early Sheaffer Imperials 1961–1962](https://www.penhero.com/PenGallery/Sheaffer/SheafferImperialsEarly.htm) — IV/VI/VIII/Triumph/Masterpiece 的早期辨识与部分规格。
- [Richard’s Pens — Sheaffer Balance](https://www.richardspens.com/ref/profiles/balance.htm) — Balance 家族与战前外形语境。
- [Richard’s Pens — Sheaffer Tuckaway](https://www.richardspens.com/ref/profiles/tuckaway.htm) — 便携家族的年代与阶段边界。
- [Richard’s Pens — Sheaffer Snorkel](https://www.richardspens.com/ref/profiles/snorkel.htm) — Snorkel family 对照资料。
- [Richard’s Pens — Sheaffer PFM](https://www.richardspens.com/ref/profiles/pfm.htm) — PFM profile 的独立交叉来源。
- [Vintage Pens — Snorkel/PFM repair](https://vintagepens.com/FAQrepair/Sheaffer_Snorkel_PFM_repair.shtml) — 仅用于密封件、维修风险与“状态好才能工作”的维护边界。

## 本次不做的事

- 不把 PenHero/Richard’s Pens 图片抓进站点或当作可再授权产品图。
- 不为每一种颜色、笔尖宽度、金属饰面都造一个新实体。
- 不用零售商品页取代历史年代、机制或型号身份的证据。
- 不打开真实数据库，也不以本研究文档代替 checkpoint-copy 实施前的 ID/slug 断言。

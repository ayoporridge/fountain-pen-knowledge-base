# Phase 610 / Phase111 公共正文清理研究记录

日期：2026-08-13

## 范围

Phase 609 对 authoritative catalog 中 740 个公开钢笔实体逐一审读，检查自然中文介绍、规格、历史或版本边界、维护、选购和来源六个维度。校准后的真实缺口为 126 个实体：121 个介绍缺口、8 个维护缺口，其中 3 个实体同时命中两个维度。

这次修订只处理冻结 ledger 中的明确 locator。介绍修订删除公开正文中的施工说明、数据结构词和内容管线残留，不增加新的产品事实。每个 target 都以 entity ID、source marker、旧正文 SHA-256 和精确旧片段锁定；新正文同步写入唯一 published story。规格、版本、关系、引用、媒体和结构化证据保持不变。

## 资料使用原则

- 官方商品页、目录和保修说明用于产品号、结构、供墨及厂商操作说明。
- 有作者和日期的专业文章只说明具体样本及当时市场，不覆盖现行官方资料。
- 论坛资料只在缺少官方故障案例时补充具体样本表现，不上升为通用结论。
- 商品状态、价格和库存均带检索日期，不写成永久事实。
- 维护说明必须落到实际供墨机构和材料；出现卡涩、漏墨、裂纹或异常阻力时停止强拆，交由厂商或有经验的维修者检查。

## Pilot Phase111 四款的持久来源

原 Phase111 pack 在运行时生成 Markdown，仓库中没有独立研究文档。下列来源补齐持久研究记录；Phase 610 只把四款公开正文中的施工语言改成读者可读的产品边界，不改规格和来源表。

### Pilot Elabo 金属轴 FE-25SR

- Pilot 现行目录 PDF：<https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016447&volumeName=00004>
  - exact fileID 指向 FE-25SR。
  - 目录记录黄铜轴帽、14K soft nib、SEF／SF／SM／SB、CON-40／CON-70N、最大径 14.0 mm、全长 140 mm、33.0 g。
- Pilot International Warranty：<https://www.pilot.co.jp/support/warranty/en/fountain/elabo.html>
  - 锁定 FE-25SR，并分别说明 CON-40 与 CON-70N 的操作和避免过度外力的边界。
- The Pen Addict，Brad Dowdy，2013-05-30：<https://www.penaddict.com/blog/2013/5/30/my-fountain-pen-education-the-pilot-metal-falcon>
  - 记录一支借用的 SEF 样本；重量、冷触感和线宽变化属于该样本。
- The Pencilcase Blog，2015-01：<https://www.pencilcaseblog.com/2015/01/pilot-metal-falcon.html>
  - 记录 Pilot 提供的金属样本；约 33 g、CON-70 和作者对 M 尖的观察不构成全型号保证。

### Pilot Elabo 树脂轴 FE-18SR

- Pilot 现行目录 PDF：<https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016450&volumeName=00004>
  - exact fileID 指向 FE-18SR。
  - 目录记录树脂轴帽、14K soft nib、SEF／SF／SM／SB、CON-40、最大径 14.4 mm、全长 137 mm、18.0 g。
- Pilot International Warranty：<https://www.pilot.co.jp/support/warranty/en/fountain/elabo_2.html>
  - 分列 FE-18SR／FE-18SRG，并只给出 CON-40 操作。
- 万年筆愛好家，2024-06-18：<https://www.fpen149.com/pilot-elabo-review/>
  - 作者自购 FE-18SR SEF 并使用 CON-40；写感、流量和改尖视频不覆盖现行原厂规格。

### Pilot Custom NS FKNS-1

- Pilot 现行目录 PDF：<https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016458&volumeName=00004>
  - exact fileID 指向 FKNS-1。
  - 目录记录 EF／F／M／B、树脂轴帽、随附 CON-70N、兼容 CON-40／CON-70N、最大径 15.6 mm、全长 143.9 mm、22.6 g，以及四组当期颜色。
- The Pencilcase Blog，2020-01：<https://www.pencilcaseblog.com/2020/01/review-pilot-custom-ns-fountain-pen.html>
  - 送测样本的旧颜色、价格、CON-40 和写感保留在 2020 年样本范围，不能覆盖现行目录。

### Pilot Lightive P-FLT-1

- Pilot 现行目录 PDF：<https://webcatalog.pilot.co.jp/products/fileDownload?fileID=t010000016927&volumeName=00004>
  - exact fileID 指向 P-FLT-1。
  - 目录记录 F／M 特殊合金钢尖、树脂轴帽、CON-40／CON-70N、最大径 13.5 mm、全长 142 mm、12.3 g，以及六组当期颜色。
- 紙とペンのブログ，初版 2021-12-04：<https://kamitopen.jp/fountain-pen/lightive-fountain-pen/>
  - 文章后续更新；active yellow 样本、一年停放测试、重量和卡帽体验均属于作者的具体样本与方法，不是 Pilot 保证。

### Pilot 共同目录入口

- Pilot 万年笔目录：<https://webcatalog.pilot.co.jp/products/DispCate.do?category=%E4%B8%87%E5%B9%B4%E7%AD%86%2F%E4%B8%87%E5%B9%B4%E7%AD%86&volumeName=00004>
  - 只用于确认四款在 Pilot 目录中的归属；逐款规格仍由各自 exact fileID 承担。

## 维护缺口的来源与写入边界

### Aurora Ipsilon Resin B11-N、Optima 996-DOR、Optima 997-CN

- Aurora FAQ：<https://aurorapen.it/faq/>
- B11-N 的商品资料明确为 cartridge/converter；维护段据此区分墨囊和 converter，说明常温清水冲洗、自然干燥和异常停手。
- 996-DOR 与 997-CN 为内置活塞笔；维护段采用 Aurora 的活塞操作原则。996-DOR 的 hidden reserve 只属于该商品说明，不能复制给 997-CN。
- FAQ 不支持自行拆解笔舌、活塞或接口，也不支持用热水、酒精、强溶剂和研磨剂清洁。

### Santini Libra Intenso

- Santini FAQ：<https://www.santini-italia.com/faqs.html>
- Libra Intenso 的维护只写活塞上墨、常温清水吸排、树脂表面轻拭和异常停手，不再混列墨囊、converter、真空阀、银器或硬橡胶护理。

### SCRIBO Feel

- SCRIBO Feel 官方商品页：<https://www.scritturabolognese.com/en/negozio/fountain-pens/feel-en/feel-blue-black-2/>
- Fountain Pen Network，Melograno 样本：<https://www.fountainpennetwork.com/forum/topic/375576-my-search-for-an-omas-worthy-nib-a-review-of-the-scribo-feel-melograno/>
- Fountain Pen Network，活塞故障样本：<https://www.fountainpennetwork.com/forum/topic/353003-scribo-feel-piston-problem/>
- 官方商品页确认 Feel 的活塞结构；论坛只补充具体样本和故障停手边界。维护段不把论坛经历写成普遍故障率，也不建议用户强拆活塞。

### Stipula Etruria Magnifica

- Stipula Etruria Magnifica Avorio：<https://www.stipula.com/en/product-page/etruria-magnifica-avorio-stilo>
- Stipula Etruria Magnifica Ebonite Blu Nero：<https://www.stipula.com/product-page/etruria-magnifica-stilo-ebanite-blu-nero>
- 官方页面支持活塞结构和具体材料分支。维护段按活塞笔处理，并把树脂与硬橡胶的表面护理分开；不写 converter、真空阀、银器或镀层的通用模板。

### Visconti Divina Elegance

- Visconti 商品页：<https://www.visconti.it/en/shop/1-luxury-pens/73-divina-elegance-fountain-pen.html?sc=45>
- Visconti filling systems：<https://www.visconti.it/en/pen-filling-systems.html>
- 维护段只采用该款资料支持的供墨系统和材料边界。透明件、金属件和机构出现异常时停止用力，不把 Mirage 或其他系列的 converter 说明复制过来。

### Visconti Mirage Original

- Visconti filling systems：<https://www.visconti.it/en/pen-filling-systems.html>
- Visconti standard converter：<https://www.visconti.it/it/shop/7-accessori/188-converter-standard-stilografica.html>
- Mirage Original 按 cartridge/converter 维护；说明 converter 的装卸、常温清水冲洗和自然干燥，不混入活塞、真空阀、银器、青铜或硬橡胶护理。

## 验收边界

- 126 个 target 的正文替换必须同时命中 entity body 与唯一 published story 各一次。
- 首次应用必须全部 126 个 target 同时处于原始状态；完整 terminal 状态只允许 replay noop。任何单片段预替换、正文夹带改动或部分 target 已应用都会失败。
- Wancher 两个重复公开名称同步修改 entity name 和 story title，并检查 740 项公开名称与故事标题无碰撞。
- wrapper 只写 caller-owned checkpoint copy；authoritative source 与真实 `data/fpkg.db` 作为受保护 family，只做前后快照校验。
- 每个变更实体重新执行 fact、language、media 三审，再通过 `publishEntity` 正式发布；规格、来源、变体、关系和媒体做 application 前后 logical digest 守恒。

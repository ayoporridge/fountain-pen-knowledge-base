---
quick_id: 260811-lhd
status: complete
scope: direct-content-repair
date: 2026-08-11
source_candidate: .planning/quick/260811-kc9-add-sourced-pineider-grande-bellezza-for/checkpoint/catalog.db
source_candidate_sha256: 23bcef02269a11600d59b1d5e1b466d984664b5acb7e6f2f6a64a9c116ad8b74
autonomous: true
---

# Add sourced Pineider Millenium PP4801／945 and Psycho PP4301／468 packages

在 SHA-256 为 `23bcef02269a11600d59b1d5e1b466d984664b5acb7e6f2f6a64a9c116ad8b74` 的 Phase 590 owned candidate 的一份新 caller-owned checkpoint 上，新增 Pineider Millenium `PP4801 / 945` 与 Psycho `PP4301 / 468` 两个来源化型号，并把 canonical Pineider 品牌导航从七个公开型号扩为九个。全过程不得 SQLite-open 或写入 Phase 590 source candidate 与 `data/fpkg.db`，不得访问 Turso，不得恢复 search／LLM，也不得扩建通用 Playwright、readiness 或 audit 基础设施；本 quick 只交付这两个型号，full corpus goal 继续保持 active。

## Task 1: 固化 exact identity、SKU／edition／trim／nib／filling 边界、自然中文正文与两张原创事实图

- **Files:** `.planning/content-research/pineider-brand-phase591.md`、`.planning/content-research/pineider-millenium-phase591.md`、`.planning/content-research/pineider-psycho-phase591.md`、`public/images/library/site-original/phase591/pineider/pineider-millenium.svg`、`public/images/library/site-original/phase591/pineider/pineider-psycho.svg`
- **Action:** 直接读取并记录页面定位信息，以 Pineider 的 [Millenium `PP4801 / 945` 商品页](https://www.pineider.com/us/products/millenium-fountain-pen-250-years-of-pineider-945)、[Psycho `PP4301 / 468` Palladium 商品页](https://www.pineider.com/us/products/psycho-fountain-pen-palladium-468)、[当前 writing-instrument collections](https://www.pineider.com/us/pens/collections) 与 2024-05-22 [Collector’s Jewel Pens](https://magazine.pineider.com/en/collectors-jewel-pens-by-pineider/) 为 primary；用 Pen Savings 的 Millenium 商品页、Chatterley 的 `PP4801`／`PP4301-099` 档案、Appelboom 的 Psycho Rose Gold 档案，以及能回读完整 SKU 的可靠专业资料交叉。每一项发布事实必须来自直接页面 readback 与具名 locator，不得用搜索摘要、价格、库存、网页色块或不可回读的缓存代替来源。
- **Action:** Millenium 只锚定当前官方 **单 n 拼写** `Millenium Fountain Pen`、`PP4801 / 945` 与当前子 SKU 集 `SSPFXPP4801G20`、`SSPMXPP4801G20`、`SSPSXPP4801G20`、`SSPBXPP4801G20`、`SSPEXPP4801G20`；将 14K hyperflex 金尖与 F／M／S／B／EF 选择绑定这些 current child SKUs，而不是扩展到所有 Pineider 金尖。记录官方 250 周年、Italy、88 pieces、aluminum + black PVD、marine-steel clip、Twist Magnetic Lock 与 Piston Filler；官网未给出的尺寸、重量和发布日不得从同名或相似零售条目拼入 current exact field。2024 官方文章及部分零售标题使用 `Millennium` 双 n 时，只保留为有来源拼写 alias，不建立第二实体。
- **Action:** `PP4801G20` 在 Truphae／ItalianPens／旧零售档案中还被写作 `Arman Black Aluminum`、`Arman Black PVD` 或 `Arman Trilogy`。把这些记录放入同一个 identity／name conflict：当前官方 `PP4801 / 945` 商品页和当前 collection 决定 canonical Millenium identity；Arman 记录保留为 historical／ambiguous same-code evidence，在没有官方 rename／continuity 证明时不得成为 Millenium alias，也不得把 Arman 的开孔结构、68 g、Trilogy／Doppler 叙述或其他 edition 规格回填当前 Millenium。conflict member、source locator 与 resolution 必须同时存在，不能静默丢弃同码异名资料。
- **Action:** Psycho 只建立一个 canonical `Pineider Psycho Fountain Pen` 型号，锚定 `PP4301 / 468`；当前 Palladium 页面公开的 `SSPSXPP4301099`、`SSPMXPP4301099`、`SSPFXPP4301099`、`SSPBXPP4301099`、`SSPEXPP4301099` 与 `ARGENTO` 选择绑定 Palladium／`PP4301-099` scope。记录官方 140 mm、Ø18.5 mm、Italy、925 silver、nanofusion、limited edition 与 F／M／S／B／EF selector；Palladium、Yellow Gold、Rose Gold 是同一 Psycho family 的 trim variants，不拆成三个 model entity，也不为尚未回读的 gold／rose-gold 子 SKU 编造尾缀。14K gold hyperflex、cartridge/converter 与每种 trim／color 88 支只在官方 Masterpiece-family 文章及 exact professional-secondary 页面共同支持的 scope 内进入字段；当前 exact 页面未写出的 nib metal、fill 或 edition count 必须保留证据层级说明。
- **Action:** Psycho 的 filling conflict 必须显式解决：Pineider 2024 article、Appelboom Rose Gold 与 Chatterley 的正文支持 cartridge/converter，Chatterley 页面若同时在结构化属性中显示 `Piston Filler`，后者作为内部矛盾的 rejected evidence 保留，不能产生 piston／converter 二选一字段。Palladium／Yellow Gold／Rose Gold 的 plating 只绑定各自 trim，不能把 `PP4301-099` 当作三种饰面共用 exact SKU；88-per-color 也必须写成“每个 trim／color、每种 writing mode”的 edition scope，不能改写成整条 family 合计 88。
- **Action:** 三篇 Markdown 都写成面向普通读者的完整自然中文：品牌页链接 Avatar UR、Arco、Rock、Classic Palladium、Tempi Moderni、Grande Bellezza Forged Carbon、Mystery Fast Filler、Millenium、Psycho 九个 canonical 节点；两个型号页各至少 2,000 Unicode 字符，包含身份、exact SKU／variant、规格、版本与冲突、上墨与维护、购买核验、图片说明和具名来源，正文不暴露内部数据结构术语。两张 SVG 都是独立构图、独立 SHA-256 的 1600×900 site-original 事实示意图，带 `<title>`、`<desc>`、`role="img"` 与“本站原创示意图／非产品照片”边界，不复制品牌 logo、商品照片、真实笔形、镂空／nanofusion 纹理、颜色、比例、笔夹、编号或机构剖面。
- **Automated verify:** `xmllint --noout public/images/library/site-original/phase591/pineider/pineider-millenium.svg public/images/library/site-original/phase591/pineider/pineider-psycho.svg` 通过；Task 3 的定向测试逐篇验证 Unicode 长度、章节、official + professional-secondary 来源、至少两个非图片 independence group、品牌九链接、SVG 1600×900、accessibility 文本、唯一路径与唯一 SHA-256，并逐项核对上述 identity／SKU／edition／trim／nib／filling conflict scope。
- **Done:** `PP4801 / 945` 与 `PP4301 / 468` 都有可追溯的 current exact scope；Millenium／Millennium、Millenium／Arman、Psycho 三种 trim、88-per-color、14K／nib-width 与 converter／piston 差异均被保留并分配到明确 scope，没有组合出来源中不存在的混合型号。

## Task 2: 继承 Phase 590 品牌包并建立 fail-closed CuratedEntityPack 发布 wrapper

- **Files:** `scripts/data/phase591-pineider-millenium-psycho.ts`、`scripts/apply-phase591-pineider-millenium-psycho-content.ts`
- **Action:** 从 `scripts/data/phase590-pineider-forged-carbon-mystery-fast-filler.ts` 复用 `PHASE590_PINEIDER_BRAND_ID` 与 `phase590PineiderBrandPack`，导出 `PHASE591_PINEIDER_BRAND_ID`、`PHASE591_IDS`、`PHASE591_SLUGS` 与按 brand → Millenium → Psycho 固定顺序的三包数组；新增且仅新增 `phase591-pineider-millenium`／`pineider-millenium-pp4801-945` 与 `phase591-pineider-psycho`／`pineider-psycho-pp4301-468`。品牌 refresh 只追加本批来源、九型号导航 claim 与新正文；不得导入或调用 Phase 588–590 的七个既有 model pack，也不得重建、重放或改写这些实体。
- **Action:** 为两个型号建立 depth-A `CuratedEntityPack`，完整填入 aliases、source registry／item provenance、independence group、fact scopes、core claims、variants、model spec、field-level evidence、timeline、resolved conflicts 和各自唯一 primary media。Millenium 必须包含 current `PP4801 / 945`／五个 `PP4801G20` child SKU、88 pieces、单／双 n spelling 与 Arman same-code identity conflict；Psycho 必须包含 current Palladium `PP4301 / 468`／`PP4301-099` child SKU、三个 trim scopes、official limited status、retailer 88-per-color scope、14K family/exact evidence，以及 cartridge/converter 对 retailer piston metadata conflict。被拒绝或只属于 sibling／historical scope 的证据必须保持 non-qualifying。两支型号各建立且仅建立一个指向 canonical `phase140-brand-pineider` 的 `made_by` 和一条品牌 `reverse`。
- **Action:** 以 Phase 590 wrapper 为最近 analog，实现 Phase 591 wrapper 的全套保护：写入前拒绝任何非空 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`FPKG_DATABASE_URL`；校验 reviewer、protected snapshot、caller-owned realpath、regular file、非 symlink、单 hard-link、与 protected catalog 非同 inode、client 真实绑定和 migration 032+。初始 Pineider brand source 只接受 Phase 590 brand marker 或本批 marker；entity／slug／name／alias 任一碰撞都 fail closed。先准备两个新 identity 与唯一 maker／reverse topology，再走现有 `applyCuratedContentPacks` 的 fact／language／media／publication review 与 `publishEntity`，最后验证 contract 3 readiness、`public_entities`、四类 current-hash approved review、唯一关系和完整 replay。
- **Action:** 在 apply 前通过与 Phase 590 相同的全实体 digest 覆盖，记录除两个新 target 外全部公开 Pineider model 的 stories、references、aliases、scopes、claims、specs、variants、media、timeline、links、publication 与 reviews；apply 后逐个复算并要求七个既有 model digest 全部不变。brand refresh 允许自身 current hash 更新，但任何既有 model 被品牌导航更新连带改写都必须使 wrapper 失败。
- **Automated verify:** `pnpm exec tsc --noEmit --pretty false && pnpm exec biome check scripts/data/phase591-pineider-millenium-psycho.ts scripts/apply-phase591-pineider-millenium-psycho-content.ts && git diff --check -- scripts/data/phase591-pineider-millenium-psycho.ts scripts/apply-phase591-pineider-millenium-psycho-content.ts`。
- **Done:** pack set 精确等于 canonical Pineider brand + Millenium + Psycho；首次 apply 能审核并发布两个缺失型号，任何来源库、远端选择、identity、SKU alias 或保护库越界都在业务写入前失败，第二次完整三包重放全部为 `noop`，既有七个 Pineider model 字节语义不变。

## Task 3: 从 Phase 590 candidate 建新 checkpoint，执行定向回归与完整离线发布验收

- **Files:** `tests/content/phase591-pineider-millenium-psycho.test.ts`；本 quick 本地保留但不提交的 `checkpoint/`、`evidence/`、`260811-lhd-SUMMARY.md`
- **Action:** 在任何 SQLite client 建立前，用 `snapshotCatalogFiles` 固定 `data/fpkg.db` 的 main／WAL／SHM 与 Phase 590 candidate family，并校验 candidate main hash 等于 frontmatter 值。只通过 `copyCheckpointedCatalogToDisposableCopy` 把 Phase 590 candidate 复制到本 quick 新建的 caller-owned `checkpoint/catalog.db`；source candidate 只允许文件快照、hash 与 checkpoint copy，不得被 SQLite-open。所有 migrate、apply、query、audit 与本地页面读回都只指向新 copy 或其临时后继 copy；三个数据库选择变量始终显式置空，任何 Turso 调用都视为失败。
- **Action:** 定向测试沿用 Phase 590 的单测试模式并覆盖：entity／slug／name／alias 四类 collision 拒绝；伪造远端环境在写入前拒绝且 owned hash 不变；三包身份、来源、正文、媒体、spec evidence 与 conflict members 完整。Millenium 必须读回 `PP4801 / 945`、五个 child SKU、88、aluminum／black PVD、14K hyperflex、marine-steel clip、Twist Magnetic Lock、piston，并证明双 n spelling 可检索而 Arman same-code 资料不授权 current name、dimensions、weight 或结构。Psycho 必须读回 `PP4301 / 468`、Palladium `PP4301-099` child SKU、140 mm、18.5 mm、925 silver、nanofusion、三个 trim scopes、F／M／S／B／EF、limited status、14K 与 cartridge/converter 的证据层级，并证明 retailer piston metadata 被保留但 rejected，88-per-color 没有变成 family-total 88。
- **Action:** 每个 target 必须有一个 spec、一个唯一 primary media、一个唯一 `made_by`、一条唯一 `reverse`、四类 current-hash approved review、readiness blocker 0 和 public membership。测试以实际 baseline + missing-target delta 断言，不硬编码全库总数：在 exact Phase 590 candidate 上两个 target 必须先缺失，Pineider 公开型号从 7 增到 9，current public／content-ready 增加 2；既有七个 Pineider model digest 全部不变，首次三包发布后再次 apply 的 brand 与两个 model 都为 `noop`。
- **Action:** 随后对新 checkpoint 运行 SQLite `integrity_check`／`foreign_key_check`、readiness audit、public-media audit、entity-quality audit、library contract、production build，以及本地 `/brand/pineider`、`/pen/pineider-millenium-pp4801-945`、`/pen/pineider-psycho-pp4301-468` 和两张 SVG 的 HTTP/readback；只调用仓库已有 command 与 harness，不修改通用测试基础设施。readiness 的 published/public blocker 必须为 0，current-public approved primary-media path duplicate group 必须为 0，品牌页必须回读两个新增链接，两个型号页必须回读 exact model code 与关键 conflict marker，HTTP SVG hash 必须与提交文件一致。
- **Automated verify:** `FPKG_PHASE591_SOURCE_DATABASE="$PWD/.planning/quick/260811-kc9-add-sourced-pineider-grande-bellezza-for/checkpoint/catalog.db" TURSO_DATABASE_URL='' TURSO_AUTH_TOKEN='' FPKG_DATABASE_URL='' pnpm exec tsx --test tests/content/phase591-pineider-millenium-psycho.test.ts`，随后执行 `pnpm exec tsc --noEmit --pretty false`、对本批 3 个 TypeScript 文件的精确 `pnpm exec biome check`、两张 SVG 的 `xmllint --noout`、本批 8 个内容文件的 `git diff --check -- <exact paths>`，并保存 checkpoint-only audits／build／readback 的 stdout、stderr、source-family snapshot 与 hash 证据。
- **Action:** 实现提交只允许精确暂存以下八个内容文件：三篇 Phase 591 research Markdown、两张 Phase 591 SVG、Phase 591 data pack、Phase 591 wrapper、Phase 591 定向测试。使用逐路径 `git add -- <eight exact paths>` 和逐路径 `git diff --cached --name-only` 核对；不得使用目录、glob 或 `git add -A`，不得暂存 quick PLAN／SUMMARY／STATE、checkpoint／evidence、任何 `.next-phase*`、原有 research 改动或 `.planning/quick/260719-665-montblanc-writers-edition-patron-of-art-/`。
- **Done:** 新 owned checkpoint 上 Pineider 九个型号全部可公开，Millenium、Psycho 与两张图片可本地读回；target test、TypeScript、精确 Biome、SVG、diff、SQLite、readiness、media、quality、library、production build 与 HTTP readback 全部通过。Phase 590 candidate 与 `data/fpkg.db` family 快照不变，SUMMARY 明确本 quick 完成的只有两个 Pineider 型号，full corpus goal 仍为 active，未发生 Turso 访问。

## Threat model

| Threat ID | Category | Severity | Disposition | Mitigation |
| --- | --- | --- | --- | --- |
| T-591-01 | Tampering | critical | mitigate | Phase 590 source candidate 与 `data/fpkg.db` 只做文件快照／hash／checkpoint copy；所有 SQLite 工作限制在经 inode、link 与 realpath 校验的新 owned copy，结束时复核 main／WAL／SHM。 |
| T-591-02 | Spoofing | high | mitigate | wrapper 与定向测试在任何业务写入前拒绝全部 remote/database override，client 必须真实绑定 caller-owned copy，负例证明拒绝不会改变 owned hash。 |
| T-591-03 | Tampering | high | mitigate | entity、slug、name、alias、maker/reverse topology、same-code conflicts 与既有七个 Pineider model digest 全部 fail closed，防止重复实体或静默改写。 |
| T-591-04 | Repudiation | medium | mitigate | 每个事实保留 source item、direct locator、scope、field evidence、conflict member、resolution 与 current review hash；搜索摘要不具备发布资格。 |
| T-591-05 | Information disclosure / rights | medium | mitigate | 外部网页只存摘要和定位信息；主图只使用两张独立 site-original SVG，不复制 logo、商品照片、真实外观、纹理、编号或机构。 |
| T-591-SC | Supply chain | low | accept | 本 quick 不安装或升级 npm／pip／cargo package，package manifest 与 lockfile 不在八文件 allowlist，现有依赖风险不因本批扩大。 |

## Source coverage audit

| Source | Item | Task | Status | Notes |
| --- | --- | --- | --- | --- |
| GOAL | 在 Phase 590 owned candidate 后继 copy 发布 Millenium `PP4801 / 945` 与 Psycho `PP4301 / 468` | 1–3 | COVERED | 来源、完整正文、原创媒体、pack、审核—发布与离线 readback 构成完整闭环。 |
| REQ | Quick task 无 ROADMAP requirement ID | — | N/A | 不虚构 requirement ID。 |
| RESEARCH | Phase 588–590 Pineider research／data／wrapper／test continuation pattern | 1–3 | COVERED | 继承 canonical brand、scope/conflict、owned-copy、digest protection、reviews 与 replay pattern。 |
| RESEARCH | Millenium current official identity、88-piece anniversary、materials、14K hyperflex、Twist Magnetic Lock 与 piston | 1–3 | COVERED | exact product、child SKU、拼写与 same-code Arman 冲突均有明确落点和回归断言。 |
| RESEARCH | Psycho current Palladium identity、925 silver／nanofusion、三 trim、Masterpiece family、limited／14K／cartridge-converter scope | 1–3 | COVERED | edition、trim、nib 与 filling 分层，不把 retailer piston metadata 或 sibling SKU 拼入 current field。 |
| CONTEXT | 新 caller-owned checkpoint；source candidate 与真实库不得 SQLite-open／写入；不访问 Turso | 2–3 | COVERED | 写前 source-family snapshot、copy-only 路径、wrapper fail-closed 与写后 snapshot 双重证明。 |
| CONTEXT | 复用 canonical Pineider 与 Phase 590 brand pack；不重放／重建既有七个 model | 1–3 | COVERED | brand-pack inheritance、三包顺序、collision preflight 与七 model digest 保护。 |
| CONTEXT | 完整自然中文、canonical brand navigation、两张独立 1600×900 site-original SVG | 1–3 | COVERED | 九链接、正文长度／章节、图片可访问性／唯一 hash 与 HTTP readback 全部自动验证。 |
| CONTEXT | CuratedEntityPack reviews／publication；search／LLM withdrawn；不扩通用验收设施 | 2–3 | COVERED | 复用现有 pack、review、publish、audit、build 与 readback paths，不增加横向基础设施。 |
| CONTEXT | collision 与 existing-model digest protection | 2–3 | COVERED | 四类 identity collision、same-code scope、全实体 digest 和 replay 均进入 blocking regression。 |
| CONTEXT | exact allowlist staging；保留所有无关工作 | 3 | COVERED | 八文件逐路径 staged-set gate，明确排除用户 research、checkpoint、`.next-phase*` 与 Montblanc quick。 |
| CONTEXT | broad corpus goal 不得宣称完成 | 1–3 | COVERED | Objective、Done 与 SUMMARY contract 均限定为两个型号，full corpus goal 保持 active。 |

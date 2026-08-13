import type { Phase610SemanticPatch } from "./semantic-cleanup-types";

const AURORA_FAQ_URL = "https://aurorapen.it/faq/";

const PILOT_PIPELINE_PARAGRAPH =
  "如果读者是从品牌页漫游而来，made_by 关系只说明制造者与导航归属，不意味着四页可以共享 payload。每一页的 current scope、source item、spec evidence 和 primary media 都归目标实体自己所有。反向导航增加的是四个精确页面，不会产生第五个 generic Elabo，也不会让一个 sibling 成为另一个的 redirect。";

const PILOT_READER_PARAGRAPH =
  "这四款都出自 Pilot，但每款的材料、供墨、尺寸、重量和在售配置都应单独核对。Custom NS、两款 Elabo 与 Lightive 可以互相比较，不能因为名称或品牌相近就借用彼此的规格；选购时仍要回到完整型号、商品代码和当期官方资料。";

export const phase610GroupBPatches = [
  {
    manifestIndex: 5,
    entityId: "phase115-aurora-ipsilon-demo-colors",
    brandEntityId: "CJXe8UpnkHLJ",
    slug: "aurora-ipsilon-demo-colors",
    expectedName: "Aurora Ipsilon Demo Colors",
    expectedStoryTitle: "Aurora Ipsilon Demo Colors：六色与两组饰件边界",
    expectedSourceMarker:
      "curated-content:phase606-aurora-ipsilon-demo-colors-care-refresh-v1:d64ef097af1c9b67f6d6894bce3bc7e382428221816a445f1c35e585268af396",
    expectedBodySha256: "63a56bbad5a1a34d6967527b2e082c4e3e0f125ede3a9b012e0f3e0e17819216",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "这意味着“任选一种颜色，再任选一种饰件”不是来源支持的结论。本站把六色保存为 current product choices，同时保存两组对应关系，不把它们拆成自由组合的 variants。若想先理解 Ipsilon 为什么必须按 sibling 阅读，可返回 [Aurora Ipsilon 家族导航](/article/aurora-ipsilon)；若想比较不透明黑色树脂的 exact SKU，则进入 [Aurora Ipsilon Resin B11-N](/pen/aurora-ipsilon-resin-b11-n)。",
        newText:
          "这意味着“任选一种颜色，再任选一种饰件”不是来源支持的结论。六种颜色与饰件、笔尖的搭配应按官方列出的两组来读，不能任意组合。想了解 Ipsilon 各款之间的差异，可返回 [Aurora Ipsilon 家族导航](/article/aurora-ipsilon)；若想比较不透明黑色树脂款，则进入 [Aurora Ipsilon Resin B11-N](/pen/aurora-ipsilon-resin-b11-n)。",
        evidenceLocators: ["entity.body_md:L5-L13"],
      },
      {
        oldText: "## 官方 current scope 能证明什么",
        newText: "## 官方资料能确认什么",
        evidenceLocators: ["entity.body_md:L5-L13"],
      },
      {
        oldText:
          "官方 category 与 PDF 同属 Aurora official independence group，因此它们是同一官方来源体系的两个 locator，而不是两份互相独立的复核。它们共同支撑 glossy colored resin、clear grip、六色名称与两组 trim/nib。这里的 stainless-steel nib 和 gold-plated steel nib 必须跟随各自颜色组，不能被简写成“所有 Demo 都是同一种尖”。",
        newText:
          "Aurora 的分类页与配套 PDF 来自同一套官方资料，不能当作两份彼此独立的复核。两者共同列出 glossy colored resin、clear grip、六种颜色与两组饰件／笔尖搭配。stainless-steel nib 和 gold-plated steel nib 必须跟随各自颜色组，不能简写成“所有 Demo 都是同一种尖”。",
        evidenceLocators: ["entity.body_md:L5-L13"],
      },
      {
        oldText:
          "availability 只是一张日期明确的快照：2026-07-21 检索时，官方仍把 Demo Colors 放在当前产品导航中。这不是永久在售承诺，也不证明每一种颜色当日均有现货。未来复查若发现页面、颜色或组合变化，应建立新的 dated scope，而不是覆盖旧证据的日期。",
        newText:
          "截至 2026-07-21，Aurora 官网仍列出 Demo Colors；这只说明当日的目录状态，不是永久在售承诺，也不证明六种颜色当日都有现货。以后若页面、颜色或组合发生变化，应保留这次检索日期，再补充新的状态。",
        evidenceLocators: ["entity.body_md:L5-L13"],
      },
      {
        oldText:
          "官方材料没有在本批 locator 中给出可以安全转录的尺寸、重量或墨水容量，所以这些字段不补写。产品图可能产生比例印象，但视觉推算不是规格证据。本站原创 SVG 只画“六色／两组”的信息结构，不临摹产品照片、不使用 Aurora logo，也不证明真实色差、材质光泽或尺寸比例。",
        newText:
          "这批官方材料没有给出可安全转录的尺寸、重量或墨水容量，因此不能据此补写这些数字。产品图可能造成比例印象，但视觉推算不能代替规格。页面中的原创 SVG 只说明“六色／两组”的关系，不临摹产品照片、不使用 Aurora logo，也不证明真实色差、材质光泽或尺寸比例。",
        evidenceLocators: ["entity.body_md:L5-L13"],
      },
      {
        oldText:
          "尤其要避免“官方 PDF 没写，所以用旧文章补齐”的做法。来源缺口不是邀请拼接的空位。当前 scope 只接受当前官方 locator 明确支持的字段；2020 scope 另存 C/C、尖宽、lineup 与 gift，并在结构化 evidence 中不 qualify current stable fields 或 availability。",
        newText:
          "尤其要避免“官方 PDF 没写，所以用旧文章补齐”的做法。来源缺口不是邀请拼接的空位。现行配置只采用当期官方资料明确列出的内容；2020 年文章里的 C/C、尖宽、产品阵容与赠墨，只说明当年的市场情况。",
        evidenceLocators: ["entity.body_md:L19-L21"],
      },
      {
        oldText:
          "cartridge/converter 也因此需要准确归属：它在本页作为 2020 dated professional record 保存，而不是伪装成由 2026 PDF 单独确认的 current stable spec。如果未来 exact current 页面明确给出上墨方式，可以新增 current evidence；在此之前，读者能看到历史记录及其日期，但不会被误导为无日期的现行保证。",
        newText:
          "cartridge/converter 也要带上时间：现有依据来自 2020 年的专业文章，并非 2026 年 PDF 单独确认的现行规格。若以后 Aurora 的当期商品页明确写出上墨方式，再据此更新；在此之前，这项信息只能作为有日期的历史记录来读。",
        evidenceLocators: ["entity.body_md:L19-L21"],
      },
      {
        oldText:
          "[Resin B11-N](/pen/aurora-ipsilon-resin-b11-n) 的 exact current evidence 是 black resin、B11-N、cartridge/converter 与 gold/chrome finish options。它没有 Demo 的六色分组，也没有 clear grip 证据。反过来，Demo 的六色与两组尖饰组合也不能写进 B11-N。两页互链是为了比较，不是建立 pen-to-pen topology。",
        newText:
          "[Resin B11-N](/pen/aurora-ipsilon-resin-b11-n) 的官方商品页列出 black resin、B11-N、cartridge/converter 与 gold/chrome finish options。它没有 Demo 的六色分组，也没有 clear grip 的说明。反过来，Demo 的六色与两组尖饰组合也不能写进 B11-N；两页互链只是为了方便比较。",
        evidenceLocators: ["entity.body_md:L41-L49"],
      },
      {
        oldText:
          "两支具体 pen 都通过 made_by 指向既有 Aurora brand，品牌反向导航由图谱机制生成。[家族导航](/article/aurora-ipsilon) 不连 maker，因为一个解释 sibling 结构的 article 不是商品。正文链接与关系边保持分离，读者可以顺畅漫游，数据库仍保留准确语义。",
        newText:
          "Demo Colors 与 Resin B11-N 都属于 Aurora Ipsilon 家族，但各自保留自己的颜色、饰件、笔尖和上墨资料。[家族导航](/article/aurora-ipsilon) 用来解释各款差异，不能代替某一支具体钢笔的商品说明。",
        evidenceLocators: ["entity.body_md:L41-L49"],
      },
      {
        oldText:
          "官方 current 文案属于 official marketing：适合确认名称、当前导航与明确配置，不等于独立体验。Bertram 文章属于有作者、有发布日期的 professional context：适合记录当时的产品线与销售呈现，不等于 2026 official listing。编辑推论只用于解释为什么不能跨日期拼接，不创造新的产品事实。",
        newText:
          "Aurora 的官方文案适合确认名称、当期目录与明确配置，但不等于独立使用体验。Bertram 的文章有作者和发布日期，适合了解 2020 年的产品阵容与销售呈现，不能当作 2026 年的官方清单。两类资料不能跨日期拼接，也不足以创造新的产品事实。",
        evidenceLocators: ["entity.body_md:L41-L49"],
      },
      {
        oldText:
          "本页没有第一人称试写或拥有经历，也不从照片推断重量、平衡、笔尖软硬、书写顺滑度。若以后加入用户样本，应明确到作者、日期、具体样本和观察范围，且不能覆盖官方 current scope。",
        newText:
          "现有资料不足以确认实际书写体验，也不能从照片推断重量、平衡、笔尖软硬或书写顺滑度。若以后加入用户样本，应注明作者、日期、具体钢笔和观察范围，且不能覆盖官方资料已经明确的配置。",
        evidenceLocators: ["entity.body_md:L41-L49"],
      },
      {
        oldText:
          "截至 2026-07-21，可安全写入 current scope 的是 glossy colored resin、clear grip section、六色，以及两组明确 trim/nib 对应。2020 文章中的 C/C、EF/F/M/B/italic、then-lineup 与 matching ink gift 保留在 dated scope。这个切分比一张字段更多的规格表更有用，因为每个字段都能回到自己的时间、来源与对象。",
        newText:
          "截至 2026-07-21，官方资料可以确认 glossy colored resin、clear grip section、六种颜色，以及两组明确的饰件／笔尖对应。2020 年文章中的 C/C、EF/F/M/B/italic、当时的产品阵容与 matching ink gift 只代表当年的情况。这样区分后，每项信息都能回到自己的时间、来源和对象。",
        evidenceLocators: ["entity.body_md:L53-L53"],
      },
    ],
  },
  {
    manifestIndex: 8,
    entityId: "phase115-aurora-ipsilon-resin-b11-n",
    brandEntityId: "CJXe8UpnkHLJ",
    slug: "aurora-ipsilon-resin-b11-n",
    expectedName: "Aurora Ipsilon Resin B11-N",
    expectedStoryTitle: "Aurora Ipsilon Resin B11-N：exact current 与样本分开读",
    expectedSourceMarker:
      "curated-content:phase115-aurora-ipsilon-resin-b11-n-v1:3e6bba2344392f63a6478afde1b125d7181052df3ce02fcc6ca25a244f189a1d",
    expectedBodySha256: "489aec1390d148be4cc933f1204b542cadd30c16ace813919b617684b543d17c",
    dimensions: ["introduction", "maintenance"],
    defectCodes: ["public_internal_editorial_language", "missing_actionable_maintenance"],
    replacements: [
      {
        oldText: `# Aurora Ipsilon Resin B11-N：先锁定商品代码，再谈家族

“Ipsilon Resin”可以指向一条产品语境，但这个页面只处理 exact B11-N。Aurora 官方商品页在 2026-07-21 检索时给出 SKU B11-N、black resin、cartridge/converter，以及 gold/chrome finish options。把商品代码放在标题里，是为了阻止另一个 Resin 样本、旧文章或 sibling line 的配置滑进当前规格。

想理解更大的结构，可先看 [Aurora Ipsilon 家族导航](/article/aurora-ipsilon)；想比较彩色树脂、透明握位及两组饰件／钢尖，则进入 [Aurora Ipsilon Demo Colors](/pen/aurora-ipsilon-demo-colors)。三页互相可达，但正文链接不创造 pen-to-pen 或 article-to-pen 图关系。

## exact current scope

exact official listing 是 B11-N 当前字段的首要 authority。它支撑黑色树脂、cartridge/converter 与金色／铬色饰件选项；official current Ipsilon category 只补充当前导航语境。两个页面同属 Aurora official independence group，因此不能被计成两份独立来源来夸大确信度。

availability 明确标注为 2026-07-21 retrieval snapshot。它说明检索日页面仍处在当前商品路径中，不保证未来在售，也不保证每个 finish 同时有库存。价格和实时 stock 变化快，本页不把它们存成稳定属性。

本批来源没有直接支撑可安全归入 B11-N 的尺寸、重量、容量或书写体验，所以不从商品图、家族文章或社区样本推算。gold/chrome 是官方列出的 finish options；本站 SVG 中的金色和灰色只是版式符号，不证明真实镀层色调、表面质感或实物比例。

## Pen Boutique 2024：专业家族语境

Laura Petix 于 2024-07-30 在 Pen Boutique 发布的文章讨论 Aurora Ipsilon，把 Resin、Demo、Quadra 等放在同一家族语境中。这份 professional_secondary 来源有作者和日期，适合说明 sibling structure，也可以保留文章明确指向的当时配置；但它不是 B11-N exact current listing，更不是 2026 永久完整分类。

因此文章里属于其他 sibling 的颜色、笔尖或装饰不能迁移到 B11-N。即便文章谈到 Resin，也必须保留 2024 date scope，不覆盖 exact 商品页。独立文章的价值在于解释产品线如何被观察和组织，而不是替官方 exact SKU 填空。

## 2011 社区样本：有归属，才有价值

Fountain Pen Network 2011 年的 Resin 讨论若被引用，只能标记为 forum/community sample。它记录某一时间、某一参与者面对某支样本的观察；即使细节具体，也不等于专业复核，更不能自动成为 B11-N 在 2026 年的稳定规格。

社区材料最容易被误用，是因为真实使用描述往往比商品页丰富。丰富不等于可转移。样本的饰件、尺寸感、笔尖感受、书写经验或包装信息，都可能属于当年的另一配置。结构化 evidence 因而把 sample-only 项标为 rejected for current spec qualification；正文保留其证据层级，而不借它制造一张更“完整”的参数表。

本页也不虚构第一人称拥有经历。没有人声称“我长期使用 B11-N”，也没有把论坛作者的话改写成编辑部亲测。若读者需要体验观点，应回到原讨论并查看作者、日期和上下文。

## 与 Demo Colors 不同在哪里

[Demo Colors](/pen/aurora-ipsilon-demo-colors) 当前官方 PDF 支撑 glossy colored resin、clear grip section、六色及两组 trim/nib。B11-N 当前 official scope 支撑的是 black resin、C/C 与 gold/chrome options。前者的六色不能成为 B11-N variants；后者的商品代码与上墨方式也不能补到 Demo 当前 PDF 没写的字段。

两支 pen 各自拥有唯一 made_by 指向 Aurora，品牌端由 reverse link 提供导航。它们之间没有 sibling relation row，因为本批用正文解释 sibling，而不新增未经计划的关系类型。[家族文章](/article/aurora-ipsilon) 同样没有 maker、reverse、model_specs 或 model_variants。

## 三层证据的阅读顺序

第一层是 exact official current listing：回答这一个 SKU 在检索日怎样被描述。第二层是 dated professional family context：回答 2024 作者怎样组织 Ipsilon sibling。第三层是 community sample：回答 2011 某一讨论怎样观察一支样本。阅读顺序从 exact 到 context，再到 sample；写入稳定规格时也遵循同样优先级。

这不是说官方永远正确或社区没有价值，而是让每条信息待在能被来源承担的位置。官方 availability 仍需日期；专业文章仍需对象；社区观察仍需样本归属。只有这样，未来页面变化或新证据出现时，维护者才能知道该更新哪个 scope，而不是拆解一张来源混杂的总表。

## 当前结论与范围

截至 2026-07-21，本页当前稳定陈述收口在 exact B11-N、black resin、cartridge/converter 和 gold/chrome finish options；availability 是可变快照。Pen Boutique 2024 只作 family/sibling context，2011 FPN 只作 community sample，二者均不 qualify exact current stable fields。

本批不创建 Italia／Stagioni d’Italia、Quadra 或其他 Resin 实体，也不宣称完成 Ipsilon 全系列。它只为一个 exact SKU 建立可审计入口，并通过 [家族导航](/article/aurora-ipsilon) 与 [Demo Colors](/pen/aurora-ipsilon-demo-colors) 形成可靠的阅读路径。`,
        newText: `# Aurora Ipsilon Resin B11-N：先核对商品代码，再谈家族

“Ipsilon Resin”可以泛指一条产品线，这里讨论的是商品代码 B11-N。Aurora 官方商品页在 2026-07-21 列出黑色树脂笔身、cartridge/converter 供墨，以及金色或铬色饰件选项。商品代码很重要：其他 Resin 款式、旧文章中的样本或相邻系列，都不能因为名称接近就借用这些配置。

想了解 Ipsilon 的整体结构，可阅读 [Aurora Ipsilon 家族导航](/article/aurora-ipsilon)；想比较彩色树脂、透明握位和两组饰件／钢尖，可进入 [Aurora Ipsilon Demo Colors](/pen/aurora-ipsilon-demo-colors)。这些页面方便比较，但每款仍要按自己的商品资料核对。

## 官方资料能确认什么

Aurora 的 B11-N 商品页直接支持 black resin、cartridge/converter 与 gold/chrome finish options；同一品牌的 Ipsilon 分类页只能说明它在产品线中的位置。两页都来自 Aurora，不能当成两份彼此独立的复核。

截至 2026-07-21，B11-N 仍出现在官方商品路径中；这不保证以后继续销售，也不保证两种饰件同时有货。现有资料没有给出可安全归入 B11-N 的尺寸、重量、墨水容量或普遍写感，因此不能从商品图、家族文章或社区样本推算。页面中的金灰色示意也不证明真实镀层色调、表面质感或尺寸比例。

## 旧文章和社区样本怎样读

Laura Petix 于 2024-07-30 在 Pen Boutique 介绍过 Aurora Ipsilon，并把 Resin、Demo、Quadra 等放在同一家族中讨论。这篇有作者和日期的专业文章适合解释当年的产品线，却不是 B11-N 在 2026 年的完整商品说明。属于其他款式的颜色、笔尖和装饰不能迁移到 B11-N。

Fountain Pen Network 2011 年的 Resin 讨论记录的是参与者面对具体样本的观察。饰件、尺寸感、笔尖感受、包装或书写经验都可能属于当年的另一配置，不能自动变成今天 B11-N 的统一规格。论坛作者的经历也不能改写成无出处的亲测结论；需要体验观点时，应回到原讨论查看作者、日期和上下文。

## 与 Demo Colors 的区别

[Demo Colors](/pen/aurora-ipsilon-demo-colors) 的官方资料列出 glossy colored resin、clear grip section、六种颜色和两组饰件／笔尖搭配；B11-N 则是 black resin、cartridge/converter 与 gold/chrome options。Demo 的六色不能写进 B11-N，B11-N 的商品代码与上墨结构也不能反过来补进 Demo 的当期 PDF。

## 上墨与日常维护

B11-N 的官方商品页明确写 cartridge/converter，因此维护时先确认笔内装的是 Aurora 墨囊还是活塞式 converter。装墨囊时，拔下笔帽，旋开前端，把 Aurora K／S 墨囊直线推入接口，再旋回笔杆并等待墨水润湿笔舌；若墨囊无法平顺卡合，不要挤压、敲击或强推。

使用 Aurora 活塞式 converter 时，先将 converter 推到位，再把笔尖完整浸入钢笔墨水。缓慢转动活塞吸墨，随后反向转动，让一滴墨水回到瓶中，并用柔软布料轻轻吸去笔尖表面的余墨。Aurora 建议使用原厂补充品；这只说明厂商的兼容边界，不等于第三方墨水必然会损坏钢笔。

换色或长期停用前，先排空墨水，以常温清水反复吸排，直到排出的水基本清澈，再拆下 converter 自然沥干。不要使用热水、酒精、强溶剂或研磨剂，也不要自行拆笔舌和 converter 接口。若出现接口无法卡合、持续漏墨、活塞卡涩、笔尖错位或清水仍无法恢复供墨，应停止强装和拆解，交给熟悉 Aurora 的售后或维修者检查。

## 当前结论

截至 2026-07-21，可以稳妥确认的是 B11-N、black resin、cartridge/converter 和 gold/chrome finish options；在售状态会变化。Pen Boutique 2024 与 2011 年 FPN 讨论各自保留作者、日期和样本边界，不用来填补现行商品页没有写出的尺寸、重量或普遍写感。`,
        evidenceLocators: [
          "entity.body_md:L3-L13",
          "entity.body_md:L17-L25",
          "entity.body_md:L31-L45",
          "entity.body_md:L1-L45",
        ],
        researchUrls: [AURORA_FAQ_URL],
      },
    ],
  },
  {
    manifestIndex: 9,
    entityId: "phase117-aurora-optima-auroloide-996-dor",
    brandEntityId: "CJXe8UpnkHLJ",
    slug: "aurora-optima-auroloide-996-dor",
    expectedName: "Aurora Optima Auroloide 996-DOR",
    expectedStoryTitle: "Aurora Optima Auroloide 996-DOR：exact current 与样本边界",
    expectedSourceMarker:
      "curated-content:phase117-aurora-optima-auroloide-996-dor-v1:046c7638dbae9f6d8d17742147ca787bb6ca7423766c160ac8c89ad74673f08b",
    expectedBodySha256: "fcae14e8d1cc294c41af7333d45b2290417c25397e5d6c3bd14e667977698efe",
    dimensions: ["introduction", "maintenance"],
    defectCodes: ["public_internal_editorial_language", "missing_actionable_maintenance"],
    replacements: [
      {
        oldText: `# Aurora Optima Auroloide 996-DOR：把商品事实与样本经验分开

Auroloide 常被当成 Aurora Optima 最醒目的材料标签，但“看起来像 Auroloide 的 Optima”还不等于 exact 996-DOR。本页锁定的是 Aurora 当前商品页上的 SKU 996-DOR。它有自己的材料、笔尖、上墨与封帽证据，也有明确的检索日期。其他颜色、旧批次、专业文章里的样本和 Optima 366 限量都只能作为带范围的上下文，不能自动加入这支笔的稳定字段。

Aurora 官方 exact listing 在 2026-07-21 的检索快照中列出 996-DOR、Auroloide、14K white gold nib、EF／F／M／B、hidden-reserve piston 与 screw cap。这些字段组成当前可审计的核心。价格、库存或地区可买状态会变化，所以“current”只说明检索当日页面仍在，不承诺某个市场永久有货。

## Auroloide 是材料事实，不是每一种花纹的型号清单

Auroloide 提供大理石纹理般的视觉层次，但本站原创 SVG 里的颜色只用于版式编码，不证明实物色准、透明度、纹路或饰面。不同实物的纹理观感也不应被写成固定图案。996-DOR 的 identity 由 SKU 与官方页面锁定，不由一张网络照片的颜色猜测决定。

这也意味着，不能因为看到蓝色、绿色或棕色样本，就为每一种视觉差异创建一个未经目录确认的新型号。颜色、饰件与地区商品号需要逐项来源；本页只承担 996-DOR 当前 exact 身份。要回到整个系列的年代和 sibling 结构，可阅读 [Aurora Optima（系列导航）](/article/aurora-optima)。

## 14K white gold 与 18K limited 必须分开

996-DOR exact listing 支撑 14K white gold 笔尖和 EF／F／M／B 字幅。这里的 14K 是这支 regular SKU 的 current fact。Optima 366 官方 PDF 中的 996-LW 是带编号的 18K limited edition；它的 18K 不会覆盖 996-DOR，也不会把整个 Auroloide 分支改写成 18K。

这种区分看似细小，实际上决定了购买核对是否可靠。如果搜索结果只写“Optima gold nib”，读者可能把 regular 与 limited 混在一起。exact code、K 数、饰件和限定身份必须在同一来源链里闭合。缺少 code 的图片或转述，只能作为候选线索。

## hidden-reserve piston 与 screw cap 是 exact 996-DOR 事实

官方页面把 996-DOR 与 hidden-reserve piston、screw cap 联系在一起，因此本页可以保存这些字段。所谓 hidden reserve 是 Aurora 对备用墨仓活塞机制的商品描述；它不是一项自动属于每支 Optima sibling 的家族属性。尤其是 [Aurora Optima Resina 997-CN](/pen/aurora-optima-resina-997-cn)，本阶段只保留其 exact listing 明确列出的 piston，不借用 996-DOR 的 hidden-reserve 表述。

同样，旋盖也只在这里作为 exact locator 支撑的字段出现。系列页面会说明两支笔属于同一导航，但不会据此把封帽结构从一支复制到另一支。知识图谱中的 sibling 关系帮助漫游，不是规格继承机制。

## 2016 蓝色 Auroloide 是 dated sample

The Pen Addict 在 2016-11-30 发布的蓝色 Auroloide 评测记录了一支具体样本。它的价值在于提供有作者、有日期、有对象的实际观察，而不是替官方 current listing 代言。文中的手感、尺寸、重量、颜色印象或使用判断，都只属于那支样本和当时语境。

因此，本页把这份来源放入独立的 2016 blue sample scope。它可以支持“有人如何描述这支蓝色样本”，不能支持“所有 996-DOR 都具有相同尺寸测量、重量或手感”，也不能支持 Resina 的任何稳定字段。即使某个数字与另一个专业来源接近，也不能把两个样本拼成官方规格。

## 2024 专业样本也不改写 exact current

Laura Petix 于 2024-10-12 发布的 Optima 文章提供 family 与样本层面的专业观察。127 mm、21.55 g、清洁和 hand feel 等信息有阅读价值，但除非文章逐字把数字定位到 996-DOR，本页不会把它们提升为 exact stable spec。测量口径、是否含帽、墨量与具体饰件都可能改变结果。

这不是拒绝专业评测，而是让它承担适合的工作：补充使用语境、提醒清洁与握持体验可能如何被感知。购买前的 exact code、材料、笔尖与上墨仍回到 Aurora 当前商品页；历史与体验各在自己的 scope 中被保存。

## 1992 modern chronology 不是今日库存证明

PenHero 用于梳理约 1992 年形成的现代 Optima 线及早期 Auroloide／resin chronology。它帮助解释 996-DOR 为什么处在一个延续多年的现代家族中，却不证明 2026-07-21 仍有哪些颜色或库存。历史材料和 current listing 在同一正文里出现时，日期必须紧跟事实。

战前 Optima 更不能成为这支笔的规格前身。1930 年代设计根源是一条视觉与品牌记忆，modern 996-DOR 则是需要 exact 页面核对的当前商品。把两者分开，才能既尊重历史，也不制造九十年连续规格的假象。

## 读图与导航

本站原创 1600×900 SVG 只展示三组信息：996-DOR exact current facts、2016 blue sample boundary、996-LW 366 limited exclusion。它不是产品照片，不包含 Aurora logo，不按比例绘制，也不证明颜色、花纹、光泽或饰面。图的作用是让证据边界一眼可见，而不是替代实物图。

如果你正在比较黑色树脂与 chrome trim，请转到 [Aurora Optima Resina 997-CN](/pen/aurora-optima-resina-997-cn)。如果你想理解战前名称、约 1992 modern line 与 366 limited 的位置，请回到 [Aurora Optima（系列导航）](/article/aurora-optima)。三页互链属于正文导航，不会创建 pen-to-pen topology。

最终，本页能作出的承诺很有限也很明确：996-DOR 在检索日由官方页面支持为 Auroloide、14K white gold、EF／F／M／B、hidden-reserve piston 与 screw cap。除此之外，样本数字、主观体验、其他颜色和限量款字段都保留原来的作者、日期与对象，不假装是这支 exact current pen 的普遍事实。`,
        newText: `# Aurora Optima Auroloide 996-DOR：把商品事实与样本经验分开

Auroloide 是 Aurora Optima 很醒目的材料标签，但“看起来像 Auroloide 的 Optima”不一定就是 996-DOR。Aurora 商品页在 2026-07-21 列出 SKU 996-DOR、Auroloide、14K white gold nib、EF／F／M／B、hidden-reserve piston 与 screw cap。价格、库存和地区可买状态会变化，这些商品信息只能代表检索当日。

## 材料、笔尖与版本边界

Auroloide 呈现类似大理石的纹理，但不同实物的花纹观感不应被写成固定图案。页面中的原创示意色只帮助区分信息，不证明实物色准、透明度、纹路或饰面。识别 996-DOR 时应核对商品代码与官方说明，不能只凭网络照片猜颜色。

官方商品页为 996-DOR 列出 14K white gold 笔尖和 EF／F／M／B。Optima 366 资料中的 996-LW 则是带编号的 18K 限量版；它的 18K 不能覆盖 996-DOR，更不能代表所有 Auroloide。购买时应把商品代码、K 数、饰件和限量身份一起核对，缺少代码的图片或转述只能作为线索。

hidden-reserve piston 与 screw cap 也来自 996-DOR 的商品页。它们不能自动成为每款 Optima 的共同规格。[Aurora Optima Resina 997-CN](/pen/aurora-optima-resina-997-cn) 的资料只明确写 piston，不能照搬 996-DOR 的 hidden-reserve 或旋盖说明。

## 历史资料与样本经验

The Pen Addict 在 2016-11-30 评测过一支蓝色 Auroloide。文中的手感、尺寸、重量和颜色印象只属于那支样本与当时语境，不能概括所有 996-DOR，也不能用于 Resina。Laura Petix 于 2024-10-12 记录的 127 mm、21.55 g、清洁和 hand feel 同样有阅读价值；除非资料明确指向 996-DOR，不能把这些数字升格为该商品号的统一规格。

PenHero 介绍了约 1992 年形成的现代 Optima 路线，以及较早的 Auroloide／resin 演变。这有助于理解家族沿革，却不证明 2026-07-21 的颜色或库存。战前 Optima 的设计根源也不能被当作现代 996-DOR 连续九十年的规格史。

## 活塞上墨与维护

996-DOR 是内置活塞笔，不使用墨囊或可拔出的 converter。按 Aurora FAQ 的高端活塞步骤，上墨前先缓慢转动尾端让活塞处于吸墨起点，把笔尖完整浸入钢笔墨水，再平稳反向转动吸墨。吸满后回转尾端，让几滴墨水回到瓶中，并用柔软布料轻轻吸去笔尖表面的余墨；不要让纸巾纤维勾住笔尖。

hidden reserve 是 Aurora 对备用墨仓机制的商品描述，不表示墨水见底后还能继续无条件书写。出墨变淡或中断时，应先停止书写并按说明操作，不要反复用力拧到尾端止挡。换色或长期停用前，以常温清水反复吸排，直到排出的水基本清澈，再让笔尖朝下自然沥水；避免热水、酒精、强溶剂、超声波和自行拆解活塞。

Auroloide 表面只需柔软微湿布轻擦，不使用研磨剂。若活塞突然卡涩或空转、握位持续漏墨、旋盖异常、笔尖错位，或清水冲洗后仍无法正常供墨，应立即停止强拧和拆解，保留商品代码与购买凭证，交给 Aurora 售后或有经验的维修者检查。

## 如何比较相邻版本

比较黑色树脂与 chrome trim 时，可转到 [Aurora Optima Resina 997-CN](/pen/aurora-optima-resina-997-cn)；理解战前名称、约 1992 年的现代路线和 366 限量版时，可阅读 [Aurora Optima（系列导航）](/article/aurora-optima)。这些相邻页面用于比较，材料、笔尖、上墨和封帽仍按各自商品资料核对。

截至 2026-07-21，996-DOR 可以稳妥确认的配置是 Auroloide、14K white gold、EF／F／M／B、hidden-reserve piston 与 screw cap。样本数字、主观体验、其他颜色和限量版配置都应保留原作者、日期和对象，不能改写成这支笔的普遍事实。`,
        evidenceLocators: [
          "entity.body_md:L3-L11",
          "entity.body_md:L15-L23",
          "entity.body_md:L27-L35",
          "entity.body_md:L39-L49",
          "entity.body_md:L1-L49",
        ],
        researchUrls: [AURORA_FAQ_URL],
      },
    ],
  },
  {
    manifestIndex: 10,
    entityId: "phase117-aurora-optima-resina-997-cn",
    brandEntityId: "CJXe8UpnkHLJ",
    slug: "aurora-optima-resina-997-cn",
    expectedName: "Aurora Optima Resina 997-CN",
    expectedStoryTitle: "Aurora Optima Resina 997-CN：只保留 exact current 事实",
    expectedSourceMarker:
      "curated-content:phase117-aurora-optima-resina-997-cn-v1:0a982b7084556d5463284b8b457926deff0546973db3954398505d25cca61bbf",
    expectedBodySha256: "3ae765a9ced801513d225ed6ee2c47c39e56d5449b93e465f4341ce90138e28e",
    dimensions: ["introduction", "maintenance"],
    defectCodes: ["public_internal_editorial_language", "missing_actionable_maintenance"],
    replacements: [
      {
        oldText: `# Aurora Optima Resina 997-CN：知道什么，也明确不知道什么

Aurora Optima Resina 997-CN 的页面刻意比常见商品介绍更克制。Aurora 当前 exact listing 在 2026-07-21 的检索快照中明确给出 SKU 997-CN、black resin、chrome trim、piston 与 EF／F／M／B。这些字段可以进入稳定规格。页面没有逐字段支持的内容，不会因为它与 Auroloide 同属 Optima 就被自动补齐。

这种克制不是内容不足，而是身份准确的前提。系列名能说明 997-CN 在 Aurora Optima 中的位置，却不能充当规格继承。要先看整个家族的历史层与 sibling 导航，可回到 [Aurora Optima（系列导航）](/article/aurora-optima)。

## exact 997-CN 的当前事实

本页的核心是一个可复查的组合：997-CN 是黑色树脂款，使用 chrome trim，官方页面列 piston 与 EF／F／M／B。availability 只代表检索日页面可见，不等于任何地区永久库存，也不等于价格长期不变。市场快照应与材料和结构事实分开阅读。

black resin 与 chrome trim 是这支 exact code 的材料／饰件边界。本站原创 SVG 中的黑灰色块只是信息层级编码，不证明实物黑度、反光、镀层质感或色差。它不是产品照片，不复制 logo，也不按比例展示笔身。

## 为什么不写 14K

[Aurora Optima Auroloide 996-DOR](/pen/aurora-optima-auroloide-996-dor) 的官方 exact 页面明确支撑 14K white gold。这条证据属于 996-DOR，不属于 997-CN。即使过去的 Aurora 页面、FAQ、零售资料或系列常识让人预期 997-CN 也可能使用金尖，只要本阶段没有逐字指向 exact 997-CN 的 locator，就不把 K 数写入稳定值。

本页仍保存 EF／F／M／B，因为它们来自 997-CN exact listing。字幅与笔尖材料是两个不同字段：知道有哪些字幅，不等于已经证明合金与 K 数。把这两件事拆开，避免用一半证据填满另一半结论。

## 为什么只写 piston，不写 hidden reserve

997-CN exact listing 支撑 piston，因此上墨系统可以写活塞。996-DOR 页面进一步写有 hidden-reserve piston，但这项修饰仍属于 sibling exact source。没有 997-CN locator 时，本页不把“hidden reserve”从 Auroloide 复制过来。

类似地，996-DOR 的 screw cap 也不会在这里出现为稳定字段。系列外形可能让读者形成合理猜测，但知识图谱需要来源链，而不是合理猜测。若以后 Aurora FAQ 或 current catalog 提供明确指向 997-CN 的位置，可以新增 source、scope 与 citation，再更新相应字段；在那之前，未知就保持未知。

## 127 mm 与 21.55 g 是 dated sample context

Laura Petix 在 Pen Boutique 于 2024-10-12 发布的文章中记录了 127 mm、21.55 g，并讨论清洁与 hand feel。这些信息对理解一支被观察的 Optima 样本很有帮助，但文章属于有日期的 professional family／sample context。它没有在本阶段形成 exact 997-CN 的逐 SKU locator。

所以，dimensions 与 weight 在本页的 evidence 结构中是 rejected，而不是悄悄消失。rejected 表示来源真实、内容有用，但不满足当前字段的资格。清洁和手感同样只作为样本语境保留，不会被改写成“997-CN 很适合某种手型”或“一定容易清洗”的普遍结论。

## 2016 蓝色 Auroloide 与 Resina 无规格继承

The Pen Addict 于 2016-11-30 发布的是 blue Auroloide 样本。它不是黑色 Resina，也不是 997-CN。蓝色纹理、样本尺寸、重量、主观书写体验与具体年代配置，都不能跨材料分支进入本页。

把这份来源放入 997-CN 的数据包，不是为了借它补内容，而是为了显式记录 exclusion：这是 sibling sample，只能支撑“为什么不能泛化”。这样以后维护者看到来源时，不会误以为它遗漏了可复制的事实。证据系统不仅要记录肯定，也要记录拒绝的理由。

## 366 limited 也不能提供 18K

Optima 366 官方 PDF 里的 996-LW 是白色大理石纹 Auroloide、带编号、明确 18K 的 limited edition。它和 997-CN 的 exact code、材料与限定身份都不同。18K 只能留在 366 limited scope，不会把 regular Resina 改写为 18K。

这一边界也提醒我们：Optima 不是一个规格永远一致的单型号。historical、modern family、regular exact SKU 与 numbered limited 必须分别建证据。系列导航可以把它们组织起来，却不能让某个醒目的限定配置覆盖常规款。

## PenHero 只回答 chronology

PenHero 的专业档案用于说明约 1992 modern line 和早期 Auroloide／resin chronology。它能帮助理解现代 Optima 如何延续历史设计语言，也能说明 resin 作为现代家族材料语境的一部分。但它不证明 997-CN 在 2026 年的库存、饰件、笔尖材料或尺寸。

战前 Optima 更是独立的历史对象。1930 年代根源属于设计史，不是 current 997-CN 的 spec sheet。把 chronology 与 current exact 分开，是避免“同名即同规格”错误的最直接方法。

## 如何核对购买信息

核对一支标为 997-CN 的笔时，先看商品号，再看材料和饰件是否与 black resin／chrome trim 对应；之后核对 piston 与 EF／F／M／B。若卖家声称 14K、hidden reserve、旋盖或具体尺寸重量，应要求能定位到该 exact SKU 的官方或可靠逐款来源，而不是只给出 Optima family 介绍。

价格与库存是可变快照，不在本页被写成永久事实。二手市场还需额外核对笔尖刻字、饰件、包装、地区编号与是否换件；这些属于实物鉴定，不会从当前官方页面自动推导。

本站原创 1600×900 SVG 把“已支持字段”和“未获 exact 支持字段”分为两栏，并标出 2024 sample、2016 sibling sample 与 366 limited 的来源范围。图只承担证据地图功能，非照片、非 logo、非比例、非色准、非饰面证明。

在三页结构里，997-CN 最重要的价值不是填满每一个规格栏，而是成为一支边界清楚的 canonical pen：它只以自己的 exact source 获得 identity 与 current facts，只通过 made_by 连接 Aurora 品牌，并用正文链接回 family 与 sibling。这样，读者得到的是一张可以继续验证的地图，而不是从相邻页面拼出的完整幻觉。`,
        newText: `# Aurora Optima Resina 997-CN：知道什么，也明确不知道什么

Aurora 官方商品页在 2026-07-21 明确列出 SKU 997-CN、black resin、chrome trim、piston 与 EF／F／M／B。系列名说明它属于 Aurora Optima，却不能让它自动继承 Auroloide 或限量款的规格。想了解整个家族的历史与相邻版本，可阅读 [Aurora Optima（系列导航）](/article/aurora-optima)。

## 997-CN 可以确认的配置

997-CN 是黑色树脂款，搭配 chrome trim，使用内置活塞，官方页面列出 EF／F／M／B。检索当日页面可见，不等于各地区永久有货，也不等于价格长期不变。页面中的黑灰色原创示意只帮助理解材料与饰件，不证明实物黑度、反光、镀层质感、色差或尺寸比例。

## 为什么不写 14K 或 hidden reserve

[Aurora Optima Auroloide 996-DOR](/pen/aurora-optima-auroloide-996-dor) 的官方商品页明确写 14K white gold；这条信息属于 996-DOR，不属于 997-CN。即使系列常识让人预期 997-CN 也可能使用金尖，只要没有直接指向该商品号的资料，就不能把 K 数写成已确认规格。EF／F／M／B 只是字幅选项，也不能反过来证明笔尖合金。

997-CN 的商品页明确写 piston，因此可以确认它是活塞笔；996-DOR 进一步写有 hidden-reserve piston 和 screw cap，但这些说明不能复制到 997-CN。以后若 Aurora 的当期目录明确指向 997-CN，再据此补充；在那之前，未知就保持未知。

## 样本资料与版本边界

Laura Petix 在 2024-10-12 的文章中记录 127 mm、21.55 g，并讨论清洁和 hand feel。这些内容有助于理解一支被观察的 Optima 样本，但文章没有逐项锁定 997-CN，因此不能把尺寸、重量和手感写成该商品号的统一结论。

The Pen Addict 于 2016-11-30 评测的是 blue Auroloide，不是黑色 Resina，也不是 997-CN。它的蓝色纹理、样本尺寸、重量和主观体验不能跨材料分支使用。Optima 366 资料里的 996-LW 则是白色大理石纹 Auroloide、带编号并明确使用 18K 的限量版，同样不能给 997-CN 补上 18K。

PenHero 介绍了约 1992 年形成的现代 Optima 路线与较早的 Auroloide／resin 演变。这能解释家族历史，却不证明 997-CN 在 2026 年的库存、饰件、笔尖材料或尺寸；战前 Optima 的设计根源也不是现代商品号的规格表。

## 活塞上墨、清洗与树脂护理

997-CN 是内置活塞笔，不使用墨囊或可拔出的 converter。按 Aurora FAQ 的活塞步骤，上墨前缓慢转动尾端，让活塞处于吸墨起点；把笔尖完整浸入钢笔墨水，再平稳反向转动吸墨。吸满后回转尾端，让几滴墨水回到瓶中，并用柔软布料轻轻吸去笔尖表面的余墨。不要强拧到止挡，也不要用纸巾来回摩擦笔尖。

换色或长期停用前，先排空墨水，以常温清水反复吸排，直到排出的水基本清澈，再让笔尖朝下自然沥水。黑色树脂与 chrome trim 只需柔软微湿布轻擦，避免热水、酒精、强溶剂、研磨膏、金属抛光剂和长时间浸泡。996-DOR 的 hidden reserve 操作不适合作为 997-CN 的既定功能。

若活塞突然卡涩或空转、握位持续漏墨、树脂出现裂纹、饰件松动、笔尖错位，或清水冲洗后仍无法恢复供墨，应停止强拧和拆解，保留商品代码与购买凭证，交给 Aurora 售后或有经验的维修者检查。

## 购买时怎样核对

先看商品号，再确认材料和饰件是否为 black resin／chrome trim，之后核对 piston 与 EF／F／M／B。若卖家声称 14K、hidden reserve、旋盖或具体尺寸重量，应要求能明确指向 997-CN 的官方或可靠逐款资料，而不是只给出 Optima 的家族介绍。二手购买还应检查笔尖刻字、包装、地区编号、是否换件，以及活塞是否平顺无渗漏。

这支笔的价值不在于填满每一个规格栏，而在于边界清楚：截至 2026-07-21，能够确认的是 997-CN、black resin、chrome trim、piston 与 EF／F／M／B；相邻款的金尖、隐藏备用墨仓、旋盖、尺寸、重量和手感都不能拿来补空。`,
        evidenceLocators: [
          "entity.body_md:L3-L11",
          "entity.body_md:L15-L29",
          "entity.body_md:L35-L47",
          "entity.body_md:L55-L57",
          "entity.body_md:L1-L57",
        ],
        researchUrls: [AURORA_FAQ_URL],
      },
    ],
  },
  {
    manifestIndex: 16,
    entityId: "phase599-benu-ambrosia",
    brandEntityId: "s59BENU",
    slug: "benu-ambrosia",
    expectedName: "BENU Ambrosia",
    expectedStoryTitle: "BENU Ambrosia：花卉命名、短墨囊与单款限量",
    expectedSourceMarker:
      "curated-content:phase599-ambrosia-sourced-v1:231e066c6bd36bdfb72254c71ee44746a28e95fdcd0b74edf64a7993383e972f",
    expectedBodySha256: "1ad691cb9ef457b40ed3d102c7d6a8d1c17a2c52abc601027687f52723f8019a",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Ambrosia 商品常同时出现在 `BENU Exclusive`，这只是官方自营店渠道标签。实体的 maker 仍是 BENU，Collection 仍是 Ambrosia；图谱不建立“BENU Exclusive”品牌，也不把同一支 Marigold 连到两个 made_by。若某款由外部零售商联名，再额外记录合作方和市场，不改变制造品牌。",
        newText:
          "Ambrosia 商品常同时出现在 `BENU Exclusive` 分类中，这只是官方自营店的渠道标签，制造品牌仍是 BENU，系列仍是 Ambrosia。若某款由外部零售商联名，应另外注明合作方和销售市场，但不能因此把同一支 Marigold 误认成两个品牌的产品。",
        evidenceLocators: ["entity.body_md:L39-L43"],
      },
      {
        oldText:
          "新花名进入目录时，先查是否仍用 Ambrosia 小笔体、#5 尖与短墨囊。若官方推出更长 converter 版本，应建立明确 sibling 或版本范围；不能因为同样用花名就把结构变化藏在颜色 variant 中。",
        newText:
          "新花名出现时，先核对它是否仍采用 Ambrosia 的小笔体、#5 尖与短墨囊。若官方推出可用更长 converter 的结构，应把它明确写成新版本；不能因为同样使用花卉名称，就把结构变化当成普通配色。",
        evidenceLocators: ["entity.body_md:L39-L43"],
      },
    ],
  },
  {
    manifestIndex: 17,
    entityId: "phase599-benu-astrogem",
    brandEntityId: "s59BENU",
    slug: "benu-astrogem",
    expectedName: "BENU AstroGem",
    expectedStoryTitle: "BENU AstroGem：小行星命名、多面体与发光版本边界",
    expectedSourceMarker:
      "curated-content:phase599-astrogem-sourced-v1:e80da914eed32fd66ec801e885dc6cca1b141bdd6fe38d7d762372ece4cadb1c",
    expectedBodySha256: "ca90c3930f29d9cfbf34875bed7f4d4ba3f7558ea96b65f8999cb14f7c44c535",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "BENU 官方把 AstroGem 的外形灵感指向星际天体 **ʻOumuamua**，并用 Pallas、Apollo、Echo、Juno、Klio、Leto、Midas、Eos、Lutetia、Vesta 等天体名称组织颜色。官方旧商店曾称首组有七种设计；当前目录已继续增加新款。它们共享 AstroGem 的多面体家族身份，名称应进入 variants，而不是复制十几篇相同结构正文。",
        newText:
          "BENU 官方把 AstroGem 的外形灵感指向星际天体 **ʻOumuamua**，并用 Pallas、Apollo、Echo、Juno、Klio、Leto、Midas、Eos、Lutetia、Vesta 等天体名称区分配色。官方旧商店曾称首组有七种设计，后来的目录又增加新款。它们都采用 AstroGem 的多面体家族设计，应按具体配色与日期比较，而不是误认成十几个结构不同的型号。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
      {
        oldText:
          "官方 Pallas 的 converter、长墨囊、25 g 和可 post 是现有结构锚点。若未来某个 AstroGem 特别版改用金尖、不同填充或金属内管，应建立有日期的 variant/sibling，而不是反向修改 Pallas 等早期款。页面把稳定家族事实与单款差异分开，读者才能判断二手实物。",
        newText:
          "Pallas 官方资料中的 converter、长墨囊、25 g 和可套帽书写，是目前可核对的具体样本。若以后某个 AstroGem 特别版改用金尖、不同供墨或金属内管，应按名称与日期单独说明，不能反过来修改 Pallas 等早期款。把共同设计与单款差异分开，才便于判断二手实物。",
        evidenceLocators: ["entity.body_md:L39-L39"],
      },
    ],
  },
  {
    manifestIndex: 19,
    entityId: "phase599-benu-cocktail-hour",
    brandEntityId: "s59BENU",
    slug: "benu-cocktail-hour",
    expectedName: "BENU Cocktail Hour",
    expectedStoryTitle: "BENU Cocktail Hour：酒杯 diamond-star-cut 与多尖型 SKU",
    expectedSourceMarker:
      "curated-content:phase599-cocktailHour-sourced-v1:56b1f975969a53c743993ab85cbc49d3fe695c176efe4c15f6306258f16e0ebc",
    expectedBodySha256: "e66fb1d66539ae4536eaa6cb11d3ac164ad77f5bfb21a32191e6438fbb8e5add",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "新色若继续使用 Mojito、Bellini、Pink Lady 的共同 chassis，只添加 variant；若官方改变笔体、尖号或供墨，再评估 sibling。经销商常把全部尖型都生成独立 SKU，SKU 数量不能直接当成型号数量。价格、预售和“coming soon”也是检索状态，不写进永久结构。",
        newText:
          "新配色若继续使用 Mojito、Bellini、Pink Lady 的共同笔体，只需按颜色和日期记录；若官方改变笔体、笔尖规格或供墨，再把它作为结构不同的版本说明。经销商常为每种尖幅建立独立 SKU，因此 SKU 数量不能直接当成型号数量。价格、预售和“coming soon”也只代表检索当日的销售状态。",
        evidenceLocators: ["entity.body_md:L33-L33"],
      },
      {
        oldText:
          "首批商品的颜色、包装和随附件可能调整。资料库用检索日期保留当前三色和尖型，不把一次预售页面当作永久目录。后续官方若给出完整尺寸和重量，以新增 evidence 更新，而不是删除首批零售档案。",
        newText:
          "首批商品的颜色、包装和随附件可能调整。截至检索日可确认的是三种颜色与相应尖幅，一次预售页面不能当作永久目录。以后官方若给出完整尺寸和重量，应保留首批零售资料的日期，再补充新的信息。",
        evidenceLocators: ["entity.body_md:L41-L41"],
      },
    ],
  },
  {
    manifestIndex: 20,
    entityId: "phase599-benu-dailymate",
    brandEntityId: "s59BENU",
    slug: "benu-dailymate",
    expectedName: "BENU DailyMate",
    expectedStoryTitle: "BENU DailyMate：七日颜色、#6 钢尖与历史目录边界",
    expectedSourceMarker:
      "curated-content:phase599-dailyMate-sourced-v1:511342e25afcb9537fc92ed3bb519b075a2161442d18199b354000523ac57020",
    expectedBodySha256: "484f8bc84f248c783b26e91680891636d193df54733621cd0ce1131f1bdaa6e9",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "截至本批检索，旧官方 `/shop/collection/dailymate` 路径呈现的是 Cocktail Hour 页面，当前主导航也不再稳定列出 DailyMate。这个网页状态只能支持“当前目录入口已变”，不能证明 DailyMate 正式改名为 Cocktail Hour。两者的命名、表面和笔尖配置不同，本站把 DailyMate 状态写成历史／目录已撤，而不建立错误的 rename relation。",
        newText:
          "截至这次检索，旧官方 `/shop/collection/dailymate` 路径显示的是 Cocktail Hour 页面，官网主目录也不再稳定列出 DailyMate。这只能说明目录入口已经变化，不能证明 DailyMate 正式改名为 Cocktail Hour。两者的命名、表面和笔尖配置不同，因此 DailyMate 应按历史系列理解，不能与 Cocktail Hour 合并。",
        evidenceLocators: ["entity.body_md:L7-L7"],
      },
      {
        oldText:
          "Easy Wednesday、Creative Thursday 等是同一 DailyMate 结构的颜色 variants。它们不按星期拆成七个 canonical page。常见 F／M／B 是尖幅；若二手页面出现替换尖或特殊尖，应按实物和订单记录，不回写到整个家族。",
        newText:
          "Easy Wednesday、Creative Thursday 等名称对应同一 DailyMate 结构下的不同配色，不应按星期拆成七个独立型号。常见 F／M／B 是尖幅；若二手商品出现替换尖或特殊尖，应按实物和订单核对，不能概括整个系列。",
        evidenceLocators: ["entity.body_md:L17-L17"],
      },
      {
        oldText:
          "旧商品照片仍应按颜色分开保存，Easy Wednesday 不能代表 Creative Thursday。若零售商残余库存仍可购买，库存状态归销售记录，不把 family 状态改回 current。历史页的职责是保持身份可查，而不是模拟今天的商品目录。",
        newText:
          "旧商品照片仍应按颜色区分，Easy Wednesday 不能代表 Creative Thursday。零售商即使还有残余库存，也只说明该店当时可售，不能据此认定整个系列重新成为现行产品。保留历史信息的目的，是让型号仍可辨认，而不是模拟今天的商品目录。",
        evidenceLocators: ["entity.body_md:L33-L33"],
      },
    ],
  },
  {
    manifestIndex: 21,
    entityId: "p252BenuEuphoria",
    brandEntityId: "s59BENU",
    slug: "benu-euphoria",
    expectedName: "BENU Euphoria",
    expectedStoryTitle: "BENU Euphoria：多面树脂、大号 #6 尖与国际规格供墨",
    expectedSourceMarker:
      "curated-content:phase252-benu-euphoria-v1:46c7bca4e3c01f700773f34f1d12c638e9fadbcd4b3a76aa972b99651ce2d32b",
    expectedBodySha256: "2988732dca3924b4c98c22e8ae0ec91a6541feba22ff82dcf1c4f9e4f1452172",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "常规 Euphoria 商品通常配 #6 Schmidt 不锈钢尖，F、M、B 是最稳定的宽度选项。Goulet 的 Earl Grey 页面还列出 1.1 mm stub 与 Flex：这两个选项使用 #6 JoWo 尖和尖座，与 F/M/B 的 Schmidt 单元不可直接互换。它们是同一笔体的尖单元 variant，不应在图谱里生成 “Euphoria Stub” 或 “Euphoria Flex” 两个新型号。Smruti 对 Tropical Voyage 的 B 尖样本记录了钢尖偏硬、连续出墨和无明显弹性；这是作者手中一支笔的体验，可帮助读者调整预期，但不替代每个尖宽的出厂检查。",
        newText:
          "常规 Euphoria 商品通常配 #6 Schmidt 不锈钢尖，F、M、B 是最稳定的宽度选项。Goulet 的 Earl Grey 页面还列出 1.1 mm stub 与 Flex：这两个选项使用 #6 JoWo 尖和尖座，与 F/M/B 的 Schmidt 单元不可直接互换。它们仍属于同一笔体下的笔尖配置，不能误认成 “Euphoria Stub” 或 “Euphoria Flex” 两个独立型号。Smruti 对 Tropical Voyage 的 B 尖样本记录了钢尖偏硬、连续出墨和无明显弹性；这是作者手中一支笔的体验，可帮助读者调整预期，但不替代每个尖宽的出厂检查。",
        evidenceLocators: ["entity.body_md:L11-L11"],
      },
      {
        oldText:
          "本页把四组版本保留在同一型号下：Milk & Honey 代表官方现行 Euphoria 商品；Ocean Breeze 代表 2021 年独立评测可见的渐变闪粉配方；Tropical Voyage 代表 2023 年评测样本；Earl Grey 是 Goulet Pens 的 Refreshment 独家色。颜色、闪粉集中位置和是否荧光是 variant，不能用一张商品图替代其他版本。本站使用原创事实 SVG 表示“多面树脂—#6 尖—国际规格供墨”的关系，明确标注为示意图、非产品照片，也不尝试绘制真实色彩。",
        newText:
          "四组资料描述的是同一型号下的不同版本：Milk & Honey 是官方现行 Euphoria 商品；Ocean Breeze 来自 2021 年独立评测中的渐变闪粉配方；Tropical Voyage 是 2023 年评测样本；Earl Grey 则是 Goulet Pens 的 Refreshment 独家色。颜色、闪粉集中位置和是否荧光都应按具体版本核对，不能用一张商品图代表其他款。页面中的原创 SVG 只说明“多面树脂—#6 尖—国际规格供墨”的关系，是信息示意而非产品照片，也不尝试还原真实色彩。",
        evidenceLocators: ["entity.body_md:L17-L17"],
      },
    ],
  },
  {
    manifestIndex: 23,
    entityId: "phase599-benu-haute",
    brandEntityId: "s59BENU",
    slug: "benu-haute",
    expectedName: "BENU Haute",
    expectedStoryTitle: "BENU Haute：时尚灵感与交替宽窄切面",
    expectedSourceMarker:
      "curated-content:phase599-haute-sourced-v1:a2a029f5a7924754095eca12856fdf900183d5a0979954e5f07dfebffd34ec39",
    expectedBodySha256: "c8c940a80ce70dd2129e588756939f895fd0901a5fcd19ffcf17f4e337413941",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Haute 是较新的系列，官方集合与商品页目前能稳定支持设计语言、颜色成员和供墨，却没有为整个家族给出统一长度、直径、重量与尖号表。资料库把这些字段明确写成“当前未统一公布”，不是遗漏。拿 Euphoria、Tessera 或 Tribute 的数字填进去，会让读者得到看似精确却错误的选购依据。",
        newText:
          "Haute 是较新的系列，官方集合与商品页目前能确认设计语言、具体配色和供墨，却没有为整个系列给出统一的长度、直径、重量与笔尖规格。这些数字目前只能留空；拿 Euphoria、Tessera 或 Tribute 的参数补进去，会让读者得到看似精确却错误的选购依据。",
        evidenceLocators: ["entity.body_md:L27-L29"],
      },
      {
        oldText:
          "遇到零售商新增尺寸时，应先确认它测的是收帽、去帽还是 post，重量是否含 converter 和墨水，并至少用第二个独立样本交叉。单支 Lush 的测量可以进入 variant evidence，在证明共用 chassis 前不自动变成 Haute 全家族值。",
        newText:
          "零售商若给出尺寸，应先确认测的是收帽、去帽还是套帽书写，重量是否包含 converter 和墨水，并尽量用第二个独立样本交叉核对。单支 Lush 的测量只能说明该样本；在确认各款共用同一笔体前，不能当成整个 Haute 系列的统一数字。",
        evidenceLocators: ["entity.body_md:L27-L29"],
      },
      {
        oldText: "## 颜色名称与编号怎样进入图谱",
        newText: "## 怎样理解颜色名称与编号",
        evidenceLocators: ["entity.body_md:L33-L37"],
      },
      {
        oldText:
          "Perle、Lush、Allure、Icon 等具名款进入 color variants；Gem 91、Gem 90、Gem 87 等编号款进入一个 edition group，并保留各自编号和来源。编号只是设计索引，没有官方证据时不解释成第几代、限量数或树脂配方代码。商店列表中的促销价和库存不进入基础规格。",
        newText:
          "Perle、Lush、Allure、Icon 等是具名配色；Gem 91、Gem 90、Gem 87 等则以编号区分设计，并应保留各自编号和来源。编号只是设计索引，没有官方说明时不能解释成第几代、限量数量或树脂配方代码。商店列表中的促销价和库存也不属于长期规格。",
        evidenceLocators: ["entity.body_md:L33-L37"],
      },
      {
        oldText:
          "同一设计可能因金色或铬色饰件产生不同 SKU。SKU 应附在对应颜色下面，只有尖材质、填充结构或笔体发生稳定变化才考虑 sibling。若零售商标题省略 Haute，只写 Icon 或 Gem 91，可用官方 Collection 字段、宽窄切面和盒标收敛身份。",
        newText:
          "同一设计可能因金色或铬色饰件产生不同 SKU，应把商品代码与对应颜色一起核对。只有笔尖材质、供墨结构或笔体发生明确变化时，才应视为结构不同的版本。若零售商标题省略 Haute，只写 Icon 或 Gem 91，可结合官方系列名称、宽窄切面和盒标确认身份。",
        evidenceLocators: ["entity.body_md:L33-L37"],
      },
    ],
  },
  {
    manifestIndex: 24,
    entityId: "phase599-benu-minima",
    brandEntityId: "s59BENU",
    slug: "benu-minima",
    expectedName: "BENU Minima",
    expectedStoryTitle: "BENU Minima：126 毫米便携笔与短墨囊边界",
    expectedSourceMarker:
      "curated-content:phase599-minima-sourced-v1:b3d08ea01025422852d46169c33be9a2ae8ee95444c1e1d03f64a476bb6d0ed0",
    expectedBodySha256: "92cfc0a7e3e04c95609b50173daef15958522870a40fdf3773ec3e5cc4c26a6e",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Minima 是 BENU 早期就存在的便携系列。官方尺寸对比图给出的收帽长度约 **12.6 cm／4.9 in**、最大宽度约 **1.7 cm**；SBRE Brown 对 Blue Flame 样本的实测为收帽 126.2 mm、去帽 115.7 mm、约 17 g。这个体量比普通全尺寸笔短，但并不等于后来只有 91 mm 的 Pixie。本站因此分别保留 Minima 与 Pixie 两个 canonical page。",
        newText:
          "Minima 是 BENU 较早推出的便携系列。官方尺寸对比图给出的收帽长度约 **12.6 cm／4.9 in**、最大宽度约 **1.7 cm**；SBRE Brown 对 Blue Flame 样本的实测为收帽 126.2 mm、去帽 115.7 mm、约 17 g。它比普通全尺寸笔短，却不等于后来只有 91 mm 的 Pixie；Minima 与 Pixie 是两个需要分别核对的系列。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
      {
        oldText:
          "基础页只保存 Minima 共同事实：约 126 mm 的收帽长度、#5 尖与短供墨空间。Lilac Skies 的 BENU Exclusive 身份、Skull & Roses 的装饰、某个 Luminous 配方的发光效果，都写在各自 variant notes。这样新颜色进入目录时只需增加来源、颜色名和库存日期，不会复制一篇看似不同、实际规格相同的正文。",
        newText:
          "Minima 各款可共同确认的是约 126 mm 的收帽长度、#5 尖与受限的短供墨空间。Lilac Skies 的 BENU Exclusive 渠道、Skull & Roses 的装饰，以及某些 Luminous 配方的发光效果，都应按具体款式说明。新颜色出现时，只需补充来源、颜色名和检索日期，不必误认成结构不同的新型号。",
        evidenceLocators: ["entity.body_md:L37-L39"],
      },
      {
        oldText:
          "尺寸也要带测量对象。官方图给收帽长度与外形宽度，SBRE Brown 给 Blue Flame 单支的去帽、重量和不同位置直径；两组数据可以互证家族体量，却不支持每个色款精确都是 17.0 g。转换器、墨囊和笔尖若后来变化，则通过 dated variant 保存，不悄悄覆盖旧实物记录。",
        newText:
          "尺寸必须注明测量对象。官方图给出收帽长度与外形宽度，SBRE Brown 则记录 Blue Flame 单支的去帽长度、重量和不同位置直径；两组数据可以互证系列的大致体量，却不能证明每个色款都精确为 17.0 g。converter、墨囊或笔尖若后来变化，也应注明版本与日期，不能悄悄覆盖旧实物记录。",
        evidenceLocators: ["entity.body_md:L37-L39"],
      },
    ],
  },
  {
    manifestIndex: 27,
    entityId: "p253BenuTalisman",
    brandEntityId: "s59BENU",
    slug: "benu-talisman",
    expectedName: "BENU Talisman",
    expectedStoryTitle: "BENU Talisman：多面树脂、主题材料与 #6 尖",
    expectedSourceMarker:
      "curated-content:phase253-benu-talisman-v1:4291d7b13bf9e0995b8acaf60ef47473d4c2595ba4962cc04ed56c9f92824b9e",
    expectedBodySha256: "2292129918a7769a7f3d1ed206c6d1103b87e0b6d7320cb5f0f1217fd3567609",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "BENU 官方店铺把 Talisman 单列为 collection；当前商品页能看到 Edelweiss、Moonstone、Northern Gold 等具体商品，旧评测则记录 Foxglove、Mandrake、Dragon's Blood 和 Peacock Ore。它们共享 Talisman 的多面树脂轮廓和供墨平台，但不是同一种实物。品牌的主题文案会讲护身、幸运、神话或古老材料，这些属于设计灵感；知识图谱只记录树脂、装饰、尖号和商品说明中能核实的事实，不把“疗愈”“保护”当作材料性能。",
        newText:
          "BENU 官方店铺把 Talisman 单列为一个系列；当前商品页能看到 Edelweiss、Moonstone、Northern Gold 等具体款式，旧评测则记录 Foxglove、Mandrake、Dragon's Blood 和 Peacock Ore。它们共享 Talisman 的多面树脂轮廓和供墨平台，但不是同一种实物。品牌文案中的护身、幸运、神话或古老材料属于设计灵感；能够核实的是树脂、装饰、笔尖和商品说明，不能把“疗愈”“保护”理解成材料性能。",
        evidenceLocators: ["entity.body_md:L3-L3"],
      },
      {
        oldText:
          "常规 Talisman 使用 #6 Schmidt 钢尖，F/M/B 是最稳定的宽度选择。某些零售商或独家色可能提供 stub、flex 或不同品牌尖座，必须把尖单元和 housing 写进 variant；不能因为笔尖看起来同样大就假设与 Euphoria、Briolette 或 True Unicorn 互换。True Unicorn 已有独立页面，它是 Gourmet Pens Exclusive 的 Talisman 联名树脂，不应被当前通用 Talisman 页吞掉，也不能用 True Unicorn 的重量和配方代表普通色款。",
        newText:
          "常规 Talisman 使用 #6 Schmidt 钢尖，F/M/B 是最稳定的宽度选择。某些零售商或独家色可能提供 stub、flex 或不同品牌尖座，必须把笔尖单元和 housing 与具体商品一起核对；不能因为笔尖看起来同样大就假设它与 Euphoria、Briolette 或 True Unicorn 互换。True Unicorn 是 Gourmet Pens Exclusive 的 Talisman 联名树脂，应单独阅读，也不能用它的重量和配方代表普通色款。",
        evidenceLocators: ["entity.body_md:L11-L17"],
      },
      {
        oldText:
          "Talisman 的视觉差异来自多面切削、透明或不透明树脂、闪粉、手绘和主题材料。BENU 官方条款提醒，手工产品的小瑕疵、照片色差和作品分布差异属于购买时应预期的范围；Northern Gold 页面还说明每支手绘元素的位置不会完全相同。页面因此把 Foxglove、Edelweiss、Moonstone、Northern Gold 作为颜色／主题 variant，而不是为每个传说建一页空壳。若一个商品是限量、独家或售罄，只把状态绑定到该 SKU 的检索日期。",
        newText:
          "Talisman 的视觉差异来自多面切削、透明或不透明树脂、闪粉、手绘和主题材料。BENU 官方条款提醒，手工产品的小瑕疵、照片色差和图案分布差异属于购买时应预期的范围；Northern Gold 页面还说明每支笔的手绘元素位置不会完全相同。Foxglove、Edelweiss、Moonstone、Northern Gold 是同一系列下的具体配色或主题款；限量、独家或售罄也只能按对应 SKU 和检索日期理解。",
        evidenceLocators: ["entity.body_md:L11-L17"],
      },
      {
        oldText:
          "本站原创事实 SVG 只画出 Talisman 的多面树脂、#6 尖和国际规格供墨关系，并标注为“示意图，非产品照片”。它不模拟真实颜色、闪粉位置、花瓣或矿物颗粒；正式商品图若无明确授权或 exact SKU 归属，不应跨版本复用。品牌页只保留通向 Talisman、Euphoria、Briolette 和 True Unicorn 的导航，型号页负责具体图像与来源。",
        newText:
          "页面中的原创事实 SVG 只说明 Talisman 的多面树脂、#6 尖和国际规格供墨，并明确标注“示意图，非产品照片”。它不模拟真实颜色、闪粉位置、花瓣或矿物颗粒；商品照片若没有明确授权，或无法确认具体 SKU，就不能跨版本复用。比较 Talisman、Euphoria、Briolette 和 True Unicorn 时，仍要回到各款自己的图片与来源。",
        evidenceLocators: ["entity.body_md:L11-L17"],
      },
    ],
  },
  {
    manifestIndex: 28,
    entityId: "s59BENU_UNICORN",
    brandEntityId: "s59BENU",
    slug: "benu-talisman-true-unicorn",
    expectedName: "BENU Talisman True Unicorn",
    expectedStoryTitle: "BENU Talisman True Unicorn：独家树脂、可 post 与普通 Talisman 的边界",
    expectedSourceMarker:
      "curated-content:phase486-benu-true-unicorn-depth-v1:7aa0052b5af1719e724f5d9b0fe4bb33210d1f93942404b91de5b0910c522627",
    expectedBodySha256: "3580783c4217f026f0f19c3ed3f324e1e57351072efecb21d830b8d370afad88",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "“BENU Unicorn”这个简称太容易把不同实体混在一起。True Unicorn 的可核对身份是 BENU Talisman 造型中的 Gourmet Pens Exclusive 联名配置，页面标题、联名方和树脂配方共同构成型号边界。它不是 Briolette 的一个颜色，也不是一个叫“Unicorn”的独立供墨系列。把名字截短后，搜索结果常把 #5 尖、不可 post 的 Briolette 规格错误复制过来；知识条目必须保留 Talisman、True Unicorn 和 Exclusive 三层关系。",
        newText:
          "“BENU Unicorn”这个简称很容易混淆不同产品。True Unicorn 可核对的身份，是采用 BENU Talisman 造型的 Gourmet Pens Exclusive 联名款；完整标题、联名方和树脂配方共同划定范围。它不是 Briolette 的一种颜色，也不是名为“Unicorn”的独立供墨系列。名称被截短后，搜索结果常误抄 Briolette 的 #5 尖和不可套帽书写等规格，因此核对时必须同时保留 Talisman、True Unicorn 与 Exclusive。",
        evidenceLocators: ["entity.body_md:L3-L3"],
      },
      {
        oldText:
          "页面主视觉使用本站原创 factual SVG，只画出 Talisman 的结构关系和独家树脂说明，不是 True Unicorn 产品照片，也不替代实物颜色、闪粉分布、尖号或库存证明。未来若取得联名方实拍，应保留授权和拍摄来源，把“产品图”和“示意图”分开呈现。",
        newText:
          "页面主视觉是原创信息示意图，只说明 Talisman 的笔体与独家树脂，不是 True Unicorn 产品照片，也不能证明实物颜色、闪粉分布、尖幅或库存。未来若取得联名方实拍，应保留授权和拍摄来源，并把产品照片与示意图明确分开。",
        evidenceLocators: ["entity.body_md:L37-L43"],
      },
      {
        oldText:
          "为每支二手笔建档时，可以记录笔尖上的 #6 标记、帽环和尾端、是否带原装转换器、闭帽和套帽长度、重量的称量条件，以及卖家提供的原始链接。若包装只写 BENU Talisman、没有 True Unicorn 或 Gourmet Pens 线索，应把联名身份标为未确认。相反，商品页截图、包装贴纸和零售发票能相互印证时，可以把它作为同一 canonical 的实物样本，而不是新建“真独角兽蓝色”“真独角兽紫色”等颜色实体。",
        newText:
          "核对二手实物时，可以记录笔尖上的 #6 标记、帽环和尾端、是否带原装 converter、收帽和套帽长度、重量的称量条件，以及卖家提供的原始链接。若包装只写 BENU Talisman，没有 True Unicorn 或 Gourmet Pens 线索，联名身份就仍未确认。商品页截图、包装贴纸和零售发票能相互印证时，应把它视为 True Unicorn 的具体实物，而不是另造“真独角兽蓝色”“真独角兽紫色”等型号。",
        evidenceLocators: ["entity.body_md:L37-L43"],
      },
    ],
  },
  {
    manifestIndex: 47,
    entityId: "s56SHFCRBAL",
    brandEntityId: "tVXnzDSFCcPP",
    slug: "craftsman-balance",
    expectedName: "Sheaffer Craftsman (Balance)",
    expectedStoryTitle: "Sheaffer Craftsman (Balance)：3 号到 33 号尖的战前命名",
    expectedSourceMarker:
      "curated-content:phase451-sheaffer-craftsman-balance-depth-v1:95c7e359a6a49a62ebef8789de75890a46c28bf2caa99dc529d34d63933cc63d",
    expectedBodySha256: "5223006d3972b15f184926e87af20c6adf4a737a593b8ea76a4dab529b83c219",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "在图谱中，Craftsman (Balance) 是理解 Sheaffer 产品等级和上墨转折的入口。它向前连接 Balance 的流线设计，向后连接 33T、Tip-Dip 和 TM，但每个节点只承载自己的机构和年代。把这些边界写清，读者就能从一支笔的尖和尾端继续寻找资料，而不必先接受一个由卖家或中文混名强行指定的结论。",
        newText:
          "Craftsman (Balance) 是理解 Sheaffer 产品等级和上墨方式转折的一处入口：向前可以追溯 Balance 的流线设计，向后则可比较 33T、Tip-Dip 和 TM。各款都有自己的机构和年代；把这些边界写清，读者就能从笔尖和尾端继续辨认，而不必先接受卖家或中文混名给出的武断结论。",
        evidenceLocators: ["entity.body_md:L37-L37"],
      },
    ],
  },
  {
    manifestIndex: 57,
    entityId: "phase329-pen-diplomat-clr",
    brandEntityId: "4kID3Wqc15O6",
    slug: "diplomat-clr",
    expectedName: "Diplomat CLR",
    expectedStoryTitle: "Diplomat CLR：用可换内环改变识别色的金属日用笔",
    expectedSourceMarker:
      "curated-content:phase460-diplomat-clr-depth-v1:61811c5552f99c53d918d5f58651996bf70d8d999da4c38835b1cbbc27bbc53a",
    expectedBodySha256: "17b3278567801cef40a04b8431ed1a0bf0942015637081ccaf4b8fff16391223",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "CLR 的名字常常被零售商写成某个颜色的完整名称，但型号本身不是“黑色 CLR”或“蓝色 CLR”，而是那支可以更换中央内环的 Diplomat 钢笔。官方商品页把原创点说得很清楚：inner ring 可以拆下并更换，随笔提供五个色环，用来改变中央 Diplomat 标识区域的识别色。色环是配件和版本信息，不应在图谱里建立五个重复实体；颜色、漆面和饰件则按确切商品 SKU 记录。",
        newText:
          "CLR 的名字常被零售商和颜色一起写成完整商品名，但基础型号并不是“黑色 CLR”或“蓝色 CLR”，而是这支可以更换中央内环的 Diplomat 钢笔。官方商品页写明 inner ring 可以拆换，随笔提供五个色环，用来改变中央 Diplomat 标识区域的识别色。色环是随附件，不代表五个不同型号；颜色、漆面和饰件应按具体商品 SKU 核对。",
        evidenceLocators: ["entity.body_md:L1-L1"],
      },
      {
        oldText:
          "在品牌页导航中，CLR 应只出现一次，颜色和色环信息放在型号页的 variants 区域。这样用户可以从品牌进入基础型号，再根据颜色、尖幅和附件选择具体商品，而不会在列表里看到一串内容几乎相同的“黑色 CLR”“蓝色 CLR”。",
        newText:
          "理解 CLR 时应先看基础型号，再按颜色、尖幅和随附色环选择具体商品。颜色与色环不会改变 CLR 的基本结构，也不应让“黑色 CLR”“蓝色 CLR”看起来像一串彼此独立、内容几乎相同的型号。",
        evidenceLocators: ["entity.body_md:L27-L29"],
      },
    ],
  },
  {
    manifestIndex: 60,
    entityId: "phase329-pen-diplomat-esteem",
    brandEntityId: "4kID3Wqc15O6",
    slug: "diplomat-esteem",
    expectedName: "Diplomat Esteem",
    expectedStoryTitle: "Diplomat Esteem：圆柱黄铜笔身与稳妥钢尖的日用路线",
    expectedSourceMarker:
      "curated-content:phase460-diplomat-esteem-depth-v1:c31257e333295d25cde908b893baf4ce259e5adf9c6ef0418d4a318e394a800e",
    expectedBodySha256: "6ca75c06f0fd26c6c6a0d4ce3dbe5873a3156cb2d01b818aff87f8561d1cad69",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "图谱中的规格也跟随这个日期和商品范围，不把旧页面的数字自动覆盖新 SKU。\n\n这能避免品牌页把不同年代的商品误拼在一起。",
        newText:
          "规格必须跟随检索日期和具体商品，不能用旧页面的数字自动覆盖新 SKU。这样比较不同年代的 Esteem 时，表面、尖幅和随附件就不会被误拼成一支不存在的组合。",
        evidenceLocators: ["entity.body_md:L23-L31"],
      },
    ],
  },
  {
    manifestIndex: 63,
    entityId: "phase330-pen-diplomat-magnum",
    brandEntityId: "4kID3Wqc15O6",
    slug: "diplomat-magnum",
    expectedName: "Diplomat Magnum",
    expectedStoryTitle: "Diplomat Magnum：面向日常与初学者的轻量钢笔",
    expectedSourceMarker:
      "curated-content:phase458-diplomat-magnum-depth-v1:0799f1d0c99f772b81cfc6eddc2151228959b460fc75556f343cd94f68132efd",
    expectedBodySha256: "c5d3c799600086ec2312ebcbf8b747ae9f28dacccff794b93f477e88f84c17f5",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText: `主图使用本站原创 factual SVG，只画出塑料/黄铜结构、墨胆边界和官方样本规格，明确标注非产品照片、非 Logo、非比例图、非颜色校样。它不证明真实比例、透明色、Logo、库存或某件实物品相；实际颜色和透明度应回到具体商品页确认。

Magnum 的“适合初学者”还意味着使用者应学会几个简单习惯：盖帽后再放入口袋，墨胆没有坐牢时不要用力甩笔，第一次换墨先在普通纸上试写。学生或儿童如果喜欢更细的线条，可以从 F 或 EF 开始；如果常用吸墨较快的练习本，M 往往更容易得到稳定线迹。家长或老师不必把颜色当成型号，也不应因为价格低就省略尖端检查。

整理库存时，把 Magnum Demo 的透明外观、普通 Magnum 的颜色、尖幅和两年保修分开记录；不要把一个颜色断货写成整条系列停产。官方商品页和归档页是当前身份的主要证据，专业评测只补充样本手感。

若页面缺少这些基本字段，就应先标记为待核对，而不是用相邻型号补齐。

这条规则同样适用于颜色、透明度和图片来源。

只有可追溯资料才能改变型号页的事实字段。

因此本页保留官方样本边界。`,
        newText: `页面中的原创信息示意图只说明塑料／黄铜结构、墨囊边界和官方样本规格，并明确标注为非产品照片、非 Logo、非比例图、非颜色校样。它不能证明真实比例、透明色、库存或某支实物的品相；实际颜色和透明度仍要回到具体商品页确认。

Magnum 所谓“适合初学者”，也意味着几个简单习惯：盖帽后再放入口袋，墨囊没有装牢时不要甩笔，第一次换墨先在普通纸上试写。喜欢细线条的学生可以从 F 或 EF 开始；常用吸墨较快的练习本时，M 往往更容易得到稳定线迹。颜色只是选择之一，价格较低也不应省略笔尖检查。

Magnum Demo 的透明外观、普通 Magnum 的颜色、尖幅与两年保修应分别核对；某一种颜色断货不等于整个系列停产。官方商品页与归档资料用于确认具体商品，专业评测只补充作者手中样本的感受。资料缺少颜色、透明度或图片来源等基本信息时，应先留待核对，不能从相邻型号补齐。`,
        evidenceLocators: ["entity.body_md:L21-L33"],
      },
    ],
  },
  {
    manifestIndex: 65,
    entityId: "phase329-pen-diplomat-traveller",
    brandEntityId: "4kID3Wqc15O6",
    slug: "diplomat-traveller",
    expectedName: "Diplomat Traveller",
    expectedStoryTitle: "Diplomat Traveller：纤细金属笔身的旅行取向",
    expectedSourceMarker:
      "curated-content:phase460-diplomat-traveller-depth-v1:dc316e3ebe9d627546a973bd2ad8667c3c7879a7165a74a0ab1bb8831b93792b",
    expectedBodySha256: "28f3eadf694b34dffd229d2c2e9e64e46f184c4310fe361c07980f810f0e4a7d",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "购买或整理二手笔时，保留 Chrome Steel/Steel Gold/Flame 等完整 SKU 名称、尖幅、是否随墨胆、夹件颜色和包装照片。不要因为“Diplomat Traveller”与英文拼写“Traveler”不同就建立重复页面；后者只是专业评测常用的拼写别体，应作为 alias。页面主图使用本站原创事实 SVG，明确是非产品照片、非 Logo、非比例图、非颜色校样，不证明真实比例、镀层、库存或具体实物品相。",
        newText:
          "购买或整理二手笔时，应保留 Chrome Steel、Steel Gold、Flame 等完整 SKU 名称、尖幅、是否随附墨囊、夹件颜色和包装照片。“Diplomat Traveller”与“Traveler”只是英式和美式拼写差异，不能因此误认成两个型号。页面中的原创信息示意图不是产品照片、Logo、比例图或颜色校样，也不证明真实镀层、库存或具体实物品相。",
        evidenceLocators: ["entity.body_md:L19-L25"],
      },
      {
        oldText:
          "“Traveller”与“Traveler”是拼写差异，不是两个品牌或型号。图谱应把后者作为 alias，并保留官方 Traveller 作为规范名称。Flame、Funky、Lapis 等颜色可以继续补录具体商品链接，但在没有独立结构、供墨或尖材证据之前，都归入 Traveller 的 variants。这样既能覆盖经销商常用名称，也不会因为颜色库存变化制造大量重复页面。",
        newText:
          "“Traveller”与“Traveler”是拼写差异，不是两个品牌或型号；官方采用 Traveller，专业评测中也常见 Traveler。Flame、Funky、Lapis 等配色应结合具体商品链接阅读；只要没有不同笔体、供墨或笔尖材质的证据，它们仍是 Traveller 的颜色选择，不能因库存变化被误认成大量新型号。",
        evidenceLocators: ["entity.body_md:L19-L25"],
      },
      {
        oldText:
          "Traveller 的优势是轻、细、易携带，代价是墨量和握持余量都较小。需要更粗握位或更大容量时，应比较 Esteem、CLR 或 Magnum；喜欢复杂密封和高容量机构则进入 Nexus 页面。品牌导航保留这些相邻型号的入口，型号页只对 Traveller 自己的 F/M、134/155/10 mm、19 g 和墨胆／转换器语境负责。",
        newText:
          "Traveller 的优势是轻、细、易携带，代价是墨量和握持余量都较小。需要更粗握位或更大容量时，可以比较 Esteem、CLR 或 Magnum；偏好复杂密封和高容量机构时，则可查看 Nexus。Traveller 自己能够确认的是 F/M、134/155/10 mm、19 g 和墨囊／converter 等信息，相邻型号的规格不能借来补充。",
        evidenceLocators: ["entity.body_md:L45-L45"],
      },
    ],
  },
  {
    manifestIndex: 66,
    entityId: "phase327-pen-diplomat-viper",
    brandEntityId: "4kID3Wqc15O6",
    slug: "diplomat-viper",
    expectedName: "Diplomat Viper",
    expectedStoryTitle: "Diplomat Viper：磁吸帽与包覆式尖的金属日用笔",
    expectedSourceMarker:
      "curated-content:phase454-diplomat-viper-depth-v1:443649dfe5d19ea5214b8f412021bd6f1adb3a99a120824582415624080f01d2",
    expectedBodySha256: "aa889a5a88dce6a3cd84cea23ada2224552b749f6df966151673ba72a92e7fed",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "颜色是 Viper 的 variant，不是五个基础型号。银、黑、蓝、棕、绿应共用 Viper 的产品页和供墨边界；如果未来出现新的阳极色或地区套装，只在 variant 层记录名称、商品号和日期。零售商实测的握位粗细、墨水流量或某支尖的顺滑度属于体验资料，不替所有颜色和批次作硬性规格。选购时请保存颜色、尖幅、是否含 Viper converter、短墨胆数量和保修卡照片，这些信息比“蛇纹金属笔”更能帮助售后或换件。",
        newText:
          "银、黑、蓝、棕、绿是 Viper 的配色，不是五个基础型号；它们共用同一笔体与供墨边界。以后若出现新的阳极色或地区套装，应注明名称、商品号和日期。零售商实测的握位粗细、墨水流量或某支笔尖的顺滑度只说明具体样本，不能概括所有颜色和批次。选购时应保存颜色、尖幅、是否含 Viper converter、短墨囊数量和保修卡照片，这些信息比“蛇纹金属笔”更有助于售后或换件。",
        evidenceLocators: ["entity.body_md:L23-L23"],
      },
      {
        oldText:
          "选择 Viper 的理由应是细身金属触感、快速磁吸帽和包覆式尖，而不是笼统的“高端蛇纹”。需要更粗握位、深 guilloché 和 EF/F/M/B 的读者转到 Cobra；偏好开放式尖和沟槽外观则分别查看 Aero 或其他型号。Viper 的颜色只在 variant 层记录，未来新色和地区套装也沿用同一型号，不创建五个颜色实体。",
        newText:
          "选择 Viper 的理由应是细身金属触感、快速磁吸帽和包覆式尖，而不是笼统的“高端蛇纹”。需要更粗握位、深 guilloché 和 EF/F/M/B 的读者可以比较 Cobra；偏好开放式尖和沟槽外观，则可查看 Aero 或其他型号。Viper 的新配色与地区套装仍应按具体商品记录，不能仅凭颜色另认成一个基础型号。",
        evidenceLocators: ["entity.body_md:L41-L41"],
      },
    ],
  },
  {
    manifestIndex: 99,
    entityId: "skqRmcjdowQg",
    brandEntityId: "LIfzzmbCfFPt",
    slug: "hero-329",
    expectedName: "英雄 Hero 329",
    expectedStoryTitle: "英雄 Hero 329：slip cap 暗尖日用笔",
    expectedSourceMarker:
      "curated-content:phase159-hero-329-v1:7c02782327ed2cc8b394ef24a12d5b14146a9a660e9e4c4609b7527daf9c4b0d",
    expectedBodySha256: "0c4d8e0f1a06129c13e64c325c3b16e3e0c0d0d3168c3bb47a5fd63c4370cd4f",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "616 与 329 都常见钢尖挤压囊，但具体帽盖、尺寸和批次不同；Hero 100 的 14K 尖和金属帽则是另一条定位。Parker 21／51 可以帮助理解 hooded nib 的历史背景，却不是 329 的品牌关系，也不能证明两者零件完全互换。知识图谱应让四者从 Hero 品牌页和 hooded-nib 概念互相到达，同时保留各自的来源、图片和维护条件。",
        newText:
          "616 与 329 都常见钢尖挤压囊，但具体帽盖、尺寸和批次不同；Hero 100 的 14K 尖和金属帽则是另一条定位。Parker 21／51 可以帮助理解 hooded nib 的历史背景，却不属于 Hero，也不能证明零件与 329 完全互换。比较这几款时，应分别核对各自的来源、图片与维护条件。",
        evidenceLocators: ["entity.body_md:L23-L23"],
      },
      {
        oldText:
          "型号页将 139/120/146 mm 和 16.4 g 明确标为样本测量，是为了让读者在买到实物后有可比较的基准，而不是制造一种所有 329 都精确相同的错觉。后续若发现其他颜色或帽环版本，应以独立 variant 记录差异；只有能证明结构和身份不同，才另建型号。这样既能保留 Hero 329 的历史连续性，也能避免把市场昵称和卖家包装扩成错误的产品节点。",
        newText:
          "139/120/146 mm 和 16.4 g 都明确来自样本测量，只是读者拿到实物后的比较基准，不表示所有 329 都精确相同。若发现其他颜色或帽环版本，应注明具体差异；只有结构和型号身份确实不同，才应视为另一款。这样既保留 Hero 329 的历史连续性，也避免把市场昵称或卖家包装误当成新型号。",
        evidenceLocators: ["entity.body_md:L33-L33"],
      },
    ],
  },
  {
    manifestIndex: 100,
    entityId: "T9E_wRGNepqk",
    brandEntityId: "LIfzzmbCfFPt",
    slug: "hero-616",
    expectedName: "英雄 Hero 616",
    expectedStoryTitle: "英雄 Hero 616：钢制暗尖、固定挤压囊与批次边界",
    expectedSourceMarker:
      "curated-content:phase484-hero616-depth-v1:43a88364ff7f9559377763d3a510efa4828bab9eb1c37c6e135bf93db154d999",
    expectedBodySha256: "2ad14e40d46de21d77eb263c33298d645d3a91daab6b445014ccb9b1dab23e5b",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Phase 159 的独立样本以钢制 hooded nib、Fine 线条为主；Fountain Pen Network 的 616 评测也把钢尖、尺寸和固定囊体作为个体观察。钢制暗尖能减少尖片外露和携带刮碰，但不能保证每个批次都同样顺滑、同样干湿或同样线宽。616 的 EF、F、0.5 mm 等商品写法应与具体照片和市场 SKU 绑定。",
        newText:
          "一支有完整记录的独立样本使用钢制 hooded nib，线条以 Fine 为主；Fountain Pen Network 的 616 评测也只把钢尖、尺寸和固定囊体作为个体观察。钢制暗尖能减少尖片外露和携带刮碰，但不能保证每个批次都同样顺滑、同样干湿或同样线宽。616 的 EF、F、0.5 mm 等商品写法应与具体照片和市场 SKU 一起核对。",
        evidenceLocators: ["entity.body_md:L15-L15"],
      },
      {
        oldText:
          "规格页对长度、重量和价格采取“样本限定”。Phase 159 记录的 13.4 cm 合帽、12.6 cm 无帽和 13.8 cm 后套来自独立 616 样本，写入本页时保留测量条件，不扩展成所有 616 的官方数字。含墨、是否插帽、金属件和包装都会改变重量；没有可追溯称量就写成轻量/常规体量，不填虚假精确克数。",
        newText:
          "长度、重量和价格都要限定到具体样本。13.4 cm 收帽、12.6 cm 去帽和 13.8 cm 套帽书写来自同一支独立 616 的测量，不能扩展成所有 616 的官方数字。含墨与否、是否套帽、金属件和包装都会改变重量；没有可追溯称量时，只能写大致体量，不能填写虚假的精确克数。",
        evidenceLocators: ["entity.body_md:L29-L29"],
      },
      {
        oldText:
          "如果未来得到英雄官方产品目录或带批次刻字的实物照片，应先确认它属于普通 616、616S 还是升级款，再追加到对应变体。型号页的目标是让读者知道该检查什么，而不是用一条看似整齐的规格替所有 616 样本发言。",
        newText:
          "若以后找到英雄官方产品目录或带批次刻字的实物照片，应先确认它属于普通 616、616S 还是升级款，再补充到相应版本。关键是让读者知道该检查什么，而不是用一行看似整齐的规格替所有 616 样本发言。",
        evidenceLocators: ["entity.body_md:L51-L51"],
      },
    ],
  },
  {
    manifestIndex: 101,
    entityId: "phase299-hero-8100",
    brandEntityId: "LIfzzmbCfFPt",
    slug: "hero-8100",
    expectedName: "英雄 Hero 8100 型 18K 金笔",
    expectedStoryTitle: "英雄 Hero 8100 型 18K 金笔：把工艺身份和规格边界分开",
    expectedSourceMarker:
      "curated-content:phase299-hero-8100-v1:31bcdc273c7d84e105fce048560f62f104676ed08e56c0a0899ac35f48d7e1d8",
    expectedBodySha256: "269c99d3e87e24a5fcc427bd16a9427e531b623b2e63120eefbb97cbd8f7e68e",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "当前可核实的规格只有：型号为 Hero 8100，官方名称含“18K金笔”，并与袁长君的花丝镶嵌工艺介绍相连。官方产品页没有公布合盖/开盖尺寸、最大直径、重量、笔尖号、供墨方式、笔帽螺纹或墨囊兼容性；本页在数据库中保留这些字段的“未公开”边界。京东索引中出现 0.5 mm、明尖和限定版等商品筛选词，但它们属于具体零售页面的 SKU 文案，无法证明所有 8100 都使用同一笔尖或供墨结构，因此只作为 variant 研究线索，不写入型号核心规格。",
        newText:
          "当前可核实的信息只有：型号为 Hero 8100，官方名称含“18K金笔”，并与袁长君的花丝镶嵌工艺介绍相连。官方产品页没有公布收帽／开盖尺寸、最大直径、重量、笔尖号、供墨方式、笔帽螺纹或墨囊兼容性，因此这些项目只能标为“未公开”。京东索引中出现 0.5 mm、明尖和限定版等筛选词，但它们属于具体零售商品的文案，无法证明所有 8100 都使用同一笔尖或供墨结构，只能作为后续核对线索。",
        evidenceLocators: ["entity.body_md:L19-L19"],
      },
      {
        oldText:
          "不要用 Hero 849 的按压囊、Hero 850 的固定挤压囊、Hero 100/616 的常见国产尖或相邻 8102 铱金笔的规格来填空。它们可以帮助读者理解 Hero 产品谱系，却不构成 8100 的证据。若今后取得带包装、笔尖刻字、尺寸尺或官方说明书的实物记录，应新增带范围的 variant，而不是覆盖当前“未公开”结论。",
        newText:
          "不要用 Hero 849 的按压囊、Hero 850 的固定挤压囊、Hero 100／616 的常见国产尖，或相邻 8102 铱金笔的规格来填空。它们可以帮助理解 Hero 的产品谱系，却不能证明 8100 的结构。若以后取得带包装、笔尖刻字、尺寸尺或官方说明书的实物记录，应注明对应款式与日期，不能直接覆盖当前“未公开”的结论。",
        evidenceLocators: ["entity.body_md:L21-L21"],
      },
      {
        oldText: "## 实施边界",
        newText: "## 资料边界",
        evidenceLocators: ["entity.body_md:L42-L42"],
      },
      {
        oldText:
          "- 新建唯一 `hero-8100` pen entity，`made_by` 只指向现有英雄 Hero 品牌；不创建新的 Hero 品牌，也不把 8100 与 8101/8102 合并。",
        newText:
          "- Hero 8100 是英雄旗下的具体型号，不与 8101／8102 合并；完整商品编号和制造品牌仍应按官方资料核对。",
        evidenceLocators: ["entity.body_md:L42-L42"],
      },
      {
        oldText:
          "- 只新增本包文件并在 owned checkpoint 通过审核—发布链路；全量品牌/型号审计、真人遍历、正式远程部署和线上复查仍继续。",
        newText:
          "- 目前只能确认 8100 的型号身份与花丝镶嵌工艺资料；更多品牌目录、实物记录和线上商品状态仍待可靠来源复核。",
        evidenceLocators: ["entity.body_md:L47-L47"],
      },
    ],
  },
  {
    manifestIndex: 102,
    entityId: "s55HERO849",
    brandEntityId: "LIfzzmbCfFPt",
    slug: "hero-849",
    expectedName: "英雄 Hero 849",
    expectedStoryTitle: "Hero 849：按压式上墨与握位一体成型钢尖",
    expectedSourceMarker:
      "curated-content:phase55-hero-849-v1:1a36af3c0f5fc697791d2a29302d774d7077505df76ed6e77452e3eb3b9e9259",
    expectedBodySha256: "5b870eb34c1b8e5eead4503cf15a82f73e5c1ef533775782ae0ca34b0ef69784",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Hero 849 值得单独建档，原因不是它的编号有多神秘，而是它把“一体尖”这个结构概念落到了一个可辨认的具体型号上。Evan 的 2011 年评测直接列出“英雄 849”，记录握位一体成型钢尖、按压式上墨，闭帽约 140 mm、开盖约 117 mm、重量约 28 g。评测还描述了笔尖上有 Hero 标志和简单图案、握位有数道刻环，以及偏湿、顺滑、接近欧美中尖的书写表现。这些是一个样本的观察，适合写入型号页的证据链，不应被扩展成所有批次的官方规格。",
        newText:
          "Hero 849 值得单独辨认，不是因为编号神秘，而是它把“一体尖”落实到一个具体型号上。Evan 的 2011 年评测直接列出“英雄 849”，记录握位一体成型钢尖、按压式上墨，收帽约 140 mm、去帽约 117 mm、重量约 28 g。评测还描述笔尖上的 Hero 标志和简单图案、握位的数道刻环，以及偏湿、顺滑、接近欧美中尖的书写表现。这些都来自一支样本，不能扩展成所有批次的官方规格。",
        evidenceLocators: ["entity.body_md:L3-L3"],
      },
      {
        oldText:
          "849 的页面最终要回答三个问题：它是谁——Hero 品牌下的 concrete 849；它特别在哪里——握位一体成型钢尖；它有什么边界——公开规格来自评测样本，批次、颜色、囊体和笔帽状态需要实物核对。这样读者可以从 Hero 品牌页进入 849，再沿 integral nib 概念跳到 Hero 850 和 Paidi Century 1，而不会把“一体尖”重新做成一个混名型号。",
        newText:
          "辨认 849 时有三个问题：它是 Hero 849；特点是握位一体成型钢尖；现有公开规格来自评测样本，批次、颜色、囊体和笔帽状态仍需实物核对。比较 Hero 850 和 Paidi Century 1 时，也应沿着 integral nib 这一结构概念逐款查看，不能把“一体尖”重新当成一个混合型号名。",
        evidenceLocators: ["entity.body_md:L19-L19"],
      },
    ],
  },
  {
    manifestIndex: 103,
    entityId: "s55HERO850",
    brandEntityId: "LIfzzmbCfFPt",
    slug: "hero-850",
    expectedName: "英雄 Hero 850",
    expectedStoryTitle: "Hero 850：金属漆面与固定挤压囊的一体尖型号",
    expectedSourceMarker:
      "curated-content:phase55-hero-850-v1:919e14b37272db98b5a1d46d9ab615756c20968a0ee137bae981394b29f89638",
    expectedBodySha256: "4e7fc89175c6992ae94b46f1b8ddcca2f9c7654d6977213e719d20250af63596",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Hero 850 页在图谱中的位置很明确：它属于 Hero，不与 Paidi Century 1 共用 made_by；它和 849、Century 1 通过 integral nib 概念关联，但每页有自己的上墨与外壳事实；它的历史价值来自具体评测和玩家经验，而不是一个未经证实的“经典型号”标签。读者从品牌导航进入 850 后，可以继续查看 849 的按压囊记录，也可以进入 Paidi 品牌看 Century 1 的 aerometric 结构，但不会再被“一体尖”三个字带到错误的混合身份。",
        newText:
          "Hero 850 属于 Hero，与 Paidi Century 1 不是同一品牌。它可以和 Hero 849、Century 1 一起比较 integral nib 结构，但三款各有自己的上墨方式和外壳资料。850 的历史价值来自具体评测与玩家经验，不是未经证实的“经典型号”标签；查看 849 的按压囊或 Century 1 的 aerometric 结构时，也不能因为“一体尖”三个字把它们混成同一款。",
        evidenceLocators: ["entity.body_md:L19-L19"],
      },
    ],
  },
  {
    manifestIndex: 231,
    entityId: "tYohGyB5d9Hp",
    brandEntityId: "vhqNYqDChhiN",
    slug: "parker-t-1",
    expectedName: "Parker T-1（1970）",
    expectedStoryTitle: "Parker T-1：钛金属一体尖的短命实验",
    expectedSourceMarker:
      "curated-content:phase483-parker-t1-depth-v1:e151f1e3a352bdb9fa01c962db0f8b60ca102eee1e78fadb8850a2a96b51eb0b",
    expectedBodySha256: "cc1fdc19e9f5bf843830dd703a8ed84a6e0a3ffd74cdaefbad8313a74f08d59e",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "本站主图为既有原创 factual SVG，用材料、整合尖和 1970–1971 时间线表示资料边界；它是示意图，非产品照片，不复刻收藏实拍，不证明真实尺寸、重量、颜色、序列号、修复状态或价格。尺寸、统一容量和一条适用于所有收藏样本的重量本包不强行补写。",
        newText:
          "页面中的原创信息示意图用钛材、一体尖和 1970–1971 时间线概括已知资料；它不是产品照片，也不复刻收藏实拍，不能证明真实尺寸、重量、颜色、序列号、修复状态或价格。现有可靠资料不足以给出统一尺寸、容量或适用于所有存世样本的重量，因此这些数字不强行补写。",
        evidenceLocators: ["entity.body_md:L43-L43"],
      },
    ],
  },
  {
    manifestIndex: 234,
    entityId: "s40PVICTORY",
    brandEntityId: "vhqNYqDChhiN",
    slug: "parker-victory-vintage",
    expectedName: "Parker Victory（vintage UK）",
    expectedStoryTitle: "Parker Victory：英国 Newhaven 的 Mk I–V",
    expectedSourceMarker:
      "curated-content:phase461-parker-victory-depth-v1:f964eb264295982450801a82c6e2ad7a11ddf3339b84d5aa9496a2b7d656a238",
    expectedBodySha256: "a414dfb7aa92c7143faad08d9e24299cd034ffd5ddbed85ee8759da8dd9bd6b7",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Parker 51 是另一条流线、包尖和 Vacumatic／aerometric 家族，Victory 的开放式英国尖不能套用 51 的尺寸和维护方法。Parker 25 是 1975 年后英国日用线，年代、材料和结构都晚得多。Eversharp Victory 属于另一品牌谱系，品牌页不能把两个 Victory 反向链接到同一 Parker 条目。",
        newText:
          "Parker 51 属于另一条流线、包尖和 Vacumatic／aerometric 路线，Victory 的英国开放式尖不能套用 51 的尺寸和维护方法。Parker 25 是 1975 年以后的英国日用系列，年代、材料和结构都晚得多。Eversharp Victory 更属于另一个品牌，不能因为同名就与 Parker Victory 混在一起。",
        evidenceLocators: ["entity.body_md:L15-L15"],
      },
    ],
  },
  {
    manifestIndex: 292,
    entityId: "phase111-pilot-custom-ns",
    brandEntityId: "Zt-PbXkE7UHM",
    slug: "pilot-custom-ns",
    expectedName: "百乐 Pilot Custom NS",
    expectedStoryTitle: "百乐 Pilot Custom NS：current identity、来源与样本边界",
    expectedSourceMarker:
      "curated-content:phase111-pilot-customNs:ba30be30f54bd7ef0405b20d0f66655c1c011e96b340e884046cad2f96fc0f76",
    expectedBodySha256: "3dd62979397f33ab33e675011d8d1b9b55d6c7aefe9105abe518e50d226ae5f2",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText: PILOT_PIPELINE_PARAGRAPH,
        newText: PILOT_READER_PARAGRAPH,
        evidenceLocators: ["entity.body_md:L33"],
      },
    ],
  },
  {
    manifestIndex: 294,
    entityId: "phase111-pilot-elabo-metal-fe-25sr",
    brandEntityId: "Zt-PbXkE7UHM",
    slug: "pilot-elabo-metal-fe-25sr",
    expectedName: "百乐 Pilot Elabo 金属轴 FE-25SR",
    expectedStoryTitle: "百乐 Pilot Elabo 金属轴 FE-25SR：current identity、来源与样本边界",
    expectedSourceMarker:
      "curated-content:phase111-pilot-metal:d3b9fd13728b80a615fd3e7dcba40aa8ae6d8ecc6bf8aca683e170c28cd328a0",
    expectedBodySha256: "a3c59d656b769b6e87bec27b87a1118505dc3f62db50640e64d1601b273d3c48",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText: PILOT_PIPELINE_PARAGRAPH,
        newText: PILOT_READER_PARAGRAPH,
        evidenceLocators: ["entity.body_md:L33"],
      },
    ],
  },
  {
    manifestIndex: 295,
    entityId: "phase111-pilot-elabo-resin-fe-18sr",
    brandEntityId: "Zt-PbXkE7UHM",
    slug: "pilot-elabo-resin-fe-18sr",
    expectedName: "百乐 Pilot Elabo 树脂轴 FE-18SR",
    expectedStoryTitle: "百乐 Pilot Elabo 树脂轴 FE-18SR：current identity、来源与样本边界",
    expectedSourceMarker:
      "curated-content:phase111-pilot-resin:ae90b72380a3584b3a27a1db51a7858e7da899fb7cd742e229afa2bfa14b7b33",
    expectedBodySha256: "29e502129d4748ceb0664ec61a17962a68a2b21354e6b14047bc87d138ccc85b",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText: PILOT_PIPELINE_PARAGRAPH,
        newText: PILOT_READER_PARAGRAPH,
        evidenceLocators: ["entity.body_md:L33"],
      },
    ],
  },
  {
    manifestIndex: 300,
    entityId: "phase111-pilot-lightive",
    brandEntityId: "Zt-PbXkE7UHM",
    slug: "pilot-lightive",
    expectedName: "百乐 Pilot Lightive",
    expectedStoryTitle: "百乐 Pilot Lightive：current identity、来源与样本边界",
    expectedSourceMarker:
      "curated-content:phase111-pilot-lightive:d68245a4f370222bb591810154b299efb05acb2b0e6dcd4861a419120a9c4079",
    expectedBodySha256: "cba14889d103122ec46e11929665fa477e62a233727996b1dcdfa83483d9172d",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText: PILOT_PIPELINE_PARAGRAPH,
        newText: PILOT_READER_PARAGRAPH,
        evidenceLocators: ["entity.body_md:L33"],
      },
    ],
  },
  {
    manifestIndex: 450,
    entityId: "sYO0meaAoJ_V",
    brandEntityId: "vhqNYqDChhiN",
    slug: "the-parker-duofold",
    expectedName: "Parker Duofold（1921–1938 经典家族）",
    expectedStoryTitle: "Parker Duofold 1921–1938：Big Red、Permanite 与 Streamlined",
    expectedSourceMarker:
      "curated-content:phase477-parker-duofold-vintage-depth-v1:bac167a58a2492e87e04c1839a0090e99f13e92a6dbaf134db65981b40ef6bf5",
    expectedBodySha256: "72f4569f785c4fd8b4c0f5d08a140ae2f22782b5db6d7acb5c7295f519caf890",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText:
          "现代 Duofold Classic Centennial 采用贵树脂、镀层饰件、18K 镀铑双色尖和 cartridge/converter 的当前产品语境；1921–1938 family 则可能是 hard rubber、Permanite、button filler、橡胶囊和多尺寸开放式尖。两者的共同点是品牌命名和设计遗产，不能因此设置 same-as 或互相替换主图。历史页应链接现代页作为 lineage，现代页也应明确“inspired by”，但不把现代 Big Red 作为古董真品照片、不把古董 Senior 的约 139 mm 写成当前 Centennial 的尺寸。",
        newText:
          "现代 Duofold Classic Centennial 采用贵树脂、镀层饰件、18K 镀铑双色尖和 cartridge/converter；1921–1938 年的家族则可能使用 hard rubber、Permanite、button filler、橡胶囊和多种尺寸的开放式尖。两者共享品牌名称与设计遗产，却不是同一代产品。比较时可以说明现代款受历史设计启发，但不能拿现代 Big Red 的照片冒充古董真品，也不能把古董 Senior 约 139 mm 的尺寸写成今天 Centennial 的规格。",
        evidenceLocators: ["entity.body_md:L33-L35"],
      },
    ],
  },
  {
    manifestIndex: 710,
    entityId: "i_XH37icAI5C",
    brandEntityId: "vhqNYqDChhiN",
    slug: "派克-parker-51-经典-vintage",
    expectedName: "派克 Parker 51（1941–1978）",
    expectedStoryTitle: "Vintage Parker 51：上墨代际、版本与年份边界",
    expectedSourceMarker:
      "curated-content:phase28-parker-51-vintage-v1:e8061ffdf400a149ed4eba4e1d716e1f90db7ba21bd0a1b17e5c55b74e4b4595",
    expectedBodySha256: "adbfa544603e326a9bf9fe1a7508d49d30804ee791eb4e08a8e42ae71d443b86",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "型号名中的引号是历史写法的一部分。名称不表示 1951 年上市，也不是现代 2021 版的同一条产品记录。本站将 vintage canonical 与现代 Parker 51 分开，旧的重复 vintage 行只作为重定向入口保留。",
        newText:
          "型号名中的引号是历史写法的一部分；这个名称不表示它在 1951 年上市。1941–1978 年的 Parker “51” 与 2021 年现代版也不是同一代产品，材料、供墨、尺寸和购买判断都应分别核对。",
        evidenceLocators: ["entity.body_md:L5-L5"],
      },
    ],
  },
  {
    manifestIndex: 712,
    entityId: "TFGZtGLytVIN",
    brandEntityId: "vhqNYqDChhiN",
    slug: "派克-parker-im丽雅",
    expectedName: "派克 Parker IM丽雅",
    expectedStoryTitle: "Parker IM：现代漆面系列与 SKU 边界",
    expectedSourceMarker:
      "curated-content:phase153-parker-im-v1:e7f48da5c2e3bbd5b6aebd38756d2fa0750ec029874989a6520fcf9714b9d225",
    expectedBodySha256: "3037e8e06f10358553585578a26c93fddd1a4d8bd16a088abbd8a20c8b03cca4",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Parker IM 的定位是把 Parker 的箭形夹、漆面金属外壳和日常 cartridge/converter 结构放在一个较容易入手的现代系列里。它的英文名称常被解释成 Instant Modern，但现有官方产品页主要把 IM 当作系列名称，并没有在本批资料中给出一个可当作品牌正式释义的缩写展开。因此正文使用“Parker IM 系列”，不把未经官方确认的词源写成历史事实。",
        newText:
          "Parker IM 把 Parker 的箭形夹、漆面金属外壳和日常 cartridge/converter 结构放在一个较容易入手的现代系列里。IM 常被解释成 Instant Modern，但现有官方产品页主要把它作为系列名称，并没有给出可确认的正式缩写释义。因此应使用“Parker IM 系列”，不把未经官方确认的词源写成历史事实。",
        evidenceLocators: ["entity.body_md:L1-L1"],
      },
    ],
  },
  {
    manifestIndex: 713,
    entityId: "h8mHobX3YCPS",
    brandEntityId: "vhqNYqDChhiN",
    slug: "派克-parker-世纪-duofold",
    expectedName: "Parker Duofold Classic Centennial（1987/88–）",
    expectedStoryTitle: "Parker Duofold Classic Centennial：1987/88 与当前 SKU",
    expectedSourceMarker:
      "curated-content:phase477-parker-duofold-centennial-depth-v1:e9023c576a6f61bfdd1a3a32afee9b15c742eb8fbf41fe7b54cc31815d5299f9",
    expectedBodySha256: "3d067d70928ed6b05be5188861f2b0612884bebf1da401ca6ce785028bc3030f",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "如果你要的是带 1920 年代红色传统的现代大号钢笔，选择 Classic Centennial；如果你想研究 button filler、hard rubber、Permanite 或 vintage cap band，应转到历史 family。两页都属于 Parker，但图片、材料、供墨和选购建议必须分开。现代页面可以通过“inspired by／historical lineage”链接古董页，不能互相 redirect 或把现代产品写成古董真品。",
        newText:
          "如果你要的是延续 1920 年代红色传统的现代大号钢笔，可以看 Classic Centennial；如果想研究 button filler、hard rubber、Permanite 或 vintage cap band，则应查看历史 Duofold 家族。两者都属于 Parker，却必须分开核对图片、材料、供墨和选购建议。现代款可以说明自己受历史设计启发，但不能被写成古董真品。",
        evidenceLocators: ["entity.body_md:L29-L29"],
      },
    ],
  },
  {
    manifestIndex: 409,
    entityId: "hbOcg60TD2lr",
    brandEntityId: "tVXnzDSFCcPP",
    slug: "sheaffer-connaisseur",
    expectedName: "Sheaffer Connaisseur",
    expectedStoryTitle: "Sheaffer Connaisseur：先辨认标准或 Grande，再谈后期高阶线",
    expectedSourceMarker:
      "curated-content:phase106-sheaffer-connaisseur-v1:548349cb6b662a55031ad188823794c84ecb45791445b3eed69f873223949ff2",
    expectedBodySha256: "5f84ffc2227133b2523f989593b5268a791804e370377b472d57caf4f38ef76d",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText:
          "它与 No Nonsense 的设计故事有历史联系，但“由某种轮廓启发”不等于同一个型号。本站因此用 made_by 把 Connaisseur 连回 Sheaffer 品牌，用正文和边界说明连接相邻型号，而不建立会造成身份合并的 redirect。旧 raw 路由 `sheaffer-s-connaisseur` 只指向同一实体的新 canonical slug；这属于已知 ID 的规范化，不是新建一支同名笔。",
        newText:
          "Connaisseur 与 No Nonsense 的设计故事有历史联系，但“受某种轮廓启发”不表示两者是同一个型号。辨认时仍应核对 Connaisseur 的名称、尺寸、笔尖和供墨，不能把 No Nonsense 的规格或图片直接借过来；这段设计渊源只用于理解相邻产品，不改变 Connaisseur 属于 Sheaffer 的独立身份。",
        evidenceLocators: ["entity.body_md:L35"],
      },
    ],
  },
  {
    manifestIndex: 410,
    entityId: "phase106-sheaffer-icon",
    brandEntityId: "tVXnzDSFCcPP",
    slug: "sheaffer-icon",
    expectedName: "Sheaffer Icon",
    expectedStoryTitle: "Sheaffer Icon：只把官方 9108 当前 SKU 写进规格",
    expectedSourceMarker:
      "curated-content:phase106-sheaffer-icon-9108-v1:4b757f81aaf708f7ef3fd3a788b12884acf470576f0e6aacb4e9f69c7a3b0c7d",
    expectedBodySha256: "589dc4892b0942b0c2c7fe30fa57670492f23391e1c0a82bcc39437f5beaebb6",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText:
          "“汲取品牌历史”属于设计叙事。数据库中的 identity 仍是独立的 Sheaffer Icon，当前有证据的条目是 9108 Matte Black fountain pen。它通过唯一 made_by 指向 Sheaffer 品牌，品牌页的反向导航会自然出现本页；不需要也不允许重放或重写 Sheaffer brand pack。",
        newText:
          "“汲取品牌历史”是一种设计叙事，不能把 Icon 说成某个旧型号的复刻。现有官方资料能够确认的是 Sheaffer Icon 9108 Matte Black fountain pen；它应按自己的商品代码、开放式钢尖、cartridge/converter 和饰件核对，不能借用 Imperial、Targa 或 Legacy 的历史规格。",
        evidenceLocators: ["entity.body_md:L39"],
      },
    ],
  },
  {
    manifestIndex: 411,
    entityId: "phase106-sheaffer-imperial",
    brandEntityId: "tVXnzDSFCcPP",
    slug: "sheaffer-imperial",
    expectedName: "Sheaffer Imperial",
    expectedStoryTitle: "Sheaffer Imperial：按 Roman numeral、笔尖与供墨辨认历史家族",
    expectedSourceMarker:
      "curated-content:phase606-sheaffer-imperial-care-refresh-v1:ce2c7ad99f2f4d8a9968eb12ca198114cdd8c78451cde11b024e994d7d0d7740",
    expectedBodySha256: "38865addf9ef74fe2d2131b86984445d69899e3f48e1a1c0236f5a8dfdd2bcc6",
    dimensions: ["introduction"],
    defectCodes: ["public_pipeline_residue"],
    replacements: [
      {
        oldText:
          "中文旧名“帝国元首”可能混入 Imperial 与 Legacy 两种叙事。由于没有可审计证据能证明旧页只指 Imperial，本站保留 `犀飞利-sheaffer-帝国元首` 的 retired hard-404：target_path 继续为空，不建立到本页的 redirect。新 Imperial 页面使用独立稳定 ID，绝不复用旧 mixed donor `5JqrNzxFsWC6`。",
        newText:
          "中文旧名“帝国元首”可能混入 Imperial 与 Legacy 两种叙事，目前没有可靠资料能证明这个旧称只指 Imperial。因此，仅凭“帝国元首”四个字不能完成型号判断；还要继续核对供墨机构、嵌入尖形态、笔帽与饰件，再决定实物属于 Imperial、Legacy 还是其他 Sheaffer 家族。",
        evidenceLocators: ["entity.body_md:L45"],
      },
    ],
  },
  {
    manifestIndex: 11,
    entityId: "phase356-aurora-ottantotto-ebonite",
    brandEntityId: "CJXe8UpnkHLJ",
    slug: "aurora-ottantotto-ebonite",
    expectedName: "Aurora Ottantotto Ebanite（88 Ebanite）",
    expectedStoryTitle: "Aurora Ottantotto Ebanite：88 的硬橡胶限量版本",
    expectedSourceMarker:
      "curated-content:phase356-aurora-ottantotto-ebonite-v1:547054c6604c1ff7a776caa7d4d6cef4457419c32ba0ff0d607a68bd26822be2",
    expectedBodySha256: "f7d572dec3b5bc09602f1cec8ca969a008fbd6b67eb74fad0a35905d9dd29077",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText:
          "Aurora Ottantotto Ebanite 不是把现有 88 Resin 的颜色换成“木纹”，也不是把所有历史 Aurora 88 重新合并为一支笔。它是 Aurora 当前网站单独放在限量版目录里的一个具体版本：以硬橡胶（ebonite）制作笔帽与笔身，用大理石纹理把材料差异直接放到外观上，再按颜色配置铬色或金色饰件。资料库为它建立独立型号，是为了让读者从 Aurora 88 家族、Aurora Ottantotto Resina 800 和 Aurora Ottantotto Millerighe 进入时，能看见材料和表面处理的真正变化。",
        newText:
          "Aurora Ottantotto Ebanite 不是把现有 88 Resin 的颜色换成“木纹”，也不能代表所有历史 Aurora 88。它是 Aurora 官网单独列在限量版目录中的具体版本：笔帽与笔身采用硬橡胶（ebonite），大理石纹理直接呈现材料差异，并按颜色搭配铬色或金色饰件。与 Aurora Ottantotto Resina 800、Millerighe 对照时，最值得留意的正是材料和表面处理的变化。",
        evidenceLocators: ["entity.body_md:L1-L1"],
      },
      {
        oldText:
          "官方随页面提供的 V02 PDF 则出现了另一个口径：蓝色和黄色的单色资料页都写着“3 different colors”（即“三种颜色”），并各自列出产品代码（蓝色 `888-CEB`、黄色 `888-DEY`）和 18K 实金尖；蓝色资料页明确写 rhodium-treated 与 chrome trims，黄色资料页写 gold trims。这个差异不能被悄悄抹平。本文把当前网页的四色作为导航层事实，把 V02 PDF 视为较早或单 SKU collateral，并在来源冲突中记录“颜色数量需按 exact 页面与订单日期复核”。没有足够证据时，不给 Ebanite 一个“总共 888 支”或“每色固定编号”的结论；PDF 中排版相邻的 `888` 不能直接当成限量数量。",
        newText:
          "官方随页面提供的 V02 PDF 则出现了另一个口径：蓝色和黄色的单色资料页都写着“3 different colors”（即“三种颜色”），并各自列出产品代码（蓝色 `888-CEB`、黄色 `888-DEY`）和 18K 实金尖；蓝色资料页明确写 rhodium-treated 与 chrome trims，黄色资料页写 gold trims。这个差异不能被悄悄抹平。当前网页显示四色，而 V02 PDF 可能较早，或只针对单一商品号；购买时应按具体页面、商品号和订单日期复核颜色。没有足够证据时，也不能断言 Ebanite “总共 888 支”或“每色固定编号”，因为 PDF 中排版相邻的 `888` 不能直接当成限量数量。",
        evidenceLocators: ["entity.body_md:L7-L7"],
      },
    ],
  },
  {
    manifestIndex: 13,
    entityId: "phase114-aurora-ottantotto-resina-800",
    brandEntityId: "CJXe8UpnkHLJ",
    slug: "aurora-ottantotto-resina-800",
    expectedName: "Aurora Ottantotto Resina (800)",
    expectedStoryTitle: "Aurora Ottantotto Resina 800：黑树脂、金色饰件与证据边界",
    expectedSourceMarker:
      "curated-content:phase410-aurora-ottantotto-resina-800-refresh-v1:2eb28ba38b14f550b4fb337e905d282c4cddae76820d007efc26559a8c601bf8",
    expectedBodySha256: "c8e6aff6a0381a986b55171d48bace6765ac464be5e66c14de3d787fbe77e697",
    dimensions: ["introduction"],
    defectCodes: ["public_internal_editorial_language"],
    replacements: [
      {
        oldText: "## current 800 的规格：哪些可以写，哪些要留空",
        newText: "## 商品号 800 的规格：哪些可以确认，哪些仍要留空",
        evidenceLocators: ["entity.body_md:L25-L29"],
      },
      {
        oldText: "### 可以直接从当前商品页写出的字段",
        newText: "### 当前商品页直接列出的信息",
        evidenceLocators: ["entity.body_md:L25-L29"],
      },
      {
        oldText: "| 字段 | 商品号 800 的当前页面口径 | 作用域说明 |",
        newText: "| 项目 | 商品号 800 的当前页面说明 | 阅读边界 |",
        evidenceLocators: ["entity.body_md:L25-L29"],
      },
      {
        oldText:
          "本页因此把 nib 字段写成“当前页面列 EF/F/M/B；官方 FAQ 与目录将高端 88／800 路线置于 14K 语境”，而不是写成“当前每个尖号都必然是同一批次的 14K”。购买时应看笔尖本体刻字、保修卡和 exact 商品说明；二手市场把“88”写成 14K，并不能替代实物证据。",
        newText:
          "因此，最稳妥的说法是“当前页面列 EF/F/M/B；官方 FAQ 与目录把高端 88／800 路线放在 14K 语境中”，而不是断言“现在每个尖号都必然来自同一批次、都是 14K”。购买时应核对笔尖本体刻字、保修卡和对应商品说明；二手市场只写“88”“14K”，不能替代实物证据。",
        evidenceLocators: ["entity.body_md:L48-L48"],
      },
      {
        oldText:
          "官网商品卡同时显示了价格、可选笔尖和 Disponibile，这三个字段的生命周期并不一样。商品号和型号名称通常是身份字段；价格会受税区、汇率、活动和页面改版影响；“可购”则可能在下一次补货或地区切换后立即改变。因而页面保存时要把检索日写进证据作用域，并把“意大利市场、不含运费”原样保留。读者看到 €650 时，应该理解为“在该日期从 Aurora 意大利站看到的建议价”，而不是二手行情、全球建议零售价或保证成交价。",
        newText:
          "官网商品卡同时显示价格、可选笔尖和 Disponibile，但三者的有效期并不相同。商品号和型号名称通常较稳定；价格会受税区、汇率、活动和页面改版影响；“可购”也可能随补货或地区切换立即改变。因此，€650 只能理解为检索当日 Aurora 意大利站显示、且不含运费的价格，不能当作二手行情、全球建议零售价或保证成交价。",
        evidenceLocators: ["entity.body_md:L80-L80"],
      },
      {
        oldText:
          "这种来源分层还保护了图片。若未来要补照片，先查清照片到底是 800、800-C、Millerighe、Auroloide 还是限量色，并记录原作者、授权和采集日期；不能因为一张图片标题写了 “Aurora 88” 就把它放在 800 页。没有可合法再分发的 exact 照片时，继续使用本站原创 factual SVG 是更诚实的选择。示意图的价值在于导航和证据边界，而不是伪装成产品摄影。",
        newText:
          "图片也要按具体型号核对。补充照片前，应确认画面究竟是 800、800-C、Millerighe、Auroloide 还是限量色，并记录原作者、授权和采集日期；不能因为标题写着“Aurora 88”就认定它是商品号 800。没有可合法再分发的对应照片时，保留原创信息示意图更诚实；它只帮助理解差异，不伪装成产品摄影。",
        evidenceLocators: ["entity.body_md:L108-L114"],
      },
      {
        oldText:
          "这份克制并不让页面变薄。它反而把商品页、目录、历史、评测和二手核对各自放在正确位置：商品号回答“是哪一支”，目录回答“高端路线和相邻编号如何分开”，FAQ 回答“活塞和隐藏备用墨仓怎样使用”，评测回答“某个样本写起来怎样”，原创示意图回答“本站图像表达什么、没有表达什么”。当未来 Aurora 修改价格、库存或商品描述时，只需追加新的日期作用域，不必重写 1947 家族史，也不必把 2007 年 800/C 的测量假装成今天的 800。",
        newText:
          "保留这些不确定性并不会让介绍变薄：商品号回答“是哪一支”，目录说明高端路线和相邻编号怎样区分，FAQ 解释活塞与隐藏备用墨仓的使用，评测只描述具体样本，原创示意图则帮助读者看清信息边界。以后 Aurora 若修改价格、库存或商品说明，只需补上新的日期，不必重写 1947 年的家族史，也不能把 2007 年 800/C 的测量当成今天商品号 800 的统一规格。",
        evidenceLocators: ["entity.body_md:L108-L114"],
      },
    ],
  },
] satisfies readonly Phase610SemanticPatch[];

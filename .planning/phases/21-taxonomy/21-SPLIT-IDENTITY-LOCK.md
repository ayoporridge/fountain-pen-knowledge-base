---
phase: 21-taxonomy
document: split-identity-lock
status: locked
date: 2026-07-19
scope: Phase21
---

# Phase 21：Mixed / Generic 型号身份锁定

## 目的与边界

本文锁定 Phase 21 中 Waterman、Opus 88、Leonardo、Aurora 四组 mixed / generic 记录的 canonical 身份、slug、ID continuity、旧路由和 payload 分配规则。实现与计划不得再根据名称顺序、slug 相似度或品牌页内容自行选择 survivor。

本轮核验只使用：

- `.planning/research/V1.2-MODEL-COVERAGE.md`；
- Phase 19 的 305-row `inventory-readiness-v2.ndjson`；
- Phase 21 的 `21-UI-SPEC.md`、`21-IDENTITY-RESEARCH.md`、`21-RESEARCH.md`；
- 本文逐项列出的厂商官网、官方目录或专业零售资料。

没有打开或查询受保护的 SQLite。本文只锁定身份与迁移决策，不授权发布；所有新增或受影响实体仍须保持 draft，直到独立通过内容、证据、媒体和 review gate。

## Inventory 基线

Phase 19 inventory snapshot：

`sha256:17e1f1bc8cc4bfdcf490c7a7f48d97154d6449e0800f60cc3e9a9e88f9177ba4`

| Case | Existing brand | Existing mixed / generic row | Exact old slug |
|---|---|---|---|
| Waterman | `zkAu9PePDdqJ` / `waterman` / `威迪文 (Waterman)` | `gwKClNnwt3V3` / `威迪文 Waterman 查尔斯顿 Hemisphere` | `威迪文-waterman-查尔斯顿-hemisphere` |
| Opus 88 | `I6tjleAZx9RU` / `opus88` / `Opus 88` | `dTCUDu03vrI6` / `Opus 88 Demo/Kolora` | `opus-88-demo-kolora` |
| Leonardo | `g5r4udSOYhI5` / `leonardo` / `Leonardo` | `s0HAxT1gsHxh` / `Leonardo Furore / Momento Magico` | `leonardo-furore-momento-magico` |
| Aurora | `CJXe8UpnkHLJ` / `aurora` / `奥罗拉 (Aurora)` | `G9ptvLpfyzNQ` / `奥罗拉 Aurora —` | `奥罗拉-aurora` |

下列八个 canonical slug 已对 Phase 19 的 305-row ledger 做 exact-match 核验，当前均无碰撞：

1. `waterman-hemisphere`
2. `waterman-charleston`
3. `opus-88-demo`
4. `opus-88-koloro`
5. `leonardo-furore`
6. `leonardo-momento-magico`
7. `aurora-88`
8. `aurora-optima`

## 全局锁定规则

1. 只有本文明确指定 continuity winner 的 case 才能保留旧 entity ID。
2. 含混 mixed donor 如果不能唯一指向一个 child，必须 `retired`，旧 route 为 404；不得按名称出现顺序选择 child，也不得自动 fallback 到品牌页。
3. Split 不能把整份 story、spec、claim、citation、source、media、tag 或 relation 复制给所有 outputs。每条 payload 必须只分配给一个证据支持的 output。
4. 同时适用于两个 outputs 的来源背景可在新的、独立 ID 下重建；含混事实留在 retired source 或进入 pending/open conflict，不得双投。
5. 新 outputs 使用永久新 ID，保持 draft；旧 content review、approved hash 与 publication review 不继承。
6. 每个 pen output 必须恰好有一条 canonical `made_by`，目标为本文锁定的 existing brand ID。
7. Display name 保留正确的重音符号；ASCII slug 使用本文锁定形式，不由 runtime 再次 transliterate。

---

## 1. Waterman：旧 ID 连续承接 Hémisphère

### Canonical outputs

| Field | Hémisphère | Charleston |
|---|---|---|
| canonical 中文 | `威迪文 Waterman Hémisphère` | `威迪文 Waterman Charleston` |
| canonical English | `Waterman Hémisphère` | `Waterman Charleston` |
| canonical slug | `waterman-hemisphere` | `waterman-charleston` |
| entity action | `split + rename`；保留 `gwKClNnwt3V3` | `create`；分配永久新 ID |
| brand relation | `made_by -> zkAu9PePDdqJ` | `made_by -> zkAu9PePDdqJ` |
| initial publication | draft | draft |

### Continuity 与旧路由

`gwKClNnwt3V3` 明确保留给 Hémisphère。checked-in coverage 已明确说明旧页“正文实际写 Hémisphère；Charleston 是另一历史型号”，因此 Hémisphère 是唯一有证据的 continuity winner。

旧路由处理：

```text
/pen/威迪文-waterman-查尔斯顿-hemisphere
  -> permanent redirect
/pen/waterman-hemisphere
```

只有 `gwKClNnwt3V3` 以 Hémisphère 身份重新通过 publication gate 后才启用 redirect；在此之前旧路由与两个 canonical route 都保持 404/draft。

Charleston 必须使用新 ID 和独立内容，不得继承整份旧 Hémisphère 正文。

### Payload assignment

- 明确描述现行 Hémisphère、细长轮廓、Hémisphère 产品页或现行 SKU 的 row 分配给 `gwKClNnwt3V3`。
- 明确描述 Charleston、Art Deco、Hundred Year Pen 造型渊源或 Charleston 历史 SKU 的 row 分配给新 Charleston ID。
- 同一句或同一 spec 同时混用 Charleston 与 Hémisphère 时不得猜测；拆写为有独立来源的新 row，或留作 pending conflict。
- 旧 hero/media 只有在图中型号可被证据唯一识别时才能迁移；无法识别时不得给任一 output。
- 两页均重新生成 story、content hash 与 reviews。

### 证据 URL

- Waterman 当前 Hémisphère 官方集合：<https://www.waterman.com/pens/h%C3%A9misph%C3%A8re/>
- Waterman Hémisphère 官方产品页：<https://www.waterman.com/pens/h%C3%A9misph%C3%A8re/h%C3%A9misph%C3%A8re/h%C3%A9misph%C3%A8re-fountain-pen/SAP_2214204.html>
- Waterman 当前官方 collections：<https://www.waterman.com/pen-collections.html>
- Waterman 2014 官方 trade catalogue 的地区镜像：<https://www.watermanromania.ro/cataloage1/Waterman/Waterman-2014Brochure.pdf>

现行官网把 Hémisphère 作为独立产品线；历史 trade catalogue 把 Charleston 与 Hémisphère 列为不同系列。目录镜像可证明产品身份分离，但不能单独证明当前在售状态。

### 未锁定字段

- Charleston 的精确上市与停产年份；
- Charleston 历史配色、SKU 与各年份完整规格；
- 旧 payload 中是否仍混有 Charleston 专属 spec、claim 或 media；
- 任何仅由旧目录支持、但被写成当前在售事实的时态。

---

## 2. Opus 88：Demo 与 Koloro 独立，mixed donor 退役

### Canonical outputs

| Field | Demo | Koloro |
|---|---|---|
| canonical 中文 | `Opus 88 Demo` | `Opus 88 Koloro` |
| canonical English | `Opus 88 Demo` | `Opus 88 Koloro` |
| canonical slug | `opus-88-demo` | `opus-88-koloro` |
| entity action | `create`；永久新 ID | `create`；永久新 ID |
| brand relation | `made_by -> I6tjleAZx9RU` | `made_by -> I6tjleAZx9RU` |
| initial publication | draft | draft |

### Donor 与旧路由

现有 `dTCUDu03vrI6` 是两个型号的 mixed donor，不能诚实选择一个 continuity winner，必须 `retired`。

```text
/pen/opus-88-demo-kolora -> 404; no redirect
```

`Kolora` 是错误拼写，不建立 visible alias。旧 mixed route 不 redirect 到任一 child，也不 redirect 到 `/brand/opus88`。

### Payload assignment

- 明确描述大型 Demonstrator / Demo、对应大号外形或该型号 SKU 的 row 分配给 `opus-88-demo`。
- 明确描述普通 Koloro、其独立尺寸/材料/型号 SKU 的 row 分配给 `opus-88-koloro`。
- 市场上曾使用 `Koloro Demo` / `Koloro Demonstrator` 指称较大的 Demonstrator 或年度特别版；在没有厂商一手年份与 SKU 证据前，不得把该文本全局设为普通 Koloro alias。
- 旧 mixed story/spec/media 不得复制两份；不能唯一辨认的 row 留在 retired donor 或 pending conflict。
- Omar、Jazz 和其他 Opus 88 型号不是本次 split outputs。

### 证据 URL

- 台湾专业零售商 Tylee 的 Opus 88 型号集合：<https://www.tylee.tw/index.php?path=496_523_567_246&route=product%2Fcategory>
- EndlessPens 型号与 nib compatibility 表：<https://endlesspens.com/collections/opus-88/availability_in-stock>
- Stilo e Stile — Opus 88 Demonstrator：<https://www.stiloestile.com/en/fountain-pens/demonstrator/opus-88-demonstrator-fountain-pen-color>
- Stilo e Stile — Opus 88 Koloro：<https://www.stiloestile.com/en/fountain-pens/demonstrator/opus-88-koloro-fountain-pen-black>
- 厂商站点入口：<https://www.jingi.com.tw/>

Tylee、EndlessPens 与 Stilo e Stile 均把 Demo/Demonstrator 与 Koloro 作为不同型号。厂商站点在本次核验时存在 TLS/404 异常，不能据其 live page 锁定历史 alias 年代。

### 未锁定字段

- `Demo`、`Demonstrator`、历史 `Koloro Demo` 的厂商官方 alias 与有效期边界；
- 年度 Demo 特别版与普通 Demo 的完整 SKU hierarchy；
- 旧 mixed payload 中是否夹有其他 Opus 88 型号事实。

---

## 3. Leonardo：Furore 与 Momento Magico 独立，mixed donor 退役

### Canonical outputs

| Field | Furore | Momento Magico |
|---|---|---|
| canonical 中文 | `Leonardo Furore` | `Leonardo Momento Magico` |
| canonical English | `Leonardo Furore` | `Leonardo Momento Magico` |
| canonical slug | `leonardo-furore` | `leonardo-momento-magico` |
| entity action | `create`；永久新 ID | `create`；永久新 ID |
| brand relation | `made_by -> g5r4udSOYhI5` | `made_by -> g5r4udSOYhI5` |
| initial publication | draft | draft |

### Donor 与旧路由

现有 `s0HAxT1gsHxh` 同时命名两个独立型号，没有唯一 continuity winner，必须 `retired`。

```text
/pen/leonardo-furore-momento-magico -> 404; no redirect
```

旧 mixed route 不 redirect 到任一 child，也不 redirect 到 `/brand/leonardo`。

### Payload assignment

- 普通 Furore 使用官方 Furore collection 的标准型号边界；明确的 Furore row 分配给 `leonardo-furore`。
- Momento Magico 是官方独立 collection，具独立 piston-filler 身份；对应 row 分配给 `leonardo-momento-magico`。
- `Furore Grande` 是官方另列的 piston-filling 分支。旧 payload 若描述 Grande，不能静默归入普通 Furore，必须保留为未决 row 或另行进入 coverage action。
- `Momento Zero` 是 coverage 中另一缺项，不属于当前 donor 的 split outputs。
- 旧 mixed story/spec/media 不得双投，所有 outputs 重新生成 hash 与 reviews。

### 证据 URL

- Leonardo 官方 Furore collection：<https://leonardopen.com/collections/furore-collection>
- Leonardo 官方 Furore 产品页：<https://leonardopen.com/products/furore-aquapetra-steel-nib>
- Leonardo 官方 Furore Grande collection：<https://leonardopen.com/collections/furore-grande>
- Leonardo 官方 Momento Magico collection：<https://leonardopen.com/collections/momento-magico>
- Leonardo 官方 Momento Magico 产品页：<https://leonardopen.com/products/momento-magico-matte-black>

官方资料把普通 Furore 与 Momento Magico 列为不同 collection；普通 Furore 产品页记录 screw converter，Momento Magico 产品页记录 1.5 ml piston filler。Furore Grande 又由官网单独列为 piston-filling 分支。

### 未锁定字段

- 旧 mixed payload 中的 Furore 指标准型号还是 Furore Grande；
- 旧媒体实际展示哪个型号或版本；
- Furore 新旧 design 的完整代际时间范围。

---

## 4. Aurora：generic pen 退役，只建立 88 与 Optima

### Canonical outputs

| Field | Aurora 88 | Aurora Optima |
|---|---|---|
| canonical 中文 | `奥罗拉 Aurora 88` | `奥罗拉 Aurora Optima` |
| canonical English | `Aurora 88` | `Aurora Optima` |
| canonical slug | `aurora-88` | `aurora-optima` |
| entity action | `create`；永久新 ID | `create`；永久新 ID |
| brand relation | `made_by -> CJXe8UpnkHLJ` | `made_by -> CJXe8UpnkHLJ` |
| initial publication | draft | draft |

### Generic row 与旧路由

现有 `G9ptvLpfyzNQ` 只是一条错误放在 pen route 下的品牌级 generic placeholder，不是 88 或 Optima 的 continuity winner，必须 `retired`。generic hero、story、spec、tag、claim、source 和 media 均不得继承给任一型号。

旧 route 只允许做 entity-type correction：

```text
/pen/奥罗拉-aurora
  -> permanent redirect only when public
/brand/aurora
```

- `/brand/aurora` 属于 `public_entities` 时才启用 redirect；
- 品牌未公开时旧 route 为 404；
- 绝不 redirect 到 `/pen/aurora-88` 或 `/pen/aurora-optima`；
- generic entity 无论 route 状态如何始终 retired。

本次 generic replacement 的精确 outputs 只有 Aurora 88 与 Aurora Optima。现行 Aurora 官网还有其他产品线，但不得借“等”字静默加入本 action 或改变 109-row denominator。

### Payload assignment

- 新 Aurora 88 与 Optima 内容从各自型号级来源重新建立，不迁移 generic brand prose。
- 88 的 1947 历史与当前 Ottantotto 可在同一 family-level canonical 下用 timeline/version 表达；在后续证据未锁定前，不生成 88 Piccola 或限量 88 的独立 canonical model。
- Optima Auroloide 与 Optima Resina 先作为 Optima 下的 material/product variants，不因饰面直接新增 model。
- generic row 的品牌历史只保留在 brand page 的新、独立 payload；不复用旧 pen story ID 或 review。

### 证据 URL

- Aurora 官方 88 / Ottantotto collection：<https://aurorapen.it/categoria-prodotto/penne/ottantotto/>
- Aurora 官方品牌历史：<https://aurorapen.it/la-nostra-storia/>
- Aurora 官方 Optima collection：<https://aurorapen.it/categoria-prodotto/alto-di-gamma/optima/>
- Aurora 官方 Optima Auroloide 产品页：<https://aurorapen.it/shop/optima-auroloide-stilografica/>
- Aurora 官方 fountain-pen catalogue：<https://aurorapen.it/product-typology/stilografica/>

官网将 88/Ottantotto 与 Optima 作为不同产品体系，并分别列出当前钢笔产品。官方历史把 1947 年 88 与当前持续生产的型号身份连接起来。

### 未锁定字段

- Aurora 88 页面覆盖整个 1947 至今 family，还是只覆盖当前 Ottantotto 的最终 editorial scope；
- 88、88 Piccola、限量 88 的完整 family/model/variant 边界；
- Optima Auroloide、Resina 和历史代际的完整有效期与 SKU hierarchy。

---

## Manifest 锁定摘要

| Existing ID | Source action | Output / target | Old-route decision |
|---|---|---|---|
| `gwKClNnwt3V3` | `split_retain_as` | `waterman-hemisphere`；同 ID | old mixed → Hémisphère after publish |
| new ID | `split_create` | `waterman-charleston` | canonical route only after publish |
| `dTCUDu03vrI6` | `retire_mixed` | none | 404, no redirect |
| two new IDs | `split_create` | `opus-88-demo`, `opus-88-koloro` | canonical routes only after publish |
| `s0HAxT1gsHxh` | `retire_mixed` | none | 404, no redirect |
| two new IDs | `split_create` | `leonardo-furore`, `leonardo-momento-magico` | canonical routes only after publish |
| `G9ptvLpfyzNQ` | `retire_generic` | none | to `/brand/aurora` only when brand public; otherwise 404 |
| two new IDs | `create_from_research` | `aurora-88`, `aurora-optima` | canonical routes only after publish |

## Acceptance assertions

1. 八个 canonical slugs exact-match 唯一，且不与 Phase 19 ledger 中任何 slug 冲突。
2. `gwKClNnwt3V3` 最终 canonical slug 只能是 `waterman-hemisphere`；Charleston 必须是另一永久 ID。
3. Opus 88 与 Leonardo 的 old mixed slugs 始终无 redirect record，直接 404。
4. `G9ptvLpfyzNQ` 不在 active canonical set；其旧 route 最多一跳到 public `/brand/aurora`，绝不进入型号 route。
5. 三个 retired donor/generic rows 的 story/spec/claim/media/review ID 不会被整份复制到 outputs。
6. 每个新增 pen output 恰好有一个本文锁定的 canonical brand relation。
7. 所有 outputs fresh review 前均不属于 `public_entities`，brand page 型号计数只随各 output 独立发布而增加。
8. Waterman old route 最多一跳到 Hémisphère；H1、breadcrumb、canonical link、metadata 与 JSON-LD 均显示 `威迪文 Waterman Hémisphère`，不再出现 Charleston。

## 对既有 Phase 21 文档的优先级

本文是四组 split/generic case 的后续 locked decision。若与较早的 `21-UI-SPEC.md` 或 `21-RESEARCH.md` 冲突，以本文为准，尤其是：

- Opus 88 old mixed slug：不再采用 brand fallback，固定 404/no redirect；
- Leonardo old mixed slug：不再采用 brand fallback，固定 404/no redirect；
- Waterman old mixed slug：因 continuity winner 已证明，固定 redirect 到 Hémisphère；
- Aurora generic old slug：只允许在 canonical brand public 时 redirect 到 brand，永不选择 88 或 Optima。

---
phase: quick
plan: 260713-7u5
slug: fountain-pen-graph-seo-vercel
verified: 2026-07-12T23:31:17Z
status: passed
score: 14/14 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 11/14
  gaps_closed:
    - "媒体代理把实际 HTTPS 连接固定到已验证公网 IP，并复核 remoteAddress，关闭 DNS rebinding TOCTOU。"
    - "移动导航打开时 trigger 与全部背景控件真正 inert/aria-hidden/移出 tab order，关闭后完整恢复并回焦。"
  gaps_remaining: []
  regressions: []
---

# Fountain Pen Graph 全站体验与生产质量复验报告

**目标：** 复核 `VERIFICATION.md` 的两项阻塞 gap 是否在新产品 release 中真实修复并上线，同时抽查其余 must-haves 无回归。

**结论：** `passed`。产品 release `264c1c2fb8e126fba07d8c541f0818385fe316c5` 已部署到当前 production alias；原 DNS rebinding 与移动导航背景可聚焦缺口均通过代码追踪、定向回归和 production live probe 闭环。其余入口、搜索、SSR、公开可见性、详情图谱、SEO、缓存与发布边界抽查无回归。

## Re-verification Result

| 原 gap | 修复状态 | 独立证据 |
| --- | --- | --- |
| DNS preflight 与真实连接未绑定 | ✓ CLOSED | `https.request` 的自定义 `lookup` 只返回已验证 IP；`agent:false` 禁止连接复用；TLS `servername` 与 `checkServerIdentity` 使用原 hostname；`Host` 保留原 URL host；`secureConnect` 和响应回调两处验证 `remoteAddress` 等于 pinned IP 且不是私网/保留地址。 |
| 现有“DNS rebinding”测试只测首次私网解析 | ✓ CLOSED | 新测试明确模拟 resolver 返回 `8.8.8.8`，transport 却报告连接到 `127.0.0.1`，期望 403；定向 Playwright media 合约通过。 |
| MobileNav trigger 仍是 dialog 外可聚焦背景 | ✓ CLOSED | trigger 已加入背景集合，打开时 `inert=true`、`aria-hidden=true`、`tabIndex=-1`；cleanup 恢复原属性，单独 effect 在 DOM 恢复后回焦。 |
| 移动 dialog 测试未枚举外部 focusable | ✓ CLOSED | 新测试枚举所有可见 focusable，排除 dialog 内元素后要求数组为空，并验证 trigger 打开/关闭状态。 |

## Media Security Trace

### DNS、连接与 TLS

1. `resolvePublicHostname()` 对 hostname 执行 A/AAAA lookup；任一结果为空、私网、loopback、link-local、ULA、multicast 或 reserved 即拒绝。
2. 每一轮请求从已验证结果选取一个 pinned address；每次 redirect 都回到循环顶部重新解析、验证并 pin 新 hostname。
3. `defaultFetcher` 使用 `https.request`：
   - 自定义 `lookup` 只交付 pinned address；
   - `family` 与 pinned address 一致；
   - `agent:false` 防止复用其他目标连接；
   - `Host` 是原 URL host；
   - `servername` 是原 hostname；
   - `checkServerIdentity` 对原 hostname 做证书 SAN 校验。
4. TLS `secureConnect` 后读取 socket `remoteAddress`，必须为公网且与 pinned address 相同；响应回调在消费响应前再次复核同一不变量。
5. redirect 仍为 manual，最多 3 跳；转向私网、无 Location 或过多跳数均拒绝；响应 MIME、声明长度和实际流仍受 image/* 与 8 MiB 上限保护。

### 独立行为证据

- 定向回归命令在 production baseURL 下得到 `4 passed`；其中 assertion-bearing 的 desktop media 测试与 mobile dialog 测试均通过，另两个 project 组合由源码 guard 快速返回。
- 本机真实 default transport：
  - YouTube approved media：200 `image/jpeg`，58,353 bytes；
  - Richard's Pens legacy media：200 `image/jpeg`，9,517 bytes。
- 证书负例：`wrong.host.badssl.com` 被拒绝，错误明确为 hostname 不匹配 certificate altnames，证明 TLS 证书仍按原 hostname 验证，而不是因 IP pinning 降级。
- production image proxy：approved id 200 image/jpeg、unknown id 404、非白名单 URL 403、127.0.0.1 403、Richard's Pens legacy 200 image/jpeg。

## Mobile Dialog Production Probe

在 390×844、touch viewport 的当前 production alias 上打开 MobileNav：

```text
outside focusable: []
trigger while open: inert=true, aria-hidden=true, tabIndex=-1
body overflow while open: hidden
Escape after close: focused=true, inert=false, aria-hidden=null, tabIndex=0
console/page errors: 0
```

抽屉 slide-in 动画完成后 document width 回到 390px；打开期间 body scroll lock 生效，关闭后清理恢复。定向 mobile Playwright 合约同时验证焦点循环、Escape、属性恢复和回焦。

## Goal Achievement

### Observable Truths

| # | Must-have | 状态 | 复验证据 |
| --- | --- | --- | --- |
| 1 | 保全实施前脏工作树，不覆盖既有成果 | ✓ VERIFIED | 原 baseline manifest、allowlist 与 release ancestry 保持完整；本轮修复仅改 media、MobileNav、测试和规划证据。 |
| 2 | 首页三个入口确定可用，500 以内为 entry+mid OR，823/743 使用真实 slug | ✓ VERIFIED | production 关键页面均 200；预算入口仍返回 6 项；823/743 搜索仍同时命中真实 slug。 |
| 3 | 中文搜索解析意图并逐级召回，预算结果逐项满足 facet | ✓ VERIFIED | production budget intent 仍为 pen + origin-japan + gold + max_price=500；6/6 detail tags 均满足 Japan、gold、entry/mid。 |
| 4 | 首页/图书馆/浏览/搜索首屏与缓存策略 | ✓ VERIFIED | SSR 实现未改；home/library/browse API/search API 连续三次均 edge HIT，warm 请求约 69–168 ms。 |
| 5 | 媒体 id/legacy 代理限制 DNS/redirect/protocol/MIME/size 并降级 | ✓ VERIFIED | 连接 IP pinning、Host/SNI/TLS、remoteAddress 双复核和每跳重验均存在；rebinding/redirect/MIME/size 定向测试与真实媒体请求通过。 |
| 6 | 所有公开实体与 links GET 共用 public visibility | ✓ VERIFIED | 4 个隐藏品牌和动态 marker article 的 detail/preview/tags/links 继续全部 404；公开 823 的一跳/二跳 links 无隐藏 id/slug。 |
| 7 | 详情首屏、证据、来源、面包屑、全宽图谱和具体推荐理由 | ✓ VERIFIED | 相关文件未被 gap closure 修改；production 详情和 graph 继续 200，既有 live/E2E 证据有效。 |
| 8 | 导航 active、图谱入口、移动抽屉焦点/背景/滚动契约 | ✓ VERIFIED | production dialog 外 focusable=0；trigger 打开状态和 Escape cleanup/回焦全部精确通过。 |
| 9 | 全站 focus-visible、无明显水平溢出或不可达控件 | ✓ VERIFIED | 全局 focus/reduced-motion 未改；mobile dialog 动画结束后 width=viewport，背景滚动锁定，定向测试无 browser error。 |
| 10 | root/逐页 canonical/首页 JSON-LD/noindex/sitemap 契约 | ✓ VERIFIED | 13 个 indexable route 仍 self canonical；首页 1 个 WebSite JSON-LD、详情 2 个实体/面包屑 JSON-LD；search/chat/compare noindex。 |
| 11 | baseline、allowlist、干净 release 与单一发布路径 | ✓ VERIFIED | release allowlist 纳入 verifier 报告；产品 SHA 与当前 deployment 记录一致；gap closure 只走一次 CLI production deployment。 |
| 12 | Playwright 支持本地/外部 production，desktop/mobile 与 skip 门禁正确 | ✓ VERIFIED | `E2E_BASE_URL` 外部模式未启动 webServer；源码仍为原 12 个 skip；定向两项回归在 desktop/mobile project 组合下 4/4 通过。 |
| 13 | lint/build/数据契约/完整 E2E 与浏览器 QA 通过 | ✓ VERIFIED | 本轮 lint、tsc 退出 0，仅既有 CSS warning；Vercel build Ready；SUMMARY 与 last-run 记录 production desktop+mobile 26/0 和完整 E2E 通过。 |
| 14 | production alias 指向本次 release，生产行为 live truth 全通过 | ✓ VERIFIED | Vercel inspect：`dpl_68z7JdSwSu9nbjoQ8JQvaKnmR1ZY` Ready，alias 指向 immutable `93dr3o9ic`；新 gap closure 与其余 live smoke 全部通过。 |

**Score:** 14/14 must-haves verified.

## Regression Spot-Checks

| 检查 | 结果 | 状态 |
| --- | --- | --- |
| `git diff --check`、验收前工作树 | 通过 / 干净 | ✓ |
| `pnpm lint` | 0 error；仅既有 `globals.css:802` warning | ✓ |
| `pnpm exec tsc --noEmit` | exit 0 | ✓ |
| 定向 media + mobile dialog Playwright | 4 passed / 0 failed | ✓ |
| production 页面 | `/`、library、browse、search、graph、823 detail、Pilot brand、sitemap、robots 均 200 | ✓ |
| production budget search | 6/6 facet 满足；intent 精确 | ✓ |
| production 823/743 search | 两个真实 slug 均存在 | ✓ |
| production hidden API | 5 个代表 hidden entity 的 detail/preview/tags/links 全部 404 | ✓ |
| production public links | 无隐藏 id/slug | ✓ |
| production media | approved/legacy 200；unknown 404；bad host/private IP 403 | ✓ |
| production SEO | canonical、JSON-LD、noindex、sitemap 排除均正确 | ✓ |
| production cache | 四个 surface 三次请求全部 HIT | ✓ |
| production MobileNav | outsideFocusable=0；trigger 生命周期精确；0 browser error | ✓ |

## Release and Deployment Evidence

- 产品 release SHA：`264c1c2fb8e126fba07d8c541f0818385fe316c5`。
- 当前 repository HEAD/origin：`a407c45ce628161aad71b625076d023d05a93787`；其相对产品 release 只更新 STATE 与 SUMMARY，不改变 production 产品文件。
- Vercel project：`prj_i046gsxTEqsWGYQzVq35D71QtaHU` / `aljo233/fountain-pen-graph`。
- production deployment：`dpl_68z7JdSwSu9nbjoQ8JQvaKnmR1ZY`。
- immutable URL：`https://fountain-pen-graph-93dr3o9ic-aljo233.vercel.app`。
- alias：`https://fountain-pen-graph.vercel.app`，Vercel inspect 状态 Ready。
- 新 production 的正常媒体、移动 dialog 和其他关键 API/SEO 响应均体现 gap closure release 行为。

## Anti-Patterns Found

本轮修改未发现 stub、未接线逻辑或新增的无 issue `TBD`/`FIXME`/`XXX`。第一次报告中的两个 blocker 已关闭；未发现回归 blocker。

## Human Verification Required

None — 两个原 gap 和其余 must-haves 均已有代码、自动化与当前 production 行为证据。

## Gaps Summary

**No gaps found.** 原 `VERIFICATION.md` 保持历史 `gaps_found` 记录；本文件是新 release 的独立复验结论。14/14 must-haves 已通过，production alias 当前可作为本任务完成状态。

---

*Verification approach: re-verification from prior structured gaps, code/data-flow trace, targeted automated regression, real TLS/media requests, production HTTP/browser probes, and Vercel live inspection.*

---
phase: quick
plan: 260713-7u5
slug: fountain-pen-graph-seo-vercel
verified: 2026-07-12T23:10:32Z
status: gaps_found
score: 11/14 must-haves verified
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "批准媒体代理会在真实网络连接上抵抗 DNS rebinding，并在每次重定向前后只连接已验证的公网地址。"
    status: failed
    reason: "实现先用独立 DNS lookup 检查 hostname，随后仍把原 hostname 交给 fetch 再次解析；检查和连接之间没有 IP pinning，存在 DNS rebinding 的 TOCTOU 窗口。现有测试只覆盖首次 resolver 直接返回私网地址，没有模拟检查时公网、连接时私网。"
    artifacts:
      - path: "src/lib/media-url.ts"
        issue: "assertPublicHostname() 校验得到的地址没有传给 fetchExternalImage() 的实际连接。"
      - path: "tests/e2e/site-quality.spec.ts"
        issue: "名为 DNS rebinding 的测试实际上只验证 resolver 返回 127.0.0.1 时会拒绝。"
    missing:
      - "让实际 HTTP/TLS 连接使用已验证并固定的 IP，同时保留正确的 Host/SNI；每次 redirect 都重新解析、校验并固定。"
      - "增加检查阶段返回公网 IP、连接阶段尝试私网 IP 的可复现测试，证明第二次 DNS 解析无法绕过门禁。"
  - truth: "移动导航抽屉打开后，所有背景控件都不可聚焦、不可被辅助技术访问。"
    status: failed
    reason: "MobileNav 只对 main、footer、header nav 和主题按钮设置 inert/aria-hidden，打开导航的触发按钮仍位于 dialog 外且 inert=false、aria-hidden=false、tabIndex=0。焦点循环能拦住普通 Tab，但没有满足背景整体不可聚焦的契约。"
    artifacts:
      - path: "src/components/MobileNav.tsx"
        issue: "背景集合没有包含 triggerRef 对应按钮；dialog 与 trigger 同处 root，无法通过 inert root 隔离。"
      - path: "tests/e2e/site-quality.spec.ts"
        issue: "测试只连续按 Tab 并确认焦点仍在 dialog，没有枚举 dialog 外仍可聚焦的背景控件。"
    missing:
      - "打开 dialog 时让触发按钮及所有 dialog 外兄弟节点真正 inert/aria-hidden，或把 dialog portal 到 body 后统一 inert 其余 body children。"
      - "增加断言：dialog 打开时不存在任何可见且未 inert/未 aria-hidden 的 dialog 外 focusable；关闭后完整恢复并把焦点送回 trigger。"
---

# Fountain Pen Graph 全站体验与生产质量验收报告

**目标：** 在保留既有 Warm Pen Atlas 视觉与脏工作树成果的前提下，完成入口、搜索、首屏、媒体、公开可见性、详情、图谱、移动端、SEO、E2E 与 Vercel production alias 优化。

**结论：** `gaps_found`。站点主体功能和 production alias 已真实上线，搜索、筛选、公开可见性、SEO、缓存和主要页面 live smoke 均通过；但媒体代理的 DNS rebinding 防护与移动导航的背景不可聚焦仍未满足计划中的硬性 must-have，因此不能写 `passed`。

## Goal Achievement

### Observable Truths

| # | Must-have | 状态 | 关键证据 |
| --- | --- | --- | --- |
| 1 | 实施前完整保全既有脏工作树 | ✓ VERIFIED | `BASELINE-MANIFEST.md` 记录 16 个 tracked dirty、13 个 untracked、逐文件状态与 SHA-256；`63c4e4d..be1cfa9` 仍包含全部基线文件和语义 marker；当前工作树在验收前为空。 |
| 2 | 首页三个入口确定可用，500 以内为 entry+mid OR，823/743 使用真实 slug | ✓ VERIFIED | 首页代码固定三个 href；本地 DB 核实 `pilot-custom-823`/`百乐-pilot-custom-743`；production budget browse 返回 6 个型号，compare/概念入口页面均为 200。 |
| 3 | 中文自然语言搜索解析意图并逐级召回，预算结果逐项满足 facet | ✓ VERIFIED | `parseSearchIntent()`、`searchPublicEntities()` 共用实现且参数化；production 搜索返回 6 项，逐项均为 pen、`origin-japan`、gold group、entry/mid；823/743 同时命中；受控 FTS 缺表 fallback 已实现。 |
| 4 | 首页/图书馆/浏览/搜索首屏与缓存策略 | ✓ VERIFIED | browse/search server page 注入 initialData，loading 为卡片骨架；home/library 与 browse/search API 连续三次均为 edge HIT；本轮 warm 请求约 61–175 ms。 |
| 5 | 媒体代理完整限制 DNS/redirect/protocol/MIME/size 并可安全降级 | ✗ FAILED | approved id、unknown id、host allowlist、私网字面 IP、redirect、MIME 和 8 MiB 限制存在；但 DNS 检查结果未固定到实际连接，不能抵抗真实 DNS rebinding。 |
| 6 | 所有公开实体与 links GET 共用 public visibility | ✓ VERIFIED | 共用 `publicEntityFilter(alias)`；production 对 4 个隐藏品牌和动态 marker article 的 detail/preview/tags/links 均为 404，公开 823 四组 links 无隐藏 id/slug。 |
| 7 | 详情首屏、证据、来源、面包屑、全宽图谱和具体推荐理由 | ✓ VERIFIED | 详情页在两栏之后渲染全宽 LocalGraph；JSON-LD/面包屑/已核规格/证据徽章/来源分级均有真实数据；推荐理由来自 direct/model/tag 关系并公开过滤。 |
| 8 | 导航 active、图谱入口、移动抽屉焦点/背景/滚动契约 | ✗ FAILED | active、`/graph`、Escape、焦点进入/循环/返回和 scroll lock 已实现；production 定向浏览器探针确认导航打开时触发按钮仍是 dialog 外可聚焦背景控件。 |
| 9 | 全站 focus-visible、无明显横向溢出或不可达控件 | ✓ VERIFIED | 全局 3px accent focus-visible、reduced-motion 已实现；现有 E2E 通过；本轮 390×844 的 `/graph` 定向探针 overflow=0、关系列表 20 个链接、0 console/page error。 |
| 10 | root/逐页 canonical/首页 JSON-LD/noindex/sitemap 契约 | ✓ VERIFIED | production 抽查 13 个 indexable route 均 self canonical；首页仅 1 个 WebSite JSON-LD，详情有 2 个实体/面包屑 JSON-LD；search/chat/compare noindex 且不在 sitemap。 |
| 11 | baseline、allowlist、干净 release 与单一发布路径 | ✓ VERIFIED | allowlist 80 个逐文件路径且无通配；`63c4e4d..be1cfa9` 的 77 个变更全部属于 allowlist；deployment JSON 的 `gitSource/meta` 为空，符合 CLI 路径；无 Git integration 叠加部署证据。 |
| 12 | Playwright 可切换本地/外部 production，desktop/mobile 与 skip 门禁正确 | ✓ VERIFIED | config 在 `E2E_BASE_URL` 存在时 `webServer: undefined`；`--list` 为 desktop 99 + mobile site-quality 13，共 112；源码仍只有原有 12 个 skip，未新增。 |
| 13 | lint/build/数据契约/完整 E2E 与浏览器 QA 通过 | ✓ VERIFIED | 本轮复跑 lint、tsc、markdown、data、library、entity-quality 均退出 0（仅既有 CSS warning）；SUMMARY 及 `.last-run.json` 记录 build 和最终测试通过，保留 desktop/mobile 截图。按验收任务要求未重跑长时间完整 E2E。 |
| 14 | production alias 指向本次 release，且所有生产行为 live truth 通过 | ✗ FAILED | alias/deployment/search/visibility/SEO/cache/正常媒体和移动图谱均独立 live 验真，但 production 仍承载 #5 DNS rebinding 和 #8 背景 focusability 缺口，因此“全部通过”不成立。 |

**Score:** 11/14 must-haves verified.

## Required Artifacts

| Artifact | 状态 | 说明 |
| --- | --- | --- |
| `src/lib/search.ts` | ✓ SUBSTANTIVE | 意图解析、参数化召回、稳定排序、精确 FTS 缺表 fallback 均存在。 |
| `src/lib/browse-data.ts` | ✓ SUBSTANTIVE | SSR/API 共用数据查询；跨维度 AND、组内 OR；entry+mid/gold group 正确。 |
| `src/components/EntityCardImage.tsx` | ✓ SUBSTANTIVE | 图片失败后按当前 src 单次降级到统一资料卡。 |
| `src/app/api/image-proxy/route.ts` + `src/lib/media-url.ts` | ⚠️ INCOMPLETE | id/legacy/MIME/size/redirect 基础契约完整；真实连接未 pin 到已验证 IP。 |
| `scripts/audit-public-media.ts` | ✓ SUBSTANTIVE | 默认 dry-run、592 条 SQL 目标、并发审计、JSON/Markdown、apply/remote 双授权与 old/new log 均存在；SUMMARY 记录 0 writes。 |
| `src/lib/public-visibility.ts` | ✓ SUBSTANTIVE | alias-safe SQL helper 与运行时 helper 一致。 |
| `src/app/api/links/route.ts` | ✓ SUBSTANTIVE | center 公开校验，一跳/二跳邻居过滤。 |
| `src/app/graph/page.tsx` | ✓ SUBSTANTIVE | 高连接度公开 hub、局部一跳/二跳探索入口。 |
| `src/app/[type]/[slug]/page.tsx` | ✓ SUBSTANTIVE | 详情层级、来源、面包屑、JSON-LD、全宽图谱、推荐均已接线。 |
| `src/components/LocalGraph.tsx` | ✓ SUBSTANTIVE | 中文关系名、限量节点、深度切换、关系列表兜底。 |
| `src/app/layout.tsx` | ✓ SUBSTANTIVE | 只有 metadataBase/共享模板，无全局 canonical 或首页 JSON-LD。 |
| `BASELINE-MANIFEST.md` / `RELEASE-ALLOWLIST.txt` | ✓ SUBSTANTIVE | 基线与发布边界可相互核对。 |
| `playwright.config.ts` | ✓ SUBSTANTIVE | 外部 baseURL 禁用 webServer；desktop/mobile 分工存在。 |
| `tests/e2e/site-quality.spec.ts` | ⚠️ INCOMPLETE | 大部分关键合约覆盖充分；DNS rebinding 测试名过度声明，移动 dialog 测试没有枚举外部 focusable。 |
| `SUMMARY.md` | ✓ SUBSTANTIVE | release、deployment、门禁、live truth 和已知 Turso FTS 缺表均有记录。 |

## Key Link Verification

| From | To | 状态 | 证据 |
| --- | --- | --- | --- |
| 首页策展入口 | browse/concept/compare | ✓ WIRED | production href 与 DB slug 均核实。 |
| SearchExplorer/page/API | `searchPublicEntities()` | ✓ WIRED | page 首批与 API 后续共用同一函数和 facet 语义。 |
| browse page/API | `getBrowseData()` | ✓ WIRED | SSR initialData 与分页 API 共用实现。 |
| browse media | image proxy / fallback | ⚠️ PARTIAL | 正常 id 和 fallback 已接线；底层真实 DNS rebinding 防护不完整。 |
| entity APIs / links / recommendation / sitemap | public visibility helper | ✓ WIRED | 代码与 production 隐藏内容探针均通过。 |
| detail | LocalGraph / Recommendations | ✓ WIRED | 详情全宽 section 与具体推荐理由已渲染。 |
| Header / MobileNav | `/graph` + active state | ✓ WIRED | desktop/mobile 均有入口和 aria-current。 |
| metadata pages | canonical / JSON-LD / noindex / sitemap | ✓ WIRED | production 逐页抽查通过。 |
| production tests | `E2E_BASE_URL` | ✓ WIRED | 外部模式无 webServer，现有最终 run status 为 passed。 |

## Behavioral Spot-Checks

| 检查 | 结果 | 状态 |
| --- | --- | --- |
| `git status --porcelain=v1 -uall`、`git diff --check` | 验收前为空 / 通过 | ✓ |
| `pnpm lint` | 0 error；既有 `globals.css:802` warning | ✓ |
| `pnpm exec tsc --noEmit` | exit 0 | ✓ |
| markdown/data/library/entity-quality | 80/80；582 entities；0 contract issue | ✓ |
| production budget search + detail tags | 6/6 均满足 Japan + gold + entry/mid | ✓ |
| production hidden detail/preview/tags/links | 5 个代表实体全部 404；公开 links 零泄露 | ✓ |
| production media smoke | approved 200 image/jpeg；unknown 404；bad host/private literal IP 403；legacy 200 | ✓ |
| production SEO smoke | self canonical、首页独占 WebSite、工具页 noindex/sitemap 排除 | ✓ |
| production cache smoke | home/library/browse API/search API 连续 HIT；warm 约 61–175 ms | ✓ |
| production mobile graph targeted probe | overflow 0、20 个关系链接、0 browser error | ✓ |
| production mobile nav background probe | trigger 仍 `inert=false`、`aria-hidden=false`、`tabIndex=0` | ✗ |
| DNS rebinding code/test trace | lookup 与 fetch 两次解析未绑定；测试只覆盖首次私网 | ✗ |
| Vercel inspect | `dpl_Cpu8qUjGvvaEnvo19PpHKFvxjbh7` Ready，alias 指向 `bdn5qh967` | ✓ |

## Release and Deployment Evidence

- 当前 `HEAD` 与 `origin/master`：`a462370cc29258bb04c8039488dbdb64de22508c`。
- production 产品 release：`be1cfa9005b19a85a9ca744a309f34c350287024`。其后的 `a462370` 只改 STATE、SUMMARY 和 E2E hydration 驱动，没有产品代码变化。
- Vercel project：`prj_i046gsxTEqsWGYQzVq35D71QtaHU` / `aljo233/fountain-pen-graph`。
- 当前 alias：`https://fountain-pen-graph.vercel.app`。
- 当前 deployment：`dpl_Cpu8qUjGvvaEnvo19PpHKFvxjbh7`，immutable URL `https://fountain-pen-graph-bdn5qh967-aljo233.vercel.app`，Ready。
- deployment JSON 无 `gitSource`/`meta`，与 SUMMARY 记录的 CLI-only 路径一致。最近两次 production deployment 分别是首次失败验真的 `9zmifqmye` 与用户授权后的修正 `bdn5qh967`；没有 Git+CLI 同 SHA 双来源。
- 生产 Turso 仍无 `entities_fts`；live `823`/预算搜索成功证明受控 LIKE fallback 已部署，但恢复 FTS 性能仍应另做 migration。

## Anti-Patterns Found

| 文件 | 位置 | 问题 | 严重度 | 影响 |
| --- | --- | --- | --- | --- |
| `src/lib/media-url.ts` | 151–180, 232–244 | DNS 校验与实际连接解耦 | 🛑 Blocker | 恶意/失陷域名可在两次解析之间切换到私网地址。 |
| `tests/e2e/site-quality.spec.ts` | 438–457 | “DNS rebinding” 测试仅验证初次私网解析 | 🛑 Blocker | 测试绿灯不能证明真实 rebinding 已防住。 |
| `src/components/MobileNav.tsx` | 83–104, 121–137 | trigger 未纳入背景 inert/aria-hidden | 🛑 Blocker | dialog 外仍有可聚焦、可被辅助技术访问的控件。 |
| `tests/e2e/site-quality.spec.ts` | 703–742 | 只验证 Tab 没逃出，不检查全部背景 focusable | ⚠️ Warning | 无障碍回归无法捕获上述遗漏。 |

新增代码中未发现未关联 issue 的 `TBD`、`FIXME` 或 `XXX` marker。

## Human Verification Required

None — 两个阻塞项均已通过代码追踪和 production 浏览器探针自动复现；应先修复并增加回归测试，再重新验收。

## Gaps Summary

### 1. 真正关闭 DNS rebinding 窗口

- **修复：** 让连接层使用已校验 IP，而不是再次按 hostname 自由解析；保持 TLS SNI/Host 正确，并在每一跳重复同样流程。
- **回归：** 测试 resolver 首次返回公网，连接阶段若尝试私网必须失败；同时保留 redirect 私网、redirect loop、MIME、声明长度和实际流超限用例。
- **验收：** 本地安全测试、lint/tsc/build、媒体 dry-run 通过后重新部署，并复核正常 approved/legacy 图片仍可用。

### 2. 完整隔离移动导航背景

- **修复：** 推荐把 dialog portal 到 `document.body`，打开时统一 inert/aria-hidden 其余 body children；或显式把 trigger 从 accessibility tree/tab order 暂时移除并在 cleanup 完整恢复。
- **回归：** dialog 打开时枚举所有可见 focusable，断言 dialog 外数量为 0；Escape/遮罩关闭后 trigger 恢复且获得焦点。
- **验收：** 390×844 production probe、mobile site-quality、console/page error、overflow 均通过。

完成以上两项后，需要重新生成本报告；只有 14/14 must-haves 和 production alias 上的修正版 live truth 全部通过，状态才能改为 `passed`。

---

*Verification approach: goal-backward, code and data trace, short automated gates, targeted production HTTP/browser probes, and Vercel live inspection.*
*Long-running full E2E and 592-item network media audit were not rerun per verifier assignment; their retained SUMMARY/last-run evidence was cross-checked against code, test inventory, local SQL target count, and current production smoke.*
